using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Reflection;
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

            string? storefrontDirectory;
            string? adminDirectory;
            string? funcDirectory = null;


            Action action = Prompt.Select<Action>("What would you like to do?");
            Console.WriteLine($"You selected {action}");
            
            if (action == Action.Seed)
            {
                if (!isDebugging)
                {
                    var directories = Directory.GetDirectories("../../../../apps").Select(Path.GetFileName).ToList();
                    bool confirmation = false;
                    do
                    {
                        storefrontDirectory = Prompt.Select($"Which directory represents your {ApplicationType.Storefront} application?", directories);
                        Console.WriteLine($"Selected {storefrontDirectory} as your {ApplicationType.Storefront} application");
                        adminDirectory = Prompt.Select($"Which directory represents your {ApplicationType.Admin} application?", directories);
                        Console.WriteLine($"Selected {adminDirectory} as your {ApplicationType.Admin} application");
                        funcDirectory = Prompt.Select($"Which directory represents your {ApplicationType.Functions} application?", directories);
                        Console.WriteLine($"Selected {funcDirectory} as your {ApplicationType.Functions} application");
                        confirmation = Prompt.Confirm("Everything look good?", defaultValue: true);
                    } while (!confirmation);
                }
                else
                {
                    storefrontDirectory = "storefront";
                    adminDirectory = "admin";
                    funcDirectory = "functions";
                }

                var bicepFileHelper = provider.GetService<BuildBicepFile>();
                // TODO: just compile all the files in /Tempaltes/BICEP
                bicepFileHelper?.Run(logger, "../../../Templates/main.bicep");
                bicepFileHelper?.Run(logger, "../../../Templates/functionApp.bicep");
                var ocService = provider.GetService<OCMarketplaceComposer>();
                try
                {
                    apiClientIDs = await ocService.CreateApiClientsAsync(logger, storefrontDirectory, adminDirectory);
                    armResponse = await provider.GetService<AzureResourceService>()?.CreateAsync(logger, apiClientIDs?.Item1, apiClientIDs?.Item2, storefrontDirectory, adminDirectory, funcDirectory);
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

            if (action == Action.EnvVar || action == Action.Settings)
            {
                var directories = Directory.GetDirectories("../../../../apps").Select(Path.GetFileName).ToList();
                directories.Add("All");
                var actionDescription = action.GetType().GetMember(action.ToString())
                    .First()
                    .GetCustomAttribute<DisplayAttribute>()
                    .GetName();
                var selectedDirectory = Prompt.Select($"Which directory would you like to {actionDescription} for?", directories);
                
                if (selectedDirectory != "All")
                {
                    // REMEMBER: APP TYPE MAY NOT ALWAYS EQUAL DIRECTORY NAME
                    ApplicationType appType = Prompt.Select<ApplicationType>("Which application does this directory represent?");

                    var apiClientId = appType switch
                    {
                        ApplicationType.Functions => appSettings.ocFunctionsClientId,
                        ApplicationType.Admin => appSettings.ocAdminClientId,
                        ApplicationType.Storefront => appSettings.ocStorefrontClientId,
                        _ => throw new Exception("not sure what you're doing")
                    };
                    if (apiClientId == null) 
                        throw new Exception($"Must provide API clientID for {appType}");
                    
                    if (action == Action.EnvVar)
                    {
                        // TODO: Do we want to allow writing to env variables for Azure Functions? 
                        provider.GetService<WriteEnvVariables>().Run(selectedDirectory, apiClientId, appType);
                    } 
                    else 
                    {
                        var azSettingsService = provider.GetService<WriteAzSettings>();
                        bool azConfirmation = false;
                        
                        var azureResources = await provider.GetService<AzureResourceService>().ListAsync(Console.Out);
                        var azureResourceNames = azureResources.Select(r => r.Data.Name).ToList();
                        string targetAzureResourceName = null;
                        do
                        {
                            // Select the name of the Azure Resource that represents the current directory in the iteration
                            targetAzureResourceName = Prompt.Select($"Which Azure Resource represents {selectedDirectory}",
                                azureResourceNames);
                            azConfirmation = Prompt.Confirm($"Confirm: {targetAzureResourceName} represents {selectedDirectory}",
                                defaultValue: true);
                        } while (!azConfirmation);
                        var targetAzureResource =
                            azureResources.FirstOrDefault(r => r.Data.Name == targetAzureResourceName);
                        if (appType != ApplicationType.Functions)
                            azSettingsService.WriteWebAppSettings(targetAzureResource.Id.ToString(), selectedDirectory);
                        else
                            azSettingsService.WriteFunctionAppSettings(targetAzureResource.Id.ToString(), selectedDirectory);
                    }
                }
                else
                {
                    directories.Remove("All");
                    bool dirConfirmation = false;
                    do
                    {
                        // REMEMBER: APP TYPE MAY NOT ALWAYS EQUAL DIRECTORY NAME
                        // Map directories to the app type (i.e. storefront, admin, functions) they represent
                        storefrontDirectory = Prompt.Select("Which directory represents your buyer/storefront application?", directories);
                        Console.WriteLine($"Selected {storefrontDirectory} as your buyer/storefront application");
                        adminDirectory = Prompt.Select("Which directory represents your admin application?", directories);
                        Console.WriteLine($"Selected {adminDirectory} as your admin application");

                        if (action == Action.Settings)
                        {
                            funcDirectory = Prompt.Select("Which directory represents your functions application?", directories);
                            Console.WriteLine($"Selected {funcDirectory} as your functions application");
                        }
                        dirConfirmation = Prompt.Confirm("Everything look good?", defaultValue: true);
                    } while (!dirConfirmation);

                    // List all Azure Resources
                    var azureResources = await provider.GetService<AzureResourceService>().ListAsync(Console.Out);
                    var azureResourceNames = azureResources.Select(r => r.Data.Name).ToList();

                    foreach (var directory in directories)
                    {
                        bool azConfirmation = false;
                        string targetAzureResourceName = null;
                        do
                        {
                            // Select the name of the Azure Resource that represents the current directory in the iteration
                            targetAzureResourceName = Prompt.Select($"Which Azure Resource represents {directory}",
                                azureResourceNames);
                            azConfirmation = Prompt.Confirm($"Confirm: {targetAzureResourceName} represents {directory}",
                                defaultValue: true);
                        } while (!azConfirmation);

                        azureResourceNames.Remove(targetAzureResourceName);

                        // Find the Azure Resource that matches the name selected above
                        var targetAzureResource =
                            azureResources.FirstOrDefault(r => r.Data.Name == targetAzureResourceName);

                        bool isAdmin = directory == adminDirectory;
                        bool isFunctions = directory == funcDirectory;

                        var apiClientId = isAdmin ? appSettings.ocAdminClientId
                            : isFunctions ? appSettings.ocFunctionsClientId
                                : appSettings.ocStorefrontClientId;
                        if (apiClientId == null) throw new Exception($"Must provide API clientID for {directory}");

                        var appType = isAdmin ? ApplicationType.Admin
                            : isFunctions ? ApplicationType.Functions : ApplicationType.Storefront;

                        if (action == Action.EnvVar)
                        {
                            var azSettingsService = provider.GetService<WriteAzSettings>();
                            if (appType != ApplicationType.Functions)
                                azSettingsService.WriteWebAppSettings(targetAzureResource.Id.ToString(), selectedDirectory);
                            else
                                azSettingsService.WriteFunctionAppSettings(targetAzureResource.Id.ToString(), selectedDirectory);
                        }
                        else
                        {
                            provider.GetService<WriteEnvVariables>().Run(directory, apiClientId, appType);
                        }
                    }
                }
            }
        }

        public enum Action
        {
            [Display(Name = "Seed Azure Infrastructure")]
            Seed,
            [Display(Name = "Set local environment variables")]
            EnvVar,
            [Display(Name = "Populate Azure .vscode/settings.json")]
            Settings
        }
    }
}