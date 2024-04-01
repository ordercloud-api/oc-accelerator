using Azure.Identity;
using Azure.ResourceManager.Resources.Models;
using Azure.ResourceManager.Resources;
using Azure.ResourceManager;
using Azure;
using OC_Accelerator.Models;
using System.Text;
using Azure.ResourceManager.Storage;
using OC_Accelerator.Helpers;
using Sharprompt;
using Azure.ResourceManager.Storage.Models;

public class AzureResourceGenerator
{
    private readonly Random _random = new();
    private readonly IAppSettings _appSettings;
    private readonly WriteEnvVariables _writeEnvVariables;
    private readonly WriteAzSettings _writeAzSettings;

    public AzureResourceGenerator(IAppSettings appSettings, WriteEnvVariables writeEnvVariables, WriteAzSettings writeAzSettings)
    {
        _appSettings = appSettings;
        _writeEnvVariables = writeEnvVariables;
        _writeAzSettings = writeAzSettings;
    }
    
    /// <summary>
    /// Authenticates to Azure via interactive browser prompt, selects the Azure subscription and resource group provided in appSettings.json, creates an app service plan, two web apps, one functions app, warmup slots for each app, a key vault, app configurations, and a storage account.
    /// Writes to .env.local files for both Storefront and Admin apps with populated environment variables to run each application on your local server
    /// </summary>
    /// <returns></returns>
    /// <exception cref="Exception"></exception>
    public async Task<AzResourceGeneratorResponse> RunAsync(TextWriter logger, string storefrontClientID, string adminClientID, string storefrontDirName, string adminDirName, string funcAppName)
    {
        var nodeDefaultVersion = new AzAppConfig()
        {
            name = "WEBSITE_NODE_DEFAULT_VERSION",
            value = "~20"
        };

        // Write to .env.local files for both admin and storefront directories
        var adminAppConfig = _writeEnvVariables.Run(adminDirName, adminClientID, "admin");
        adminAppConfig.Add(nodeDefaultVersion);

        var storefrontAppConfig = _writeEnvVariables.Run(storefrontDirName, storefrontClientID, "storefront");
        storefrontAppConfig.Add(nodeDefaultVersion);

        // Authenticate to Azure
        InteractiveBrowserCredentialOptions credentialOpts = new InteractiveBrowserCredentialOptions();
        if (_appSettings.tenantId != null)
            credentialOpts.TenantId = _appSettings.tenantId;

        await logger.WriteLineAsync("Authenticate to Azure via web browser prompt");
        InteractiveBrowserCredential credential = new InteractiveBrowserCredential(credentialOpts);
        ArmClient client = new ArmClient(credential, _appSettings.subscriptionId);
        SubscriptionCollection subscriptions = client.GetSubscriptions();
        SubscriptionResource subscription = await subscriptions.GetAsync(_appSettings.subscriptionId);
        ResourceGroupResource resourceGroup = await subscription.GetResourceGroupAsync(_appSettings.resourceGroup);
        
        // Build up parameters for ARM template
        var prefix = GenerateRandomString(6, lowerCase: true); // TODO: for local dev only - some resources in Azure are soft delete, so name conflicts arise when creating/deleting/creating the same name

        var storageSku = Prompt.Select("Select the desired SKU for your Azure Storage Account (required to create an Azure Function)", GetAzureStorageSkuValues());
        var storageKind =
            Prompt.Select(
                "Select the desired storage type for your Azure Storage Account (required to create an Azure Function)",
                GetAzureStorageKindValues(storageSku));

        if (storageSku == null || storageKind == null)
        {
            throw new Exception("Must select a SKU and storage type for your Azure Storage Account");
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
                }
            };

            var armDeploymentContent = BuildArmDeployment("main", parameters);
            await logger.WriteLineAsync("Creating Azure Resources - This can take a few minutes");
            // Create deployment in Azure
            await resourceGroup.GetArmDeployments().CreateOrUpdateAsync(WaitUntil.Completed, prefix, armDeploymentContent);
            
            var results = resourceGroup.GetGenericResources(filter: filters);

            // Find the storage account
            var genericStorageResource = results.FirstOrDefault(r => r.Data.ResourceType.Type == "storageAccounts");
            var storageAccount = client.GetStorageAccountResource(genericStorageResource.Id);
            
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
                    value = "~4"
                },
                new()
                {
                    name = "AzureWebJobsStorage",
                    value = $"DefaultEndpointsProtocol=https;AccountName=${storageAccount.Data.Name};AccountKey=${storageAccount.GetKeys().FirstOrDefault().Value};EndpointSuffix=http://core.windows.net/"
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
                    value = appPlan.Id
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

    private ArmDeploymentContent BuildArmDeployment(string armTemplateFile, object parameters)
    {
        var properties = new ArmDeploymentProperties(ArmDeploymentMode.Incremental)
        {
            Template = BinaryData.FromString(File.ReadAllText($"../../../Templates/{armTemplateFile}.json")),
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

    private List<string> GetAzureStorageSkuValues()
    {
        return new List<string>
        {
            "Premium_LRS",
            "Premium_ZRS",
            "Standard_GRS",
            "Standard_GZRS",
            "Standard_LRS",
            "Standard_RAGRS",
            "Standard_RAGZRS",
            "Standard_ZRS",
        };
    }

    private List<string> GetAzureStorageKindValues(string storageSku)
    {
        var list = new List<string> { "Storage", "StorageV2" };
        if (new List<string> { "Standard_LRS", "Standard_GRS", "Standard_RAGRS" }.Contains(storageSku))
            list.Add("BlobStorage");
        else if (storageSku == "Premium_LRS")
            list.AddRange(new List<string> {"FileStorage", "BlockBlobStorage"});

        return list;
    }
}
