using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using OrderCloud.Catalyst;
using Accelerator.Commands;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using OrderCloud.SDK;

namespace Accelerator.Functions
{
    public class Shipping(ILogger<Shipping> logger, ShippingCommand command)
    {
        [Function("shippingrates")]
        public async Task<IActionResult> EstimateShipping([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequest req, [Microsoft.Azure.Functions.Worker.Http.FromBody] dynamic payload)
        {
            logger.LogInformation("C# HTTP trigger function processed a request.");
            var deserializedPayload = JsonConvert.DeserializeObject<OrderCheckoutIEPayload>(payload.ToString());
            var response = await command.EstimateShippingRatesAsync(deserializedPayload);

            return new OkObjectResult(response);
        }
    }
}
