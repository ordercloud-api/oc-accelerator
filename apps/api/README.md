## Service examples

Add services in the following way in the Program.cs file. This structure utilizes user secrets. You then pass these values to your service injection.

```csharp
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
```

Inject the services

```csharp
builder.Services.AddSingleton<ITaxCalculator>(avalaraService);
builder.Services.AddSingleton<ICreditCardProcessor>(stripeService);
builder.Services.AddSingleton<ICreditCardSaver>(stripeService);
```