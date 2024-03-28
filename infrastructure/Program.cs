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

            bool isDebugging = true;
            string action = null;
            string? storefrontDirectory;
            string? adminDirectory;
            string? funcDirectory;


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
                        var directories = Directory.GetDirectories("../../../../apps").Select(Path.GetFileName).ToList();
                        storefrontDirectory = Prompt.Select("Which directory represents your buyer/storefront application?", directories);
                        Console.WriteLine($"Selected {storefrontDirectory} as your buyer/storefront application");
                        adminDirectory = Prompt.Select("Which directory represents your admin application?", directories);
                        Console.WriteLine($"Selected {adminDirectory} as your admin application");
                        funcDirectory = Prompt.Select("Which directory represents your functions application?", directories);
                        Console.WriteLine($"Selected {funcDirectory} as your functions application");
                        Prompt.Confirm("Everything look good?", defaultValue: true);
                    }
                    else
                    {
                        storefrontDirectory = "storefront";
                        adminDirectory = "admin";
                        funcDirectory = "functions";
                    }

                    provider.GetService<BuildBicepFile>()?.Run(logger, "../../../Templates/main.bicep");
                    var ocService = provider.GetService<OCMarketplaceComposer>();
                    try
                    {
                        apiClientIDs = await ocService.CreateApiClientsAsync(logger, storefrontDirectory, adminDirectory);
                        armResponse = await provider.GetService<AzureResourceGenerator>()?.RunAsync(logger, apiClientIDs?.Item1, apiClientIDs?.Item2, storefrontDirectory, adminDirectory, funcDirectory);
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
                            ?.CleanupAsync(logger, storefrontDirectory, adminDirectory);
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
                    var directories = Directory.GetDirectories("../../../../apps").Select(Path.GetFileName).ToList();
                    directories.Add("All");
                    var selectedDirectory = Prompt.Select("Which directory would you like to populate .env.local settings for?", directories);
                    if (selectedDirectory != "All")
                    {
                        directories.Remove("All");
                        selectedDirectory = Prompt.Select("Which application does this directory represent?",
                            new List<string>() { "functions", "admin", "storefront" });
                        var apiClientId = selectedDirectory switch
                        {
                            "functions" => appSettings.ocFunctionsClientId,
                            "admin" => appSettings.ocAdminClientId,
                            "storefront" => appSettings.ocStorefrontClientId,
                            _ => throw new Exception("not sure what youre doing")
                        };
                        if (apiClientId == null) throw new Exception($"Must provide API clientID for {selectedDirectory}");
                        envVarService.Run(selectedDirectory, apiClientId);
                    }
                    else
                    {
                        directories.Remove("All");
                        storefrontDirectory = Prompt.Select("Which directory represents your buyer/storefront application?", directories);
                        Console.WriteLine($"Selected {storefrontDirectory} as your buyer/storefront application");
                        adminDirectory = Prompt.Select("Which directory represents your admin application?", directories);
                        Console.WriteLine($"Selected {adminDirectory} as your admin application");
                        funcDirectory = Prompt.Select("Which directory represents your functions application?", directories);
                        Console.WriteLine($"Selected {funcDirectory} as your functions application");
                        Prompt.Confirm("Everything look good?", defaultValue: true);

                        foreach (var appName in directories.Where(a => a is not null && a != funcDirectory))
                        {
                            var apiClientId = appName == adminDirectory
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