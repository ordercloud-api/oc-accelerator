using Accelerator.Commands;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Accelerator.Functions
{
    public class Greeting(ILogger<Greeting> logger, GreetingCommand command)
    {
        [Function("greeting")]
        public IActionResult Run([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req)
        {
            logger.LogInformation("C# HTTP trigger function processed a request.");
            return command.GetGreeting(req.Query);
        }
    }
}
