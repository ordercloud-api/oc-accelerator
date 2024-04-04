using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OC_Accelerator.Models
{
    public interface IAppSettings
    {
        string? azureResourcePrefix { get; } // TODO: this shouldn't be nullable but make it so for testing and rely on random string prefix
        string? tenantId { get; }
        string subscriptionId { get; }
        string resourceGroup { get; }
        string ocFunctionsClientId { get; }
        string ocFunctionsClientSecret { get; }
        string ocApiUrl { get; }
        string ocHashKey { get; }
        string? ocStorefrontClientId { get; }
        string? ocStorefrontScope { get; }
        string? ocStorefrontCustomScope { get; }
        bool? ocStorefrontAllowAnon { get; }
        string? ocAdminClientId { get; }
        string? ocAdminScope { get; }
        string? ocAdminCustomScope { get; }

        string devOpsPersonalAccessToken { get; }
        string azureGitHubServiceConnectionId { get; }
        string azureResourceManagerServiceConnectionId { get; }

        string azureDevOpsProjectID { get; }
        string appServiceTaskID { get; } // TODO: Probably don't need this in an app settings file. I don't think this is unique to our project - I think this is a universal value to ID the task we need 

    }
    public class AppSettings : IAppSettings
    {
        public string? azureResourcePrefix { get; set; }
        public string subscriptionId { get; set; }
        public string resourceGroup { get; set; }
        public string? tenantId { get; set; }
        public string devOpsPersonalAccessToken { get; set; }
        public string azureGitHubServiceConnectionId { get; set; }
        public string azureResourceManagerServiceConnectionId { get; set; }
        public string ocFunctionsClientId { get; set; }
        public string ocFunctionsClientSecret { get; set; }
        public string ocApiUrl { get; set; }
        public string ocHashKey { get; set; }
        public string? ocStorefrontClientId { get; set; }
        public string? ocStorefrontScope { get; set; }
        public string? ocStorefrontCustomScope { get; set; }
        public bool? ocStorefrontAllowAnon { get; set; }
        public string? ocAdminClientId { get; set; }
        public string? ocAdminScope { get; set; }
        public string? ocAdminCustomScope { get; set; }
        public string azureDevOpsProjectID { get; set; }
        public string appServiceTaskID { get; set;  }
    }
}
