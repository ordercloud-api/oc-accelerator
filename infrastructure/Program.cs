using System.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using OC_Accelerator.Models;
using OC_Accelerator.Services;
using OrderCloud.SDK;

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

            provider.GetService<BuildBicepFile>()?.Run(logger, "../../../Templates/main.bicep");
            try
            {
                var ocService = provider.GetService<OCMarketplaceComposer>();
                apiClients = await ocService.CreateApiClientsAsync(logger);
                armResponse = await provider.GetService<AzureResourceGenerator>()?.RunAsync(logger, apiClients?.Item1, apiClients?.Item2);
                await ocService.ConfigureWebhooksAsync(logger, armResponse.middlewareUrl, apiClients.Item1.ID);
                await ocService.ConfigureOrderCheckoutIntegrationEvent(logger, armResponse.middlewareUrl);
                await provider.GetService<DevOps>()?.Run(logger, armResponse);
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                await logger.WriteLineAsync(ex.Message);
                await provider.GetService<OCMarketplaceComposer>()
                    ?.CleanupAsync(logger);
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