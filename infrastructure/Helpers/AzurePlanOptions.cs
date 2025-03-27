using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OC_Accelerator.Helpers
{
    public class AzurePlanOptions
    {
        public List<string> GetAzureStorageSkuValues(string planSku)
        {
            switch (planSku)
            {
                case "B1":
                case "B2":
                case "B3":
                    return new List<string>
                    {
                        "Standard_GRS",
                        "Standard_GZRS",
                        "Standard_LRS",
                        "Standard_RAGRS",
                        "Standard_RAGZRS",
                        "Standard_ZRS",
                    };
                default:
                    return new List<string>
                    {
                        "Premium_LRS",
                        "Premium_ZRS",
                    };
            }
        }

        public List<string> GetAzureStorageKindValues(string storageSku)
        {
            // https://learn.microsoft.com/en-us/rest/api/storagerp/srp_sku_types
            var list = new List<string> { "Storage", "StorageV2" };
            if (new List<string> { "Standard_LRS", "Standard_GRS", "Standard_RAGRS" }.Contains(storageSku))
                list.Add("BlobStorage");
            else if (storageSku == "Premium_LRS")
                list.AddRange(new List<string> { "FileStorage", "BlockBlobStorage" });

            return list;
        }

        public List<string> GetAzureAppPlanSkuValues() 
        {
            return new List<string>
            {
                "B1",
                "B2",
                "B3",
                "P0v3",
                "P1v3",
                "P1v2", 
                "P1mv3",
                "P2v3",
                "P2mv3",
                "P3v3",
                "P3mv3",
                "P4mv3",
                "P5mv3",
            };
        }
    }
}
