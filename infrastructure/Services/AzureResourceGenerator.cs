using Azure.Identity;
using Azure.ResourceManager.Resources.Models;
using Azure.ResourceManager.Resources;
using Azure.ResourceManager;
using Azure;
using OC_Accelerator.Models;
using System.Text;
using OrderCloud.SDK;
using Azure.ResourceManager.AppConfiguration;

public class AzureResourceGenerator
{
    private readonly Random _random = new();
    private readonly IAppSettings _appSettings;

    public AzureResourceGenerator(IAppSettings appSettings)
    {
        _appSettings = appSettings;
    }
    
    public async Task<AzResourceGeneratorResponse> RunAsync(TextWriter logger, ApiClient buyerClient, ApiClient sellerClient, string buyerAppName, string adminAppName, string funcAppName)
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

        var template = File.ReadAllText("../../../Templates/main.json");

        // TODO: for local dev only - some resources in Azure are soft delete, so name conflicts arise when creating/deleting/creating the same name
        var prefix = GenerateRandomString(6, lowerCase: true);
        var properties = new ArmDeploymentProperties(ArmDeploymentMode.Incremental)
        {
            Template = BinaryData.FromString(template),
            Parameters = BinaryData.FromObjectAsJson(new
            {
                prefix = new
                {
                    value = prefix
                },
                buyerApiClientID = new
                {
                    value = buyerClient.ID
                },
                buyerAppName = new 
                {
                    value = buyerAppName
                },
                sellerApiClientID = new
                {
                    value = sellerClient.ID
                },
                adminAppName = new
                {
                    value = adminAppName
                },
                middlewareApiClientID = new
                {
                    value = _appSettings.ocMiddlewareClientId
                },
                middlewareApiClientSecret = new
                {
                    value = _appSettings.ocMiddlewareClientSecret
                },
                ocApiUrl = new
                {
                    value = _appSettings.ocApiUrl
                },
                hashKey = new
                {
                    value = _appSettings.ocHashKey
                },
                funcAppName = new
                {
                    value = funcAppName
                }
            })
        };

        var armDeploymentContent = new ArmDeploymentContent(properties);

        try
        {
            await logger.WriteLineAsync("Creating Azure Resources - This can take a few minutes");
            await resourceGroup.GetArmDeployments().CreateOrUpdateAsync(WaitUntil.Completed, "accelerator", armDeploymentContent);

            var results = resourceGroup.GetGenericResources();
            var resourceNames = results.Select(r => $"{r.Data.Name} ({r.Data.ResourceType.Type})");
            await logger.WriteLineAsync($"Created the following Azure Resources: \n{string.Join(Environment.NewLine, resourceNames)}");

            var middlewareAppService = results.FirstOrDefault(r => r.Data.Name.Contains($"{prefix}-middleware") && r.Data.ResourceType.Type != "sites/slots");
            var appConfigResource = results.FirstOrDefault(r => r.Data.ResourceType.Type == "configurationStores");

            AppConfigurationStoreResource appConfigurationStore = client.GetAppConfigurationStoreResource(appConfigResource.Id);
            var keys = appConfigurationStore.GetKeys();

            return new AzResourceGeneratorResponse()
            {
                middlewareAppName = middlewareAppService?.Data.Name ?? string.Empty,
                middlewareUrl = $"https://{middlewareAppService?.Data.Name}.azurewebsites.net", // TODO: fix this
                appConfigConnectionString = keys.FirstOrDefault().ConnectionString,
            };
        }
        catch (Exception ex)
        {
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
