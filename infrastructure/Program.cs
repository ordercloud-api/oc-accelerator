using System.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using OC_Accelerator.Helpers;
using OC_Accelerator.Models;
using OC_Accelerator.Services;
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

            Tuple<string, string> apiClientIDs = new Tuple<string, string>(null, null);
            AzResourceGeneratorResponse armResponse = new AzResourceGeneratorResponse();

            bool isDebugging = false;
            string action = null;
            string? storefrontAppName;
            string? adminAppName;
            string? funcAppName;


            while (action == null)
            {
                Console.WriteLine("s = seed Azure infrastructure");
                Console.WriteLine("v = write to local environment variables");
                var key = Console.ReadKey().Key;

                action =
                    (key == ConsoleKey.S) ? "seed" :
                    (key == ConsoleKey.V) ? "variables" :
                    null;

                Console.WriteLine();


                if (action == "seed")
                {
                    if (!isDebugging)
                    {
                        var appNames = Directory.GetDirectories("../../../../apps").Select(Path.GetFileName).ToList();
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

                    // compile .bicep file into ARM JSON template
                    provider.GetService<BuildBicepFile>()?.Run(logger, "../../../Templates/main.bicep");
                    var ocService = provider.GetService<OCMarketplaceComposer>();
                    try
                    {
                        apiClientIDs = await ocService.CreateApiClientsAsync(logger, storefrontAppName, adminAppName);
                        armResponse = await provider.GetService<AzureResourceGenerator>()?.RunAsync(logger, apiClientIDs?.Item1, apiClientIDs?.Item2, storefrontAppName, adminAppName, funcAppName);
                        // TODO: BROKEN
                        await ocService.ConfigureWebhooksAsync(logger, armResponse.azFuncAppUrl, apiClientIDs.Item1);
                        await ocService.ConfigureOrderCheckoutIntegrationEvent(logger, armResponse.azFuncAppUrl);
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


                if (action == "variables")
                {
                    var appNames = Directory.GetDirectories("../../../../apps").Select(Path.GetFileName).ToList();
                    var envVarService = provider.GetService<WriteEnvVariables>();
                    foreach (var appName in appNames)
                    {
                        envVarService.Run(appName, null);
                    }
                }
            }
        }
    }
}