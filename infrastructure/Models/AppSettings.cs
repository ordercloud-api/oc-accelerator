using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OC_Accelerator.Models
{
    public interface IAppSettings
    {
        string tenantId { get; }
        string subscriptionId { get; }
        string resourceGroup { get; }
        string ocMiddlewareClientId { get; }
        string ocMiddlewareClientSecret { get; }
        string ocApiUrl { get; }
        string ocHashKey { get; }
        string devOpsPersonalAccessToken { get; }
        string azureGitHubServiceConnectionId { get; }
        string azureResourceManagerServiceConnectionId { get; }

        string azureDevOpsProjectID { get; }
        string appServiceTaskID { get; } // TODO: Probably don't need this in an app settings file. I don't think this is unique to our project - I think this is a universal value to ID the task we need 

    }
    public class AppSettings : IAppSettings
    {
        public string subscriptionId { get; set; }
        public string resourceGroup { get; set; }
        public string? tenantId { get; set; }
        public string devOpsPersonalAccessToken { get; set; }
        public string azureGitHubServiceConnectionId { get; set; }
        public string azureResourceManagerServiceConnectionId { get; set; }
        public string ocMiddlewareClientId { get; set; }
        public string ocMiddlewareClientSecret { get; set; }
        public string ocApiUrl { get; set; }
        public string ocHashKey { get; set; }
        public string azureDevOpsProjectID { get; set; }
        public string appServiceTaskID { get; set;  }
    }
}
