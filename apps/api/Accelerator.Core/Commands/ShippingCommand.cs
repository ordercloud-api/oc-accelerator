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
            var packageWeight = 0;
            //var packageWeight = payload.OrderWorksheet.LineItems.Sum(x => x.Product.ShipWeight);
            // containerization logic - how should lineItem quantities be boxed into a set of shipped packages?
            // All line items in one package for example.
            response.ShipEstimates = new List<ShipEstimate>()
            {
                new ()
                {
                    ShipEstimateItems = payload.OrderWorksheet.LineItems.Select(li => new ShipEstimateItem() {LineItemID = li.ID, Quantity = li.Quantity}).ToList()
                }
            };

            var packages = response.ShipEstimates.Select(se => new ShippingPackage() { Weight = 10m, ShipFrom = payload.OrderWorksheet.Order.BillingAddress});

            // use the interface
            var rates = new List<List<ShippingRate>>();
            try
            {
                rates = await shippingRatesCalculator.CalculateShippingRatesAsync(packages);
            }
            catch (Exception ex)
            {
                rates = new List<List<ShippingRate>>()
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
