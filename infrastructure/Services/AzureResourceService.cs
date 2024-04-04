using Azure.Identity;
using Azure.ResourceManager.Resources.Models;
using Azure.ResourceManager.Resources;
using Azure.ResourceManager;
using Azure;
using OC_Accelerator.Models;
using System.Text;
using Azure.Core;
using Azure.ResourceManager.Storage;
using OC_Accelerator.Helpers;
using Sharprompt;
using Azure.ResourceManager.Storage.Models;
using Microsoft.Extensions.Logging;

public class AzureResourceService
{
    private readonly Random _random = new();
    private readonly IAppSettings _appSettings;
    private readonly WriteEnvVariables _writeEnvVariables;
    private readonly WriteAzSettings _writeAzSettings;
    private readonly AzurePlanOptions _azPlanOptions;

    public AzureResourceService(IAppSettings appSettings, WriteEnvVariables writeEnvVariables, WriteAzSettings writeAzSettings, AzurePlanOptions azPlanOptions)
    {
        _appSettings = appSettings;
        _writeEnvVariables = writeEnvVariables;
        _writeAzSettings = writeAzSettings;
        _azPlanOptions = azPlanOptions;
    }
    
    /// <summary>
    /// Authenticates to Azure via interactive browser prompt, selects the Azure subscription and resource group provided in appSettings.json, creates an app service plan, two web apps, one functions app, warmup slots for each app, a key vault, app configurations, and a storage account.
    /// Writes to .env.local files for both Storefront and Admin apps with populated environment variables to run each application on your local server
    /// </summary>
    /// <returns></returns>
    /// <exception cref="Exception"></exception>
    public async Task<AzResourceGeneratorResponse> CreateAsync(TextWriter logger, string storefrontClientID, string adminClientID, string storefrontDirName, string adminDirName, string funcAppName)
    {
        var nodeDefaultVersion = new AzAppConfig()
        {
            name = "WEBSITE_NODE_DEFAULT_VERSION",
            value = "~20"
        };

        // Write to .env.local files for both admin and storefront directories
        var adminAppConfig = _writeEnvVariables.Run(adminDirName, adminClientID, ApplicationType.Admin);
        adminAppConfig.Add(nodeDefaultVersion);

        var storefrontAppConfig = _writeEnvVariables.Run(storefrontDirName, storefrontClientID, ApplicationType.Storefront);
        storefrontAppConfig.Add(nodeDefaultVersion);

        // Authenticate to Azure
        ResourceGroupResource resourceGroup = await AuthenticateToAzureAsync(logger);
        
        // Build up parameters for ARM template
        var prefix = GenerateRandomString(6, lowerCase: true); // TODO: for local dev only - some resources in Azure are soft delete, so name conflicts arise when creating/deleting/creating the same name

        var appPlanSku = Prompt.Select("Select the desired SKU for your Azure App Service Plan", _azPlanOptions.GetAzureAppPlanSkuValues());
        var storageSku = Prompt.Select("Select the desired SKU for your Azure Storage Account (required to create an Azure Function)", _azPlanOptions.GetAzureStorageSkuValues());
        var storageKind =
            Prompt.Select(
                "Select the desired storage type for your Azure Storage Account (required to create an Azure Function)",
                _azPlanOptions.GetAzureStorageKindValues(storageSku));

        if (appPlanSku == null || storageSku == null || storageKind == null)
        {
            throw new Exception("Must select a SKU for the App Service Plan, as well as a SKU and storage type for your Storage Account");
        }

        var filters = $"substringof('{prefix}', name)";
        try
        {
            object parameters = new
            {
                prefix = new
                {
                    value = prefix.Replace("-", string.Empty).Replace(" ", string.Empty)
                },
                storefrontAppName = new
                {
                    value = storefrontDirName
                },
                adminAppName = new
                {
                    value = adminDirName
                },
                adminAppConfig = new
                {
                    value = adminAppConfig
                },
                storefrontAppConfig = new
                {
                    value = storefrontAppConfig
                },
                storageSkuName = new
                {
                    value = storageSku
                },
                storageKind = new
                {
                    value = storageKind
                },
                appPlanSkuName = new
                {
                    value = appPlanSku
                }
            };

            var armDeploymentContent = BuildArmDeployment("main", parameters);
            await logger.WriteLineAsync("Creating Azure Resources - This can take a few minutes");
            // Create deployment in Azure
            await resourceGroup.GetArmDeployments().CreateOrUpdateAsync(WaitUntil.Completed, prefix, armDeploymentContent);
            
            var results = resourceGroup.GetGenericResources(filter: filters);

            // Find the storage account
            var genericStorageResource = results.FirstOrDefault(r => r.Data.ResourceType.Type == "storageAccounts");
            var storageAccount = (await resourceGroup.GetStorageAccountAsync(genericStorageResource?.Data.Name)).Value;
            var storageAccountKey = storageAccount?.GetKeys()?.FirstOrDefault()?.Value;

            var appPlan = results.FirstOrDefault(r => r.Data.ResourceType.Type == "serverFarms");

            var funcAppConfig = new List<AzAppConfig>()
            {
                new()
                {
                    name = "FUNCTIONS_EXTENSION_VERSION",
                    value = "~4"
                },
                new()
                {
                    name = "FUNCTIONS_WORKER_RUNTIME",
                    value = "node"
                },
                new()
                {
                    name = "AzureWebJobsStorage", 
                    value = $"DefaultEndpointsProtocol=https;AccountName=${storageAccount.Data.Name};AccountKey=${storageAccountKey};EndpointSuffix=http://core.windows.net/"
                },
                nodeDefaultVersion
            };

            object funcParameters = new
            {
                prefix = new
                {
                    value = prefix.Replace("-", string.Empty).Replace(" ", string.Empty)
                },
                funcAppName = new
                {
                    value = funcAppName
                },
                funcAppConfig = new
                {
                    value = funcAppConfig
                },
                appPlanId = new
                {
                    value = appPlan.Id.ToString()
                }
            };

            var funcArmDeploymentContent = BuildArmDeployment("functionApp", funcParameters);

            // Create deployment in Azure for functions app
            await logger.WriteLineAsync("Creating Azure Functions Resource - This can take a few minutes");
            await resourceGroup.GetArmDeployments().CreateOrUpdateAsync(WaitUntil.Completed, $"{prefix}func", funcArmDeploymentContent);

            results = resourceGroup.GetGenericResources(filter: filters);
            var resourceNames = results.Select(r => $"{r.Data.Name} ({r.Data.ResourceType.Type})");
            await logger.WriteLineAsync($"Created the following Azure Resources: \n{string.Join(Environment.NewLine, resourceNames)}");

            // Write to .vscode/settings.json for the admin and storefront directories
            foreach (var directory in new[] { storefrontDirName, adminDirName })
            {
                var targetAzResource = results.FirstOrDefault(r => r.Data.Name.Contains(directory));
                _writeAzSettings.WriteWebAppSettings(targetAzResource.Id, directory);
            }
            var funcApp = results.FirstOrDefault(r => r.Data.Kind == "functionapp");

            // Write to .vscode/settings.json for the functions directory
            _writeAzSettings.WriteFunctionAppSettings(funcApp.Id, funcAppName);

            return new AzResourceGeneratorResponse()
            {
                azFuncAppName = funcApp?.Data.Name ?? string.Empty,
                azFuncAppUrl = $"https://{funcApp?.Data.Name}.azurewebsites.net", // TODO: fix this
            };
        }
        catch (ArgumentException ex)
        {
            var results = resourceGroup.GetGenericResources(filter: filters);
            if (results.Any())
            {
                bool delete = Prompt.Confirm("Delete resources created in Azure?");
                if (delete)
                {
                    var resourceNames = results.Select(r => r.Data.Name);
                    var selectedResources = Prompt.MultiSelect("Select which resources to delete", resourceNames);
                    foreach (var resource in results.Where(r => selectedResources.Contains(r.Data.Name)))
                    {
                        await resource.DeleteAsync(WaitUntil.Completed);
                    }
                }

            }

            throw new Exception(ex.Message);
        }
    }

    public async Task<Pageable<GenericResource>> ListAsync(TextWriter logger)
    {
        var resourceGroup = await AuthenticateToAzureAsync(logger);
        return resourceGroup.GetGenericResources();
    }

    private async Task<ResourceGroupResource> AuthenticateToAzureAsync(TextWriter logger)
    {
        // Authenticate to Azure
        InteractiveBrowserCredentialOptions credentialOpts = new InteractiveBrowserCredentialOptions();
        if (_appSettings.tenantId != null)
            credentialOpts.TenantId = _appSettings.tenantId;

        await logger.WriteLineAsync("Authenticate to Azure via web browser prompt");
        InteractiveBrowserCredential credential = new InteractiveBrowserCredential(credentialOpts);
        //var token = await credential.GetTokenAsync(new TokenRequestContext()
        //{

        //});
        ArmClient client = new ArmClient(credential, _appSettings.subscriptionId);
        SubscriptionCollection subscriptions = client.GetSubscriptions();
        SubscriptionResource subscription = await subscriptions.GetAsync(_appSettings.subscriptionId);
        ResourceGroupResource resourceGroup = await subscription.GetResourceGroupAsync(_appSettings.resourceGroup);
        return resourceGroup;
    }

    private ArmDeploymentContent BuildArmDeployment(string armTemplateFile, object parameters)
    {
        var properties = new ArmDeploymentProperties(ArmDeploymentMode.Incremental)
        {
            Template = BinaryData.FromString(File.ReadAllText($"../../../Templates/Bicep/{armTemplateFile}.json")),
            Parameters = BinaryData.FromObjectAsJson(parameters)
        };

        return new ArmDeploymentContent(properties);
    }

    private string GenerateRandomString(int size, bool lowerCase = false)
    {
        var builder = new StringBuilder(size);

        // char is a single Unicode character
        char offset = lowerCase ? 'a' : 'A';
        const int lettersOffset = 26; // A...Z or a..z: length = 26

        for (var i = 0; i < size; i++)
        {
            var @char = (char)_random.Next(offset, offset + lettersOffset);
            builder.Append(@char);
        }

        return lowerCase ? builder.ToString().ToLower() : builder.ToString();
    }
}
