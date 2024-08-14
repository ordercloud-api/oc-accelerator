using OC_Accelerator.Models;
using OrderCloud.SDK;
using Microsoft.TeamFoundation.Common;
using OC_Accelerator.Helpers;
using Flurl.Http;
using Newtonsoft.Json;

namespace OC_Accelerator.Services
{
    // TODO: rename this
    public class OCMarketplaceComposer
    {
        private readonly IOrderCloudClient _oc;
        private readonly IAppSettings _appSettings;
        private readonly IgnoreErrorWrapper _ignoreErrorWrapper;

        public OCMarketplaceComposer(IOrderCloudClient oc, IAppSettings appSettings, IgnoreErrorWrapper ignoreErrorWrapper)
        {
            _oc = oc;
            _appSettings = appSettings;
            _ignoreErrorWrapper = ignoreErrorWrapper;
        }

        /// <summary>
        /// Creates API Clients for both the Storefront and Admin applications if either of their respective API ClientIDs are NOT included in appSettings.json
        /// </summary>
        /// <param name="logger"></param>
        /// <param name="storefrontDirectory"></param>
        /// <param name="adminDirectory"></param>
        /// <returns>a string Tuple representing the Storefront API Client ID (Item1) and the Admin API Client ID (Item2)</returns>
        public async Task<Tuple<string, string>> CreateApiClientsAsync(TextWriter logger, string storefrontDirectory, string adminDirectory)
        {
            string storefrontApiClientID = _appSettings.ocStorefrontClientId;
            string adminApiClientID = _appSettings.ocAdminClientId;
            try
            {
                if (storefrontApiClientID.IsNullOrEmpty())
                {
                    await logger.WriteLineAsync($"Creating Buyer {storefrontDirectory}");
                    var buyerId = string.Join("-", storefrontDirectory);
                    var buyer = await _oc.Buyers.SaveAsync(buyerId, new Buyer()
                    {
                        ID = buyerId,
                        Active = true,
                        Name = storefrontDirectory
                    });

                    await logger.WriteLineAsync($"Creating Security Profile for {storefrontDirectory}");
                    var buyerSecurityProfileId = string.Join("-", storefrontDirectory);
                    var buyerSecurityProfile = await _oc.SecurityProfiles.SaveAsync(buyerSecurityProfileId, new SecurityProfile()
                    {
                        ID = buyerSecurityProfileId,
                        Name = $"{storefrontDirectory} Security Profile",
                        Roles = ConvertOcApiRoles(_appSettings.ocStorefrontScope, true),
                        CustomRoles = _appSettings.ocStorefrontCustomScope?.Split(" ").ToList() ?? new List<string>()
                    });
                    await _oc.SecurityProfiles.SaveAssignmentAsync(new SecurityProfileAssignment()
                    {
                        BuyerID = buyer.ID,
                        SecurityProfileID = buyerSecurityProfile.ID
                    });

                    var defaultContextUser = new User();
                    if (_appSettings.ocStorefrontAllowAnon == true)
                    {
                        await logger.WriteLineAsync("Creating Default Context User for anonymous shopping");
                        var defaultContextUserId = "StorefrontDefaultContextUser";
                        defaultContextUser = await _oc.Users.SaveAsync(buyer.ID, defaultContextUserId, new User()
                        {
                            Active = true,
                            ID = defaultContextUserId,
                            Username = "DefaultContextUser",
                            FirstName = "Anonymous",
                            LastName = "User",
                            Email = "test@test.com"
                        });
                    }

                    await logger.WriteLineAsync($"Creating Buyer API Client with Default Context User {defaultContextUser.Username}");
                    var apiClients = await _oc.ApiClients.ListAsync(filters: new { AppName = storefrontDirectory });
                    if (apiClients.Items.Count == 0)
                    {
                        var storefrontApiClient = new ApiClient
                        {
                            Active = true,
                            AccessTokenDuration = 600,
                            AppName = storefrontDirectory,
                            DefaultContextUserName = defaultContextUser.Username,
                            AllowAnyBuyer = true,
                            AllowAnySupplier = false,
                            AllowSeller = false,
                            IsAnonBuyer = false,
                        };
                        storefrontApiClient = await _oc.ApiClients.CreateAsync(storefrontApiClient);
                        storefrontApiClientID = storefrontApiClient.ID;
                    } else
                    {
                        storefrontApiClientID = apiClients.Items[0].ID;
                    }
                }

                if (adminApiClientID.IsNullOrEmpty())
                {
                    await logger.WriteLineAsync($"Creating Security Profile for {adminDirectory}");
                    var adminSecurityProfileId = string.Join("-", adminDirectory);
                    var adminSecurityProfile = await _oc.SecurityProfiles.SaveAsync(adminSecurityProfileId, new SecurityProfile()
                    {
                        ID = adminSecurityProfileId,
                        Name = $"{adminDirectory} Security Profile",
                        Roles = ConvertOcApiRoles(_appSettings.ocAdminScope, false),
                        CustomRoles = _appSettings.ocAdminCustomScope?.Split(" ").ToList() ?? new List<string>()
                    });

                    await _oc.SecurityProfiles.SaveAssignmentAsync(new SecurityProfileAssignment()
                    {
                        SecurityProfileID = adminSecurityProfile.ID
                    });

                    await logger.WriteLineAsync("Creating Seller API Client");
                    var apiClients = await _oc.ApiClients.ListAsync(filters: new { AppName = adminDirectory });
                    if (apiClients.Items.Count == 0)
                    {
                        var adminApiClient = new ApiClient
                        {
                            Active = true,
                            AccessTokenDuration = 600,
                            AppName = adminDirectory,
                            DefaultContextUserName = null,
                            AllowAnyBuyer = false,
                            AllowAnySupplier = false,
                            AllowSeller = true,
                            IsAnonBuyer = false,
                        };
                        adminApiClient = await _oc.ApiClients.CreateAsync(adminApiClient);
                        adminApiClientID = adminApiClient.ID;
                    }
                    else
                    {
                        adminApiClientID = apiClients.Items[0].ID;
                    }
                }

                return Tuple.Create(storefrontApiClientID, adminApiClientID);
            }
            catch (OrderCloudException ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                var flurlException = ex.InnerException as FlurlHttpException;
                var error = new
                {
                    ex.Message,
                    ex.Errors,
                    RequestMessage = flurlException?.Message,
                    flurlException.Call.RequestBody,
                    RequestHeaders = flurlException.Call.Request.Headers
                };
                var errorStringified = JsonConvert.SerializeObject(error, Formatting.Indented);
                throw new Exception(errorStringified);
            }
        }

        /// <summary>
        /// Creates the Order Checkout Integration Event in OrderCloud, configured to your Azure functions app
        /// </summary>
        /// <param name="logger"></param>
        /// <param name="hostedAppUrl"></param>
        /// <returns></returns>
        public async Task ConfigureOrderCheckoutIntegrationEvent(TextWriter logger, string hostedAppUrl)
        {
            await logger.WriteLineAsync("Creating OrderCheckout Integration Event");
            var orderCheckoutIntegrationEventId = "OrderCheckout";
            try
            {
                await _oc.IntegrationEvents.SaveAsync(orderCheckoutIntegrationEventId, new IntegrationEvent
                {
                    ID = orderCheckoutIntegrationEventId,
                    EventType = IntegrationEventType.OrderCheckout,
                    CustomImplementationUrl = $"{hostedAppUrl}/api/integrationevent",
                    Name = "Order Checkout Integration Event",
                    HashKey = _appSettings.ocHashKey
                });
            }
            catch (OrderCloudException ex)
            {
                Console.WriteLine(ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Creates a sample Webhook in OrderCloud, configured to your Azure functions app
        /// </summary>
        /// <param name="logger"></param>
        /// <param name="hostedAppUrl"></param>
        /// <param name="storefrontApiClientID"></param>
        /// <returns></returns>
        public async Task ConfigureWebhooksAsync(TextWriter logger, string hostedAppUrl, string storefrontApiClientID)
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
            var validateBuyerAddressWebhookId = "validate-buyer-address";
            try
            {
                await _oc.Webhooks.SaveAsync(validateBuyerAddressWebhookId, new Webhook
                {
                    Name = "Validate Buyer Address",
                    Description = "Pre-webhook to validate a buyer address before it's created",
                    Url = $"{hostedAppUrl}/api/webhook/createaddress",
                    HashKey = _appSettings.ocHashKey,
                    ElevatedRoles = null,
                    ConfigData = null,
                    BeforeProcessRequest = true,
                    ApiClientIDs = new List<string>() { storefrontApiClientID },
                    WebhookRoutes = webhookRoutes,
                    DeliveryConfigID = null
                });
            }
            catch (OrderCloudException ex)
            {
                Console.WriteLine(ex.Message);
                throw;
            }

        }

        private List<ApiRole> ConvertOcApiRoles(string? roles, bool isStorefront)
        {
            if (roles.IsNullOrEmpty())
                return isStorefront ? new List<ApiRole> { ApiRole.Shopper } : new List<ApiRole>();

            var rolesList = roles.Split(" ");
            return rolesList.Where(x => Enum.TryParse(typeof(ApiRole), x, false, out var role))
                .Select(x => (ApiRole)Enum.Parse(typeof(ApiRole), x)).ToList();
        }
    }
}
