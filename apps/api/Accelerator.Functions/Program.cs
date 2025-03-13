using Accelerator.Commands;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OrderCloud.Catalyst;
using OrderCloud.SDK;
using System.Reflection;
using OrderCloud.Integrations.Payment.Stripe;
using OrderCloud.Integrations.Shipping.EasyPost;
using OrderCloud.Integrations.Tax.Avalara;


var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();
builder.Configuration.AddUserSecrets(Assembly.GetExecutingAssembly(), true);

// Application Insights isn't enabled by default. See https://aka.ms/AAt8mw4.
// builder.Services
//     .AddApplicationInsightsTelemetryWorkerService()
//     .ConfigureFunctionsApplicationInsights();

var config = builder.Configuration;
var easyPostService = new EasyPostService(new EasyPostConfig()
{
    BaseUrl = config.GetValue<string>("EasyPostSettings:BaseUrl"),
    ApiKey = config.GetValue<string>("EasyPostSettings:ApiKey"),
    CarrierAccountIDs = config.GetValue<List<string>>("EasyPostSettings:CarrierAccountIDs")
});

var avalaraService = new AvalaraService(new AvalaraConfig()
{
    BaseUrl = config.GetValue<string>("AvalaraSettings:BaseUrl"),
    LicenseKey = config.GetValue<string>("AvalaraSettings:LicenseKey"),
    AccountID = config.GetValue<string>("AvalaraSettings:AccountID"),
    CompanyCode = config.GetValue<string>("AvalaraSettings:CompanyCode")
});

var stripeService = new StripeService(new StripeConfig()
{
    SecretKey = config.GetValue<string>("StripeSettings:SecretKey"),
});


// Add Services
builder.Services.AddSingleton<GreetingCommand>();
builder.Services.AddSingleton<ShippingCommand>();
builder.Services.AddSingleton<TaxCommand>();
builder.Services.AddSingleton<PaymentCommand>();
builder.Services.AddSingleton<IShippingRatesCalculator>(easyPostService);
builder.Services.AddSingleton<ITaxCalculator>(avalaraService);
builder.Services.AddSingleton<ICreditCardProcessor>(stripeService);
builder.Services.AddSingleton<ICreditCardSaver>(stripeService);
builder.Services.AddSingleton<IOrderCloudClient>(new OrderCloudClient(new OrderCloudClientConfig()
{
    ApiUrl = config.GetValue<string>("OrderCloudSettings:ApiUrl"),
    AuthUrl = config.GetValue<string>("OrderCloudSettings:ApiUrl"),
    ClientId = config.GetValue<string>("OrderCloudSettings:MiddlewareClientID"),
    ClientSecret = config.GetValue<string>("OrderCloudSettings:MiddlewareClientSecret"),
}));

builder.Build().Run();