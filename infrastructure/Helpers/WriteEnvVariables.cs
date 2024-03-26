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

        public void Run(string webAppName, string? apiClientID)
        {
            string content = $"VITE_APP_NAME=\"{webAppName}\"" +
                             $"VITE_APP_CONFIG_BASE=\"/\"" +
                             $"VITE_APP_ORDERCLOUD_BASE_API_URL=\"{_appSettings.ocApiUrl}\"" +
                             $"VITE_APP_ORDERCLOUD_CLIENT_ID=\"{apiClientID}\"" +
                             $"VITE_APP_ORDERCLOUD_SCOPE=\"{webAppName}\"" + // TODO: fix
                             $"VITE_APP_ORDERCLOUD_CUSTOM_SCOPE=\"{webAppName}\"" + // TODO: fix
                             "VITE_APP_ORDERCLOUD_ALLOW_ANONYMOUS=\"true\"";
            File.WriteAllText($"../../../../apps/{webAppName}/.env.local", content);
        }
    }
}
