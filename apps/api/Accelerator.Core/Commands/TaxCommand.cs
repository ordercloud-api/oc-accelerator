using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OrderCloud.Catalyst;
using OrderCloud.SDK;

namespace Accelerator.Commands
{
    public class TaxCommand(ITaxCalculator taxCalculator)
    {
        public async Task<OrderCalculateResponse> CalculateOrderAsync(OrderCheckoutIEPayload payload)
        {
            var response = new OrderCalculateResponse();
            OrderTaxCalculation calculation;
            var summary = new OrderSummaryForTax()
            {
                LineItems = payload.OrderWorksheet.LineItems.Select(li => new LineItemSummaryForTax()
                {
                    LineItemID = li.ID,
                    Quantity = li.Quantity,
                    LineTotal = li.LineTotal
                }).ToList(),
                OrderID = payload.OrderWorksheet.Order.ID,
                PromotionDiscount = payload.OrderWorksheet.Order.PromotionDiscount
            };

            try
            {
                calculation = await taxCalculator.CalculateEstimateAsync(summary);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Something went wrong, using the default 10.00 tax.");
                calculation = new() { TotalTax = 10m };
            }
            response.TaxTotal = calculation.TotalTax; // Populate Total Tax field on the Order

            return response;
        }
    }
}
