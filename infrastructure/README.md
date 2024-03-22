# OC-Accelerator
Aimed to get developers

## Getting Started
Create an `appSettings.json` file in the root of this directory.

If you haven't already, create an account in [OrderCloud Portal](https://portal.ordercloud.io/). Once you've created an account, create a new Marketplace. 
Access the API Console for your marketplace you just created by selecting "API Console" on the left navigation bar, and selecting a context when you get to the console.

1. Create an API Client set up for a `client_credentials` [authentication](https://ordercloud.io/knowledge-base/authentication#ordercloud-workflows) grant type. This API Client will serve as your "middleware API Client".
1. Create an Admin User (you do not need to set a password for this user).
1. Create a Security Profile with `ApiClientAdmin`, `BuyerAdmin`, `BuyerUserAdmin`, `CatalogAdmin`, `WebhookAdmin`, and `IntegrationEventAdmin1`.
1. Assign that Security Profile to the Admin User you created.
1. In the API Client you created in step 1, update the API Client to set the Admin User you created as the Default Context User.
1. Populate `ocMiddlewareClientId`, `ocMiddlewareClientSecret`, `ocApiUrl`, `ocHashKey` in your appSettings.json file. `ocHashKey` is a value you define on your own, and will be used when creating a Webhook and the OrderCheckout Integration Event. This value should be kept secret, and is used to verify requests to your application come from OrderCloud. Read more about verifying requests [here](https://ordercloud.io/knowledge-base/using-webhooks#verifying-the-webhook-request).

Create a Subscription, and a Resource Group within that Subscription in Azure portal
1. Create a [Subscription](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-subscription).
1. Once the subscription is created, note the "Subscription ID" and "Parent management group" values. These are found in the "Overview" secion.
1. Create a [Resource Group](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal#create-resource-groups).
1. Populate `subscriptionId`, `tenantId` (Parent management group), and `resourceGroup` in your appSettings.json file.

Install Powershell and Azure CLI
1. [Powershell](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell?view=powershell-7.4)
1. [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) (this is needed to compile a .bicep file into an ARM template JSON file)

### Ignore for now (post-MVP)
Log in to Azure DevOps
1. Create a Personal Access Token with [SCOPES]
1. Create a GitHub Service Connection
1. Create an Azure Resource Management Service Connection > Service Principle (automatic or manual - your preference. If you belong to multiple tenants, you may want to select manual). Configure the service connection to point to your Azure Subscription and Resource Group.
