using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using OC_Accelerator.Helpers;
using OC_Accelerator.Models;
using OC_Accelerator.Services;
using OrderCloud.SDK;

namespace OC_Accelerator
{
    public static class IoC
    {
        public static ServiceProvider RegisterServices(IServiceCollection services)
        {
            var settings = BuildAppSettings();
            services.AddSingleton<IAppSettings>(settings);
            services.AddSingleton<IOrderCloudClient>(new OrderCloudClient(new OrderCloudClientConfig
            {
                AuthUrl = settings.ocApiUrl,
                ApiUrl = settings.ocApiUrl,
                ClientId = settings.ocFunctionsClientId,
                ClientSecret = settings.ocFunctionsClientSecret,
                Roles = new[] {
                    ApiRole.ApiClientAdmin,
                    ApiRole.BuyerAdmin,
                    ApiRole.BuyerUserAdmin,
                    ApiRole.CatalogAdmin,
                    ApiRole.WebhookAdmin,
                    ApiRole.IntegrationEventAdmin,
                    ApiRole.SecurityProfileAdmin
                }
            }));
            services.AddSingleton<AzureResourceService>();
            services.AddSingleton<DevOps>();
            services.AddSingleton<OCMarketplaceComposer>();
            services.AddSingleton<IgnoreErrorWrapper>();
            services.AddSingleton<BuildBicepFile>();
            services.AddSingleton<AzurePublisher>();
            services.AddSingleton<IdentifyAppNames>();
            services.AddSingleton<WriteEnvVariables>();
            services.AddSingleton<WriteAzSettings>();
            services.AddSingleton<AzurePlanOptions>();
            return services.BuildServiceProvider();
        }

        private static AppSettings BuildAppSettings()
        {
            IConfigurationBuilder builder = new ConfigurationBuilder();
            builder.AddEnvironmentVariables()
                .AddJsonFile("appSettings.json", optional: true);
            var build = builder.Build();
            return build.Get<AppSettings>();
        }
    }
}
