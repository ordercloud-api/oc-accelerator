using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;

namespace Accelerator.Commands
{
    public class GreetingCommand
    {
        public ActionResult GetGreeting(IQueryCollection query)
        {
            var name = "world";
            if (!String.IsNullOrEmpty(query["name"]))
            {
                name = query["name"];
            }
            return new OkObjectResult(new { greeting = $"Hello {name}!" });
        }
    }
}