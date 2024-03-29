using Azure.Identity;
using Azure.ResourceManager.Resources.Models;
using Azure.ResourceManager.Resources;
using Azure.ResourceManager;
using Azure;
using OC_Accelerator.Models;
using System.Text;
using OC_Accelerator.Helpers;
using Sharprompt;

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
        InteractiveBrowserCredentialOptions credentialOpts = new InteractiveBrowserCredentialOptions()
        {
            TenantId = _appSettings.tenantId
        };
        await logger.WriteLineAsync("Authenticate to Azure via web browser prompt");
        InteractiveBrowserCredential credential = new InteractiveBrowserCredential(credentialOpts);
        ArmClient client = new ArmClient(credential, _appSettings.subscriptionId);
        SubscriptionCollection subscriptions = client.GetSubscriptions();
        SubscriptionResource subscription = await subscriptions.GetAsync(_appSettings.subscriptionId);
        ResourceGroupResource resourceGroup = await subscription.GetResourceGroupAsync(_appSettings.resourceGroup);

        var nodeDefaultVersion = new AzAppConfig()
        {
            name = "WEBSITE_NODE_DEFAULT_VERSION",
            value = "~20"
        };

        var adminAppConfig = _writeEnvVariables.Run(adminDirName, adminClientID);
        adminAppConfig.Add(nodeDefaultVersion);

        var storefrontAppConfig = _writeEnvVariables.Run(storefrontDirName, storefrontClientID);
        storefrontAppConfig.Add(nodeDefaultVersion);

        // TODO: for local dev only - some resources in Azure are soft delete, so name conflicts arise when creating/deleting/creating the same name
        var prefix = GenerateRandomString(6, lowerCase: true);
        var properties = new ArmDeploymentProperties(ArmDeploymentMode.Incremental)
        {
            Template = BinaryData.FromString(File.ReadAllText("../../../Templates/main.json")),
            Parameters = BinaryData.FromObjectAsJson(new
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
                funcAppName = new
                {
                    value = funcAppName
                },
                adminAppConfig = new
                {
                    value = adminAppConfig
                },
                storefrontAppConfig = new
                {
                    value = storefrontAppConfig
                }
            })
        };

        var armDeploymentContent = new ArmDeploymentContent(properties);
        var filters = $"substringof('{prefix}', name)";
        try
        {
            await logger.WriteLineAsync("Creating Azure Resources - This can take a few minutes");
            // TODO: parameterize the deployment name?
            await resourceGroup.GetArmDeployments().CreateOrUpdateAsync(WaitUntil.Completed, "accelerator", armDeploymentContent);
            
            var results = resourceGroup.GetGenericResources(filter: filters);
            var resourceNames = results.Select(r => $"{r.Data.Name} ({r.Data.ResourceType.Type})");
            await logger.WriteLineAsync($"Created the following Azure Resources: \n{string.Join(Environment.NewLine, resourceNames)}");

            // find the storage account
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
                    value = "~4"
                },
            };
            
            funcAppConfig.Add(nodeDefaultVersion);

            var funcApp = results.FirstOrDefault(r => r.Data.Kind == "functionapp");



            _writeAzSettings.WriteFunctionAppSettings(funcApp.Id, funcAppName);



            foreach (var directory in new[] { storefrontDirName, adminDirName })
            {
                var targetAzResource = results.FirstOrDefault(r => r.Data.Name.Contains(directory));
                _writeAzSettings.WriteWebAppSettings(targetAzResource.Id, directory);
            }



            return new AzResourceGeneratorResponse()
            {
                azFuncAppName = funcApp?.Data.Name ?? string.Empty,
                azFuncAppUrl = $"https://{funcApp?.Data.Name}.azurewebsites.net", // TODO: fix this
            };
        }
        catch (Exception ex)
        {
            var results = resourceGroup.GetGenericResources(filter: filters);
            foreach (var resource in results)
            {
                // TODO: we should probably confirm which resources to delete
                await resource.DeleteAsync(WaitUntil.Completed);
            }
            throw new Exception(ex.Message);
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
