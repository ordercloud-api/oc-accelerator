# OC-Accelerator
A tool for automating infrastructure and devops enabling developers to quickly set up the processes necessary to build their own marketplace. 

The Accelerator creates OrderCloud API Clients configured for Storefront, Admin, and Integrations applications and provisions the Azure resources necessary for hosting each of those applications. With the OrderCloud and Azure resources created, the tool will create and populate .env.local files for each your applications to speed up your local development set up, and will also create and populate the .vscode/settings.json files to simplify the ability to publish your applications right from VS Code.

## Getting Started with Seeding the Infrastructure

### Configure OrderCloud
1. Navigate to the API console for your marketplace
2. Create an API Client for your Azure Function Application
    ```json
    {
        "AppName": "Azure Functions App",
        "Active": true,
        "ClientSecret": "GENERATE_A_LONG_NONGUESSABBLE_SECRET",
        "AccessTokenDuration": 600,
        "RefreshTokenDuration": 3200,
        "AllowSeller": true
    }
    ```
3. Create an admin user (no password required)
    ```json
    {
        "ID": "admin",
        "Username": "admin",
        "FirstName": "Admin",
        "LastName": "User",
        "Email": "admin@example.com",
        "Active": true
    }
    ```
3. Create a security profile
    ```json
    {
        "ID": "azure-functions-app",
        "Name": "Azure Functions App",
        "Roles": [
            "ApiClientAdmin",
            "BuyerAdmin",
            "BuyerUserAdmin",
            "CatalogAdmin",
            "WebhookAdmin",
            "SecurityProfileAdmin",
            "IntegrationEventAdmin"
        ]
    }
    ```
4. Assign the security profile to the admin user
    ```json
    {
        "SecurityProfileID": "azure-functions-app",
        "UserID": "admin"
    }
    ```
5. Set `DefaultContextUser` for the API Client to the admin user

### Configure app settings

1. Open the root of the project in Visual Studio Code
2. Under the /infrastructure directory, copy the `appSettings.example.json` file to `appSettings.json`
3. Populate the following values in `appSettings.json`
    - `ocFunctionsClientId` - the ID of your API Client for your Azure Functions application
    - `ocFunctionsClientSecret` - the secret of your API Client for your Azure Functions application
    - `ocApiUrl` - the URL of your OrderCloud API (varies by region/environment)
    - `ocHashKey` - a long non-guessable string (max 50 characters) that will be used when creating a Webhook and the OrderCheckout Integration Event. This value should be kept secret, and is used to verify requests to your application come from OrderCloud. Read more about verifying requests [here](https://ordercloud.io/knowledge-base/using-webhooks#verifying-the-webhook-request).
    - Optional: The infrastructure seeding tool will create API Clients representing your Storefront and Admin applications. However, if you already have an established marketplace and wish to use existing API Clients for your Storefront and/or Admin applications, add them to the appSettings.json as `ocStorefrontClientId` and/or `ocAdminClientId`.

### Configure Azure

#### Create a Subscription, and a Resource Group within that Subscription in Azure portal

1. Create a [Subscription](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-subscription)
    - Under the"Overview" section
        - Set the `subscriptionId` value to the "Subscription ID"
        - Set the `tenantId` value to the "Parent management group"
3. Create a [Resource Group](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal#create-resource-groups).
    - Set the `resourceGroup` value to the "Resource Group"

#### Install Powershell and Azure CLI

1. [Powershell](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell?view=powershell-7.4)
2. [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) (this is needed to compile a .bicep file into an ARM template JSON file)

#### Install Azure App Service extension in VS Code

This extension is necessary in order to publish your code to a web application created via accelerator tool

1. Open the Extensions sidebar in VS Code
2. Search for ["Azure App Service"](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azureappservice)
3. Install the extension

#### Install C# extension in VS Code

This extension is necessary in order to run the accelerator tool

1. Open the Extensions sidebar in VS Code
2. Search for ["C#"](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp)
3. Install the extension

### Run the Accelerator
1. Open the /infrastructure directory in VS code and click "Run and Debug" in the left toolbar. The program will run in the integrated terminal within VS Code.
    - Note: A browser window will open to the Azure Portal. If you are not already logged in, you will be prompted to login.
2. Select `Seed Azure Infrastructure` for your first execution. You can use the arrow keys to select the option and hit enter to run it.
3. Follow the prompts in the terminal.

### Publish Your App Code
1. Once the accelerator has run successfully, you should be able to see two web app services, an app service plan, an Azure function, and a storage account all within the resource group you created.
2. In VS Code, open the directory for the app code you want to publish and run `npm install`
3. In the file explorer, right click and select "Deploy To Web App" (or Deploy To Function App if deploying your functions code)

### Admin Application Additional Setup
1. You will need an admin user to log into the admin application. Navigate to your marketplace in [OrderCloud Portal](https://portal.ordercloud.io/) and open the API Console.
2. Navigate to Admin Users and create a new user with a password.  The admin user will now have the necessary `admin` security profile roles to view and edit all resources included in the admin application.