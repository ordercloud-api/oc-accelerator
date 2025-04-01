using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OrderCloud.Catalyst;

namespace Accelerator.MockServices
{
    public class CreditCardProcessorMock : ICreditCardProcessor
    {
        public Task<string> GetIFrameCredentialAsync(OCIntegrationConfig overrideConfig = null)
        {
            throw new NotImplementedException();
        }

        public Task<CCTransactionResult> AuthorizeOnlyAsync(AuthorizeCCTransaction transaction, OCIntegrationConfig overrideConfig = null)
        {
            throw new NotImplementedException();
        }

        public Task<CCTransactionResult> CapturePaymentAsync(FollowUpCCTransaction transaction, OCIntegrationConfig overrideConfig = null)
        {
            throw new NotImplementedException();
        }

        public Task<CCTransactionResult> CapturePriorAuthorizationAsync(FollowUpCCTransaction transaction, OCIntegrationConfig overrideConfig = null)
        {
            throw new NotImplementedException();
        }

        public Task<CCTransactionResult> InitializePaymentRequestAsync(AuthorizeCCTransaction transaction, OCIntegrationConfig overrideConfig = null,
            bool isCapture = false)
        {
            throw new NotImplementedException();
        }

        public Task<CCTransactionResult> RefundCaptureAsync(FollowUpCCTransaction transaction, OCIntegrationConfig overrideConfig = null)
        {
            throw new NotImplementedException();
        }

        public Task<CCTransactionResult> VoidAuthorizationAsync(FollowUpCCTransaction transaction, OCIntegrationConfig overrideConfig = null)
        {
            throw new NotImplementedException();
        }
    }

    public class CreditCardSaverMock : ICreditCardSaver
    {
        public Task<CardCreatedResponse> CreateSavedCardAsync(PaymentSystemCustomer customer, PCISafeCardDetails card,
            OCIntegrationConfig configOverride = null)
        {
            throw new NotImplementedException();
        }

        public Task DeleteSavedCardAsync(string customerID, string cardID, OCIntegrationConfig configOverride = null)
        {
            throw new NotImplementedException();
        }

        public Task<PCISafeCardDetails> GetSavedCardAsync(string customerID, string cardID, OCIntegrationConfig configOverride = null)
        {
            throw new NotImplementedException();
        }

        public Task<string> InitializeCreateSavedCardRequestAsync(OCIntegrationConfig overrideConfig = null)
        {
            throw new NotImplementedException();
        }

        public Task<List<PCISafeCardDetails>> ListSavedCardsAsync(string customerID, OCIntegrationConfig configOverride = null)
        {
            throw new NotImplementedException();
        }
    }
}
