using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace OC_Accelerator.Helpers
{
    public class WriteAzSettings
    {
        public void Run(string fullAzureId, string webAppName)
        {
            var contents = new JObject();
            contents["appService.defaultWebAppToDeploy"] = fullAzureId;
            contents["appService.deploySubpath"] = "./dist";
            contents["appService.preDeployTask"] = "build";
            //File.Create($"../../../../apps/{webAppName}/.vscode/settings.json");
            File.WriteAllText($"../../../../apps/{webAppName}/.vscode/settings.json", JsonConvert.SerializeObject(contents));
        }
    }
}
