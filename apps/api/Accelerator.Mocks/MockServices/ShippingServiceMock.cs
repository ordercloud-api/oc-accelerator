using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OrderCloud.Catalyst;

namespace Accelerator.MockServices
{
    public class ShippingServiceMock : IShippingRatesCalculator
    {
        public Task<List<List<ShippingRate>>> CalculateShippingRatesAsync(IEnumerable<ShippingPackage> shippingPackages, OCIntegrationConfig configOverride = null)
        {
            return Task.FromResult(new List<List<ShippingRate>>()
            {
                new ()
                {
                    new ShippingRate()
                    {
                        Cost = 45.45m,
                        EstimatedTransitDays = 1,
                        Carrier = "USPS",
                        ID = "MOCK_rate_f0fef73584ec4220b6358b7fbdda64e2",
                        Name = "Express"
                    },
                    new ShippingRate()
                    {
                        Cost = 9.75m,
                        EstimatedTransitDays = 2,
                        ID = "MOCK_rate_aef562aefcca4907944b55f152630af5",
                        Name = "Priority"
                    },
                    new ShippingRate()
                    {
                        Cost = 5.62m,
                        EstimatedTransitDays = 4,
                        ID = "MOCK_rate_cbc72eaa10ea4c6da0e8f55cc2aec106",
                        Name = "GroundAdvantage"
                    }
                }
            });
        }
    }
}
