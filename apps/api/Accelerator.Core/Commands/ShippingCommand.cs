using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Accelerator.Mappers;
using OrderCloud.Catalyst;
using OrderCloud.SDK;

namespace Accelerator.Commands
{
    public class ShippingCommand(IShippingRatesCalculator shippingRatesCalculator, IOrderCloudClient oc)
    {
        public async Task<ShipEstimateResponse> EstimateShippingRatesAsync(OrderCheckoutIEPayload payload)
        {
            // All line items in one ship estimate
            var shipEstimateResponse = new ShipEstimateResponse()
            {
                ShipEstimates = new List<ShipEstimate>()
                {
                    new ()
                    {
                        ID = payload.OrderWorksheet.Order.ID,
                        ShipEstimateItems = payload.OrderWorksheet.LineItems.Select(li => new ShipEstimateItem() {LineItemID = li.ID, Quantity = li.Quantity}).ToList(),
                    }
                }
            };
            var packages = await ShippingMapper.MapToPackagesAsync(payload, shipEstimateResponse.ShipEstimates, oc);
            var rates = await shippingRatesCalculator.CalculateShippingRatesAsync(packages);
            for (var i = 0; i < shipEstimateResponse.ShipEstimates.Count; i++)
            {
                shipEstimateResponse.ShipEstimates[0].ShipMethods = rates[i].Select(rate => new ShipMethod()
                {
                    ID = rate.ID,
                    Name = rate.Name,
                    Cost = rate.Cost,
                    EstimatedTransitDays = rate.EstimatedTransitDays,
                }).ToList();
            }

            return shipEstimateResponse;
        }
    }
}
