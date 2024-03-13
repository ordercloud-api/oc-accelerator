using Newtonsoft.Json;
using OC_Accelerator.Models;
using OrderCloud.SDK;
using System.Runtime;
using OC_Accelerator.Helpers;

namespace OC_Accelerator.Services
{
    // TODO: rename this
    public class OCMarketplaceComposer
    {
        private readonly string buyerID = "accelerator";
        private readonly IOrderCloudClient _oc;
        private readonly IAppSettings _appSettings;
        private readonly IgnoreErrorWrapper _ignoreErrorWrapper;

        public OCMarketplaceComposer(IOrderCloudClient oc, IAppSettings appSettings, IgnoreErrorWrapper ignoreErrorWrapper)
        {
            _oc = oc;
            _appSettings = appSettings;
            _ignoreErrorWrapper = ignoreErrorWrapper;
        }
        public async Task<Tuple<ApiClient, ApiClient>> CreateApiClientsAsync(TextWriter logger)
        {
            // TODO: temporary
            await CleanupAsync(logger);
            ApiClient buyerApiClient = new ApiClient();
            ApiClient sellerApiClient = new ApiClient();
            try
            {
                await logger.WriteLineAsync($"Creating Buyer {buyerID}");
                await _oc.Buyers.CreateAsync(new Buyer()
                {
                    ID = buyerID,
                    Active = true,
                    Name = "OC Accelerator - Starter Buyer"
                });

                await logger.WriteLineAsync("Creating Default Context User");
                var defaultContextUser = await _oc.Users.CreateAsync(buyerID, new User()
                {
                    Active = true,
                    Username = "DefaultContextUser",
                    FirstName = "Anonymous",
                    LastName = "User",
                    Email = "test@test.com"
                });

                await logger.WriteLineAsync($"Creating Buyer API Client with Default Context User {defaultContextUser.Username}");
                buyerApiClient = new ApiClient
                {
                    Active = true,
                    AccessTokenDuration = 600,
                    AppName = "Buyer",
                    DefaultContextUserName = defaultContextUser.Username,
                    AllowAnyBuyer = true,
                    AllowAnySupplier = false,
                    AllowSeller = false,
                    IsAnonBuyer = false,
                };
                buyerApiClient = await _oc.ApiClients.CreateAsync(buyerApiClient);

                await logger.WriteLineAsync("Creating Seller API Client");
                sellerApiClient = new ApiClient
                {
                    Active = true,
                    AccessTokenDuration = 600,
                    AppName = "Seller",
                    DefaultContextUserName = null,
                    AllowAnyBuyer = false,
                    AllowAnySupplier = false,
                    AllowSeller = true,
                    IsAnonBuyer = false,
                };
                sellerApiClient = await _oc.ApiClients.CreateAsync(sellerApiClient);

                return Tuple.Create(buyerApiClient, sellerApiClient);
            }
            catch (OrderCloudException ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                await logger.WriteLineAsync(ex.Message);
                await CleanupAsync(logger);
                throw;
            }
        }

        public async Task ConfigureOrderCheckoutIntegrationEvent(TextWriter logger, string middlewareUrl)
        {
            await logger.WriteLineAsync("Creating OrderCheckout Integration Event");
            await _oc.IntegrationEvents.CreateAsync(new IntegrationEvent
            {
                EventType = IntegrationEventType.OrderCheckout,
                CustomImplementationUrl = $"{middlewareUrl}/api/integrationevent",
                Name = "Order Checkout Integration Event",
                HashKey = _appSettings.ocHashKey
            });
        }


        public async Task ConfigureWebhooksAsync(TextWriter logger, string middlewareUrl, string buyerApiClientID)
        {
            await logger.WriteLineAsync("Creating Webhook");
            var webhookRoutes = new List<WebhookRoute>()
            {
                new()
                {
                    Route = "v1/buyers/{buyerID}/addresses",
                    Verb = "POST"
                }
            };
            await _oc.Webhooks.CreateAsync(new Webhook
            {
                Name = "Validate Address",
                Description = "Pre-webhook to validate a buyer address before it's created",
                Url = $"{middlewareUrl}/api/webhook/createaddress",
                HashKey = _appSettings.ocHashKey,
                ElevatedRoles = null,
                ConfigData = null,
                BeforeProcessRequest = true,
                ApiClientIDs = new List<string>() { buyerApiClientID },
                WebhookRoutes = webhookRoutes,
                DeliveryConfigID = null
            });
        }

        public async Task CleanupAsync(TextWriter logger)
        {
            var webhooks = await _oc.Webhooks.ListAsync();
            foreach (var webhook in webhooks.Items)
            {
                await _oc.Webhooks.DeleteAsync(webhook.ID);
            }

            var integreationEvents = await _oc.IntegrationEvents.ListAsync();
            foreach (var ie in integreationEvents.Items)
            {
                await _oc.IntegrationEvents.DeleteAsync(ie.ID);
            }

            var apiClients = await _oc.ApiClients.ListAsync(filters: new { ID = $"!{_appSettings.ocMiddlewareClientId}"});
            foreach (var apiClient in apiClients.Items)
            {
                await _oc.ApiClients.DeleteAsync(apiClient.ID);
            }

            await _ignoreErrorWrapper.Ignore404(() => _oc.Buyers.DeleteAsync(buyerID), logger);
            await _ignoreErrorWrapper.Ignore404(() => _oc.Catalogs.DeleteAsync(buyerID), logger);
        }
    }
}
