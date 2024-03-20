using System.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using OC_Accelerator.Helpers;
using OC_Accelerator.Models;
using OC_Accelerator.Services;
using OrderCloud.SDK;
using Sharprompt;

namespace OC_Accelerator
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var logger = Console.Out;
            var stopwatch = new Stopwatch();
            stopwatch.Start();
            var services = new ServiceCollection();
            var provider = IoC.RegisterServices(services);

            Tuple<ApiClient, ApiClient> apiClients = new Tuple<ApiClient, ApiClient>(null, null);
            AzResourceGeneratorResponse armResponse = new AzResourceGeneratorResponse();

            var appNames = provider.GetService<IdentifyAppNames>().Run(logger);
            bool isDebugging = false;

            string? storefrontAppName;
            string? adminAppName;
            string? funcAppName;

            if (!isDebugging)
            {
                storefrontAppName = Prompt.Select("Which directory represents your buyer/storefront application?", appNames);
                Console.WriteLine($"Selected {storefrontAppName} as your buyer/storefront application");
                adminAppName = Prompt.Select("Which directory represents your admin application?", appNames);
                Console.WriteLine($"Selected {adminAppName} as your admin application");
                funcAppName = Prompt.Select("Which directory represents your functions application?", appNames);
                Console.WriteLine($"Selected {funcAppName} as your functions application");
                Prompt.Confirm("Everything look good?", defaultValue: true);
            }
            else
            {
                storefrontAppName = "storefront";
                adminAppName = "admin";
                funcAppName = "functions";
            }

            provider.GetService<BuildBicepFile>()?.Run(logger, "../../../Templates/main.bicep");
            try
            {
                var ocService = provider.GetService<OCMarketplaceComposer>();
                apiClients = await ocService.CreateApiClientsAsync(logger, storefrontAppName, adminAppName, funcAppName);
                armResponse = await provider.GetService<AzureResourceGenerator>()?.RunAsync(logger, apiClients?.Item1, apiClients?.Item2, storefrontAppName, adminAppName, funcAppName);
                await ocService.ConfigureWebhooksAsync(logger, armResponse.middlewareUrl, apiClients.Item1.ID);
                await ocService.ConfigureOrderCheckoutIntegrationEvent(logger, armResponse.middlewareUrl);
                // TODO: post-MVP
                // await provider.GetService<DevOps>()?.Run(logger, armResponse);
                // await provider.GetService<AzurePublisher>().Publish(logger);
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                await logger.WriteLineAsync(ex.Message);
                await provider.GetService<OCMarketplaceComposer>()
                    ?.CleanupAsync(logger, storefrontAppName);
            }
            finally
            {
                Console.ForegroundColor = ConsoleColor.White;
                stopwatch.Stop();
                await logger.WriteLineAsync($"Time elapsed: {stopwatch.Elapsed}");
                await logger.DisposeAsync();
            }
        }
    }
}