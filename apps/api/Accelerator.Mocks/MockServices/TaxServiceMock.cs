using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OrderCloud.Catalyst;

namespace Accelerator.MockServices
{
    public class TaxServiceMock : ITaxCalculator
    {
        public Task<OrderTaxCalculation> CalculateEstimateAsync(OrderSummaryForTax orderSummary, OCIntegrationConfig configOverride = null)
        {
            return Task.FromResult(new OrderTaxCalculation() { TotalTax = 7.5m });
        }

        public Task<OrderTaxCalculation> CommitTransactionAsync(OrderSummaryForTax orderSummary, OCIntegrationConfig configOverride = null)
        {
            throw new NotImplementedException();
        }
    }
}
