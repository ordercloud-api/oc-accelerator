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

        public void Run(string webAppName, string apiClientID)
        {
            string appName = $"VITE_APP_NAME=\"{webAppName}\"";
            string appConfig = "VITE_APP_CONFIG_BASE=\"/\"";
            string baseApiUrl = $"VITE_APP_ORDERCLOUD_BASE_API_URL=\"{_appSettings.ocApiUrl}\"";
            string clientID = $"VITE_APP_ORDERCLOUD_CLIENT_ID=\"{apiClientID}\"";
            string scope = $"VITE_APP_ORDERCLOUD_SCOPE=\"{webAppName}\""; // TODO: fix
            string customScope = $"VITE_APP_ORDERCLOUD_CUSTOM_SCOPE=\"{webAppName}\""; // TODO: fix
            string allowAnon = "VITE_APP_ORDERCLOUD_ALLOW_ANONYMOUS=\"true\"";
            File.WriteAllText($"../../../../apps/{webAppName}/.env", string.Join(Environment.NewLine, new { appName, appConfig, baseApiUrl, clientID, scope, customScope, allowAnon }));
        }
    }
}
