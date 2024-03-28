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
            var appSettings = provider.GetService<IAppSettings>();

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

                    provider.GetService<BuildBicepFile>()?.Run(logger, "../../../Templates/main.bicep");
                    var ocService = provider.GetService<OCMarketplaceComposer>();
                    try
                    {
                        apiClientIDs = await ocService.CreateApiClientsAsync(logger, storefrontAppName, adminAppName);
                        armResponse = await provider.GetService<AzureResourceGenerator>()?.RunAsync(logger, apiClientIDs?.Item1, apiClientIDs?.Item2, storefrontAppName, adminAppName, funcAppName);
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
                    var envVarService = provider.GetService<WriteEnvVariables>();
                    var appNames = Directory.GetDirectories("../../../../apps").Select(Path.GetFileName).ToList();
                    appNames.Add("All");
                    var selectedDirectory = Prompt.Select("Which directory would you like to populate .env.local settings for?", appNames);
                    if (selectedDirectory != "All")
                    {
                        appNames.Remove("All");
                        var appName = Prompt.Select("Which application does this directory represent?",
                            new List<string>() { "functions", "admin", "storefront" });
                        var apiClientId = appName switch
                        {
                            "functions" => appSettings.ocFunctionsClientId,
                            "admin" => appSettings.ocAdminClientId,
                            "storefront" => appSettings.ocStorefrontClientId,
                            _ => throw new Exception("not sure what youre doing")
                        };
                        if (apiClientId == null) throw new Exception($"Must provide API clientID for {appName}");
                        envVarService.Run(appName, apiClientId);
                    }
                    else
                    {
                        appNames.Remove("All");
                        storefrontAppName = Prompt.Select("Which directory represents your buyer/storefront application?", appNames);
                        Console.WriteLine($"Selected {storefrontAppName} as your buyer/storefront application");
                        adminAppName = Prompt.Select("Which directory represents your admin application?", appNames);
                        Console.WriteLine($"Selected {adminAppName} as your admin application");
                        funcAppName = Prompt.Select("Which directory represents your functions application?", appNames);
                        Console.WriteLine($"Selected {funcAppName} as your functions application");
                        Prompt.Confirm("Everything look good?", defaultValue: true);

                        foreach (var appName in appNames.Where(a => a is not null && a != funcAppName))
                        {
                            var apiClientId = appName == adminAppName
                                ? appSettings.ocAdminClientId
                                : appSettings.ocStorefrontClientId;
                            if (apiClientId == null) throw new Exception($"Must provide API clientID for {appName}");
                            envVarService.Run(appName, apiClientId);
                        }
                    }
                }
            }
        }
    }
}