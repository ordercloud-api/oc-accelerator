using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OrderCloud.Catalyst;
using OrderCloud.SDK;

namespace Accelerator.Commands
{
    public class ShippingCommand(IShippingRatesCalculator shippingRatesCalculator)
    {
        public async Task<ShipEstimateResponse> EstimateShippingRatesAsync(OrderCheckoutIEPayload payload)
        {
            var response = new ShipEstimateResponse();

            // All line items in one package for example.
            response.ShipEstimates = new List<ShipEstimate>()
            {
                new ()
                {
                    ID = Guid.NewGuid().ToString(),
                    ShipEstimateItems = payload.OrderWorksheet.LineItems.Select(li => new ShipEstimateItem() {LineItemID = li.ID, Quantity = li.Quantity}).ToList()
                }
            };

            var packages = response.ShipEstimates.Select(se => new ShippingPackage() { Weight = 10m, ShipFrom = payload.OrderWorksheet.Order.BillingAddress});
            var rates = new List<List<ShippingRate>>();
            try
            {
                rates = await shippingRatesCalculator.CalculateShippingRatesAsync(packages);
            }
            catch (Exception ex)
            {
                // SOMETHING WENT WRONG. CHECK YOUR CREDENTIALS. FOR TESTING, RETURN A FREE SHIPPING OPTION
                rates = new()
                {
                    new()
                    {
                        new()
                        {
                            ID = "freeshipping",
                            Cost = 0m,
                            Name = "FREE SHIPPING",
                            EstimatedTransitDays = 10
                        }
                    }
                };
            }

            for (var i = 0; i < response.ShipEstimates.Count; i++)
            {
                response.ShipEstimates[0].ShipMethods = new List<ShipMethod>()
                {
                    new()
                    {
                        ID = rates[i][0].ID,
                        Name = rates[i][0].Name,
                        Cost = rates[i][0].Cost,
                        EstimatedTransitDays = rates[i][0].EstimatedTransitDays
                    }
                };

            }

            return response;
        }
    }
}
