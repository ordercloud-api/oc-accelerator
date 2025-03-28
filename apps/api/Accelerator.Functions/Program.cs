using Accelerator.Commands;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OrderCloud.Catalyst;
using OrderCloud.SDK;
using System.Reflection;
using Accelerator.MockServices;
using Flurl.Util;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();
builder.Configuration.AddUserSecrets(Assembly.GetExecutingAssembly(), true);

var config = builder.Configuration;
// Add Services
builder.Services.AddSingleton<GreetingCommand>();
builder.Services.AddSingleton<ShippingCommand>();
builder.Services.AddSingleton<TaxCommand>();
builder.Services.AddSingleton<PaymentCommand>();

builder.Services.AddSingleton<IShippingRatesCalculator>(new ShippingServiceMock());
builder.Services.AddSingleton<ITaxCalculator>(new TaxServiceMock());
builder.Services.AddSingleton<ICreditCardProcessor>(new CreditCardProcessorMock());
builder.Services.AddSingleton<ICreditCardSaver>(new CreditCardSaverMock());

builder.Services.AddSingleton<IOrderCloudClient>(new OrderCloudClient(new OrderCloudClientConfig()
{
    ApiUrl = config.GetValue<string>("OrderCloudSettings:ApiUrl"),
    AuthUrl = config.GetValue<string>("OrderCloudSettings:ApiUrl"),
    ClientId = config.GetValue<string>("OrderCloudSettings:MiddlewareClientID"),
    ClientSecret = config.GetValue<string>("OrderCloudSettings:MiddlewareClientSecret"),
}));


builder.Build().Run();