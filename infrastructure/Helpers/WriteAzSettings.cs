using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Azure.ResourceManager.Resources;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace OC_Accelerator.Helpers
{
    public class WriteAzSettings
    {
        public void WriteWebAppSettings(string resourceId, string directory)
        {
            var contents = new JObject();
            Directory.CreateDirectory($"../../../../apps/{directory}/.vscode");

            if (File.Exists($"../../../../apps/{directory}/.vscode/settings.json"))
            {
                string stringifiedContents = File.ReadAllText($"../../../../apps/{directory}/.vscode/settings.json");
                contents = JsonConvert.DeserializeObject<JObject>(stringifiedContents);
                contents["appService.defaultWebAppToDeploy"] = resourceId;
            }
            else
            {
                contents["appService.defaultWebAppToDeploy"] = resourceId;
                contents["appService.deploySubpath"] = "./dist";
                contents["appService.preDeployTask"] = "build";
            }

            File.WriteAllText($"../../../../apps/{directory}/.vscode/settings.json",
                JsonConvert.SerializeObject(contents));
        }

        public void WriteFunctionAppSettings(string resourceId, string directory)
        {
            var contents = new JObject();

            Directory.CreateDirectory($"../../../../apps/{directory}/.vscode");

            if (File.Exists($"../../../../apps/{directory}/.vscode/settings.json"))
            {
                string stringifiedContents = File.ReadAllText($"../../../../apps/{directory}/.vscode/settings.json");
                contents = JsonConvert.DeserializeObject<JObject>(stringifiedContents);
                contents["azureFunctions.defaultFunctionAppToDeploy"] = resourceId;
            }
            else
            {
                contents["azureFunctions.deploySubpath"] = ".";
                contents["azureFunctions.postDeployTask"] = "npm install (functions)";
                contents["azureFunctions.projectLanguage"] = "TypeScript";
                contents["azureFunctions.projectRuntime"] = "~4";
                contents["azureFunctions.internalConsoleOptions"] = "neverOpen";
                contents["azureFunctions.projectLanguageModel"] = "4";
                contents["azureFunctions.preDeployTask"] = "npm prune (functions)";
                contents["azureFunctions.defaultFunctionAppToDeploy"] = resourceId;
            }

            File.WriteAllText($"../../../../apps/{directory}/.vscode/settings.json",
                JsonConvert.SerializeObject(contents));
        }
    }
}
