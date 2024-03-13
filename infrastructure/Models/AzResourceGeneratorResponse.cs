using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OC_Accelerator.Models
{
    public class AzResourceGeneratorResponse
    {
        public string appConfigConnectionString { get; set; }
        public string middlewareAppName { get; set; }
        public string middlewareUrl { get; set; }
    }
}
