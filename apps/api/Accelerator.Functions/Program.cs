using Accelerator.Commands;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OrderCloud.Catalyst;
using OrderCloud.Integrations.Shipping.EasyPost;


var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

// Application Insights isn't enabled by default. See https://aka.ms/AAt8mw4.
// builder.Services
//     .AddApplicationInsightsTelemetryWorkerService()
//     .ConfigureFunctionsApplicationInsights();

var easyPostService = new EasyPostService(new EasyPostConfig()
{
    BaseUrl = "https://api.easypost.com/v2",
    ApiKey = "...",
    CarrierAccountIDs = new List<string> { "...", "..." }
});

// Add Services
builder.Services.AddSingleton<GreetingCommand>();
builder.Services.AddSingleton<ShippingCommand>();
builder.Services.AddSingleton<IShippingRatesCalculator>(easyPostService);

builder.Build().Run();
