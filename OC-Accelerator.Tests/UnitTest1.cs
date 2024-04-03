using Moq;
using OC_Accelerator.Helpers;
using OC_Accelerator.Models;

namespace OC_Accelerator.Tests
{
    public class Tests
    {
        [SetUp]
        public void Setup()
        {
        }

        [Test]
        public void CorrectStorageAccountKindsAreReturned()
        {
            var azPlanOpts = new AzurePlanOptions();
            var storageKinds = azPlanOpts.GetAzureStorageKindValues("Standard_LRS");
            foreach (var expectedStorageKind in new List<string> { "BlobStorage", "Storage", "StorageV2" })
            {
                Assert.Contains(expectedStorageKind, storageKinds);
            }
            Assert.False(storageKinds.Contains("FileStorage"));
            Assert.False(storageKinds.Contains("BlockBlobStorage"));

            storageKinds = azPlanOpts.GetAzureStorageKindValues("Standard_GZRS");
            foreach (var expectedStorageKind in new List<string> { "Storage", "StorageV2" })
            {
                Assert.Contains(expectedStorageKind, storageKinds);
            }
            Assert.False(storageKinds.Contains("FileStorage"));
            Assert.False(storageKinds.Contains("BlockBlobStorage"));
            Assert.False(storageKinds.Contains("BlobStorage"));
        }

        [Test, Ignore("broken")]
        public void Test1()
        {
            var azResourceGenerator = new Mock<AzureResourceService>();
            azResourceGenerator.Setup(a => a.CreateAsync(Console.Out, "storefrontClientId", "adminClientId",
                    "storefront", "admin", "functions"))
                .Returns(Task.FromResult(new AzResourceGeneratorResponse(){azFuncAppName = "functions", azFuncAppUrl = "azurefunction.net"}));
        }
    }
}