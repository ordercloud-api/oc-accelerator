using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OrderCloud.Catalyst;
using OrderCloud.SDK;

namespace Accelerator.Mappers
{
    public class ShippingMapper
    {
        public static async Task<List<ShippingPackage>> MapToPackagesAsync(OrderCheckoutIEPayload payload, IList<ShipEstimate> estimates, IOrderCloudClient oc)
        {
            // Sitecore US headquarters address
            var shipFromAddress = new Address()
            {
                ID = "sitecore-hq",
                AddressName = "US headquarters",
                Street1 = "44 Montgomery Street",
                Street2 = "Suite 3340",
                City = "San Francisco",
                State = "CA",
                Zip = "94104",
                Country = "US",
                CompanyName = "Sitecore"
            };

            var shippingAddress = new Address();
            if (!payload.OrderWorksheet.Order.ShippingAddressID.IsNullOrEmpty())
            {
                shippingAddress = await oc.Addresses.GetAsync(payload.OrderWorksheet.Order.FromUser.CompanyID, payload.OrderWorksheet.Order.ShippingAddressID);
            }
            else
            {
                shippingAddress = payload.OrderWorksheet.LineItems.FirstOrDefault().ShippingAddress;
            }
            return estimates.Select(se =>
                new ShippingPackage()
                {
                    Height = 1m,
                    Width = 1m,
                    Length = 1m,
                    Weight = 10m,
                    ShipFrom = shipFromAddress, // this could come from many locations including Product.ShipFromAddressID
                    ShipTo = shippingAddress, // either a one time address on LineItems or a saved address on the Order
                    SignatureRequired = false,
                    Customs = new CustomsInfo(),
                    Insurance = new InsuranceInfo(),
                    ReturnAddress = new Address() { Street1 = "123 King St", City = "Minneapolis", State = "MN", Zip = "55212" }
                }).ToList();
        }
    }
}
