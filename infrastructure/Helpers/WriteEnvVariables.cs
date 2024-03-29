using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OC_Accelerator.Models;

namespace OC_Accelerator.Helpers
{
    public class WriteEnvVariables
    {
        private readonly IAppSettings _appSettings;

        public WriteEnvVariables(IAppSettings appSettings)
        {
            _appSettings = appSettings;
        }

        public List<AzAppConfig> Run(string directory, string? clientId)
        {
            var appConfigList = new List<AzAppConfig>();
            if (clientId != null)
            {
                appConfigList = ConstructAppConfig(directory, clientId);
                var stringifiedAppConfigs = new List<string>();
                foreach (var appConfig in appConfigList)
                {
                    stringifiedAppConfigs.Add($"{appConfig.name}=\"{appConfig.value}\"");
                }
                string content = string.Join(Environment.NewLine, stringifiedAppConfigs);
                File.WriteAllText($"../../../../apps/{directory}/.env.local", content);
            }
            else
            {
                throw new Exception("Must provide an API Client ID");
            }

            return appConfigList;
        }

        private List<AzAppConfig> ConstructAppConfig(string directory, string clientId)
        {
            return new List<AzAppConfig>
            {
                new()
                {
                    name = "VITE_APP_NAME",
                    value = directory
                },
                new()
                {
                    name = "VITE_APP_CONFIG_BASE",
                    value = "/"
                },
                new()
                {
                    name = "VITE_APP_ORDERCLOUD_BASE_API_URL",
                    value = _appSettings.ocApiUrl
                },
                new()
                {
                    name = "VITE_APP_ORDERCLOUD_CLIENT_ID",
                    value = clientId
                },
                new()
                {
                    name = "VITE_APP_ORDERCLOUD_SCOPE",
                    value = ""
                },
                new()
                {
                    name = "VITE_APP_ORDERCLOUD_CUSTOM_SCOPE",
                    value = ""
                },
                new()
                {
                    name = "VITE_APP_ORDERCLOUD_ALLOW_ANONYMOUS",
                    value = ""
                }
            };
        }
    }
}
