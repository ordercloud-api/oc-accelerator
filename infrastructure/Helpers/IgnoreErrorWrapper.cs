using OrderCloud.SDK;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace OC_Accelerator.Helpers
{
    public class IgnoreErrorWrapper
    {
        public async Task Ignore404(Func<Task> callOC, TextWriter log)
        {
            try
            {
                await callOC();
            }
            catch (OrderCloudException ex) when (ex.HttpStatus == System.Net.HttpStatusCode.NotFound)
            {
                await log.WriteLineAsync($"{ex.Message}: {JsonConvert.SerializeObject(ex.Errors.FirstOrDefault().Data)}");
            }
        }
    }
}
