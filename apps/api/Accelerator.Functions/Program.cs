using Accelerator.Commands;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OrderCloud.Catalyst;
using OrderCloud.SDK;
using System.Reflection;


var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();
builder.Configuration.AddUserSecrets(Assembly.GetExecutingAssembly(), true);

// Application Insights isn't enabled by default. See https://aka.ms/AAt8mw4.
// builder.Services
//     .AddApplicationInsightsTelemetryWorkerService()
//     .ConfigureFunctionsApplicationInsights();

var config = builder.Configuration;

// Add Services
builder.Services.AddSingleton<GreetingCommand>();
builder.Services.AddSingleton<ShippingCommand>();
builder.Services.AddSingleton<TaxCommand>();
builder.Services.AddSingleton<PaymentCommand>();
//builder.Services.AddSingleton<IShippingRatesCalculator>(YOUR_CHOSEN_SERVICE);
//builder.Services.AddSingleton<ITaxCalculator>(YOUR_CHOSEN_SERVICE);
//builder.Services.AddSingleton<ICreditCardProcessor>(YOUR_CHOSEN_SERVICE);
//builder.Services.AddSingleton<ICreditCardSaver>(YOUR_CHOSEN_SERVICE);
builder.Services.AddSingleton<IOrderCloudClient>(new OrderCloudClient(new OrderCloudClientConfig()
{
    ApiUrl = config.GetValue<string>("OrderCloudSettings:ApiUrl"),
    AuthUrl = config.GetValue<string>("OrderCloudSettings:ApiUrl"),
    ClientId = config.GetValue<string>("OrderCloudSettings:MiddlewareClientID"),
    ClientSecret = config.GetValue<string>("OrderCloudSettings:MiddlewareClientSecret"),
}));

builder.Build().Run();