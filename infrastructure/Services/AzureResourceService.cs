using Azure.Identity;
using Azure.ResourceManager.Resources.Models;
using Azure.ResourceManager.Resources;
using Azure.ResourceManager;
using Azure;
using OC_Accelerator.Models;
using System.Text;
using Azure.ResourceManager.Storage;
using Azure.ResourceManager.AppService;
using OC_Accelerator.Helpers;
using Sharprompt;

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
        var prefix = !string.IsNullOrEmpty(_appSettings.azureResourcePrefix) ? _appSettings.azureResourcePrefix : GenerateRandomString(6, lowerCase: true); 

        string appPlanSku;
        string storageSku;
        string storageType;
        string accessTier = null;
        string runtimeStack;

        bool confirmTierSelections = false;
        do
        {
            appPlanSku = Prompt.Select("Select the desired SKU for your Azure App Service Plan. Please see https://learn.microsoft.com/en-us/azure/app-service/overview-hosting-plans for more information", _azPlanOptions.GetAzureAppPlanSkuValues());
            storageSku = Prompt.Select("Select the desired SKU for your Azure Storage Account (required to create an Azure Function). Please see https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy for more information", _azPlanOptions.GetAzureStorageSkuValues());
            storageType =
                Prompt.Select(
                    "Select the desired storage type for your Azure Storage Account (required to create an Azure Function). Please see https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview#types-of-storage-accounts for more information",
                    _azPlanOptions.GetAzureStorageKindValues(storageSku));
            if (storageType == "BlobStorage")
            {
                accessTier = Prompt.Select(
                    "Select the desired access tier for your Blob Storage Account. Please see https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview",
                    new[] { "Cool", "Hot", "Premium"});
            }

            runtimeStack = Prompt.Select("Select the desired runtime stack for your Azure Function",
                new[] { "dotnet", "node" });
            confirmTierSelections = Prompt.Confirm("Everything look good?", defaultValue: true);
        } while (!confirmTierSelections);

        if (appPlanSku == null || storageSku == null || storageType == null)
        {
            throw new Exception("Must select a SKU for the App Service Plan, as well as a SKU and storage type for your Storage Account");
        }

        var prefixWithoutHypens = prefix.Replace("-", string.Empty).Replace(" ", string.Empty);
        var filters = $"substringof('{prefixWithoutHypens}', name)";
        // Parameters for main.bicep
        object parameters = new
        {
            prefix = new
            {
                value = prefixWithoutHypens
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
            storageType = new
            {
                value = storageType
            },
            appPlanSkuName = new
            {
                value = appPlanSku
            },
            accessTier = new
            {
                value = accessTier
            }
        };

        var armDeploymentContent = BuildArmDeployment("main", parameters);
        await logger.WriteLineAsync("Creating Azure Resources - This can take a few minutes");
        // Create deployment in Azure
        try
        {
            await resourceGroup.GetArmDeployments().CreateOrUpdateAsync(WaitUntil.Completed, $"{prefix}Deployment", armDeploymentContent);
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            await logger.WriteLineAsync($"An error occurred while creating resources in Azure. \n{ex.Message}");
            await ErrorHandlingCleanup(logger, resourceGroup, filters);
            Console.ForegroundColor = ConsoleColor.Red;
            throw;
        }


        var results = resourceGroup.GetGenericResources(filter: filters, expand: "createdTime").OrderByDescending(r => r.Data.CreatedOn);
        
        // Find the storage account
        var genericStorageResource = results.FirstOrDefault(r => r.Data.ResourceType.Type == "storageAccounts");
        if (genericStorageResource == null)
        {
            await ErrorHandlingCleanup(logger, resourceGroup, filters);
            throw new Exception(
                "Storage Account was not created successfully. A Storage Account is required to create an Azure Function");
        }

        // Get the actual storage account resource because the generic resource doesn't have the GetKeys() method
        var storageAccount = (await resourceGroup.GetStorageAccountAsync(genericStorageResource?.Data.Name)).Value;
        if (storageAccount == null)
        {
            // this catch is probably redundant but might as well check
            await ErrorHandlingCleanup(logger, resourceGroup, filters);
            throw new Exception(
                "Storage Account was not created successfully. A Storage Account is required to create an Azure Function");
        }

        var storageAccountKey = storageAccount?.GetKeys()?.FirstOrDefault()?.Value;

        var appPlan = results.FirstOrDefault(r => r.Data.ResourceType.Type == "serverFarms");

        // Configuration for Azure Functions app
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
                    value = runtimeStack
                },
                new()
                {
                    name = "AzureWebJobsStorage",
                    value = $"DefaultEndpointsProtocol=https;AccountName=${storageAccount.Data.Name};AccountKey=${storageAccountKey};EndpointSuffix=http://core.windows.net/" // TODO: is this endpoint suffix something we can hardcode?
                },
                nodeDefaultVersion
            };

        // Parameters for functionApp.bicep
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
        try
        {
            await resourceGroup.GetArmDeployments().CreateOrUpdateAsync(WaitUntil.Completed, $"{prefix}FuncDeployment", funcArmDeploymentContent);
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            await logger.WriteLineAsync($"An error occurred while creating resources in Azure. \n{ex.Message}");
            await ErrorHandlingCleanup(logger, resourceGroup, filters);
            Console.ForegroundColor = ConsoleColor.Red;
            throw;
        }

        results = resourceGroup.GetGenericResources(filter: filters, expand: "createdTime").OrderByDescending(r => r.Data.CreatedOn);
        var resourceNames = results.Select(r => $"{r.Data.Name} ({r.Data.ResourceType.Type})");
        await logger.WriteLineAsync($"Created the following Azure Resources: \n{string.Join(Environment.NewLine, resourceNames)}");

        var funcApp = results.FirstOrDefault(r => r.Data.Kind == "functionapp");
        // Get the actual Azure Functions website resource because the generic resource doens't have Data.DefaultHostName
        var functionAppResource = resourceGroup.GetWebSite(funcApp.Data.Name).Value;

        try
        {
            // Write to .vscode/settings.json for the admin and storefront directories
            foreach (var directory in new[] { storefrontDirName, adminDirName })
            {
                var targetAzResource = results.FirstOrDefault(r => r.Data.Name.Contains(directory));
                _writeAzSettings.WriteWebAppSettings(targetAzResource.Id, directory);
            }
            
            // Write to .vscode/settings.json for the functions directory
            _writeAzSettings.WriteFunctionAppSettings(funcApp.Id, funcAppName);
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            await logger.WriteLineAsync($"An error occurred while creating resources in Azure. \n{ex.Message}");
            await ErrorHandlingCleanup(logger, resourceGroup, filters);
            Console.ForegroundColor = ConsoleColor.Red;
            throw;
        }

        return new AzResourceGeneratorResponse()
        {
            azFuncAppName = funcApp?.Data.Name ?? string.Empty,
            azFuncAppUrl = $"https://{functionAppResource.Data.DefaultHostName}", // TODO: can we assume HTTPS?
        };
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
        Console.ForegroundColor = ConsoleColor.Cyan;
        await logger.WriteLineAsync("A browser window has opened to the Azure Portal. If you are not logged in, you will be prompted to log in.");
        Console.ForegroundColor = ConsoleColor.White;
        InteractiveBrowserCredential credential = new InteractiveBrowserCredential(credentialOpts);
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

    private async Task ErrorHandlingCleanup(TextWriter logger, ResourceGroupResource resourceGroup, string filters)
    {
        
        var results = resourceGroup.GetGenericResources(filter: filters, expand: "createdTime").OrderByDescending(r => r.Data.CreatedOn);
        if (results.Any())
        {
            Console.ForegroundColor = ConsoleColor.White;
            var resourcesCreated = results.Select(r => $"{r.Data.Name} ({r.Data.ResourceType.Type})");
            await logger.WriteLineAsync($"Created the following Azure Resources: \n{string.Join(Environment.NewLine, resourcesCreated)}");
            bool delete = Prompt.Confirm("Would you like to delete any? Note: Any future seeding requests will create entirely new azure resources");
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
