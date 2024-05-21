# OC-Accelerator
A tool for automating infrastructure and devops enabling developers to quickly set up the processes necessary to build their own marketplace. The Accelerator creates OrderCloud API Clients configured for Storefront, Admin, and Integrations applications and provisions the Azure resources necessary for hosting each of those applications. With the OrderCloud and Azure resources created, the tool will create and populate .env.local files for each your applications to speed up your local development set up, and will also create and populate the .vscode/settings.json files to simplify the ability to publish your applications right from VS Code.  

## Getting Started with Seeding the Infrastructure
Create an `appSettings.json` file in the root of the /Infrastructure directory.

If you haven't already, create an account in [OrderCloud Portal](https://portal.ordercloud.io/). Once you've created an account, create a new Marketplace. 
Access the API Console for your marketplace you just created by selecting "API Console" on the left navigation bar, and selecting a context when you get to the console.

1. Create an API Client set up for a `client_credentials` [authentication](https://ordercloud.io/knowledge-base/authentication#ordercloud-workflows) grant type. This API Client will represent your Azure Function Application.
1. Create an Admin User (you do not need to set a password for this user).
1. Create a Security Profile with `ApiClientAdmin`, `BuyerAdmin`, `BuyerUserAdmin`, `CatalogAdmin`, `WebhookAdmin`, and `IntegrationEventAdmin1`.
1. Assign that Security Profile to the Admin User you created.
1. In the API Client you created in step 1, update the API Client to set the Admin User you created as the Default Context User.
1. Populate `ocFunctionsClientId` (from step 1), `ocFunctionsClientSecret` (also from step 1), `ocApiUrl ` (found in the portal in the context of a marketplace, under "Base URL"), `ocHashKey` in your appSettings.json file. `ocHashKey` is a value you define on your own, and will be used when creating a Webhook and the OrderCheckout Integration Event. This value should be kept secret, and is used to verify requests to your application come from OrderCloud. Read more about verifying requests [here](https://ordercloud.io/knowledge-base/using-webhooks#verifying-the-webhook-request).
Optional: The infrastructure seeding tool will create API Clients representing your Storefront and Admin applications. However, if you already have an established marketplace and wish to use existing API Clients for your Storefront and/or Admin applications, add them to the appSettings.json as `ocStorefrontClientId` and/or `ocAdminClientId`.

Create a Subscription, and a Resource Group within that Subscription in Azure portal
1. Create a [Subscription](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-subscription).
1. Once the subscription is created, note the "Subscription ID" and "Parent management group" values. These are found in the "Overview" secion.
1. Create a [Resource Group](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal#create-resource-groups).
1. Populate `subscriptionId`, `tenantId` (Parent management group), and `resourceGroup` in your appSettings.json file.

Install Powershell and Azure CLI
1. [Powershell](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell?view=powershell-7.4)
1. [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) (this is needed to compile a .bicep file into an ARM template JSON file)

Install Azure App Service extension in VS Code
- This will be necessary in order to publish your code to a web application created via accelerator tool

Run the Accelerator
1. Navigate to the /infrastructure directory and click "Run and Debug". The program will run in the integrated terminal within VS Code
1. Select Seed Azure Infrastructure for your first execution.
1. Follow the prompts in the terminal

Publish Your App Code
1. Once the accelerator has run successfully, you should be able to see two web app services, an app service plan, an Azure function, and a storage account all within the resource group you created.
1. In VS Code, open the directory for the app code you want to publish.
1. In the file explorer, right click and select "Deploy To Web App" (or Deploy To Function App if deploying your functions code)

### Ignore for now (post-MVP)
Log in to Azure DevOps
1. Create a Personal Access Token with [SCOPES]
1. Create a GitHub Service Connection
1. Create an Azure Resource Management Service Connection > Service Principle (automatic or manual - your preference. If you belong to multiple tenants, you may want to select manual). Configure the service connection to point to your Azure Subscription and Resource Group.
