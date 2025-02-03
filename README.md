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
2. Create a new file in the infrastructure directory called `appSettings.json`
3. Copy the contents of `appSettings.example.json` file into the `appSettings.json` file you just created
4. Populate the following values in `appSettings.json`
    - `ocFunctionsClientId` - the ID of your API Client for your Azure Functions application
    - `ocFunctionsClientSecret` - the secret of your API Client for your Azure Functions application
    - `ocApiUrl` - the URL of your OrderCloud API (varies by region/environment)
       - can be found in Portal > Settings > OrderCloud API Instance > API Server
    - `ocHashKey` - a long non-guessable string (max 50 characters) that will be used when creating a Webhook and the OrderCheckout Integration Event. This value should be kept secret, and is used to verify requests to your application come from OrderCloud. Read more about verifying requests [here](https://ordercloud.io/knowledge-base/using-webhooks#verifying-the-webhook-request).
    - Optional: The infrastructure seeding tool will create API Clients representing your Storefront and Admin applications. However, if you already have an established marketplace and wish to use existing API Clients for your Storefront and/or Admin applications, add them to the `appSettings.json` as `ocStorefrontClientId` and/or `ocAdminClientId`.

### Configure Azure

#### Create a Subscription, and a Resource Group within that Subscription in Azure portal

1. Create a [Subscription](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-subscription) or select an existing one
    - Under the "Overview" section
        - Copy the "Subscription ID" and paste it in `subscriptionId` in `appSettings.json`
        - Copy the "Parent management group" value and paste it in `tenantId` in `appSettings.json` 
2. Create a [Resource Group](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal#create-resource-groups) or select an existing one 
    - Copy the name of the Resource group and paste it in `resourceGroup` in `appSettings.json` 

#### Install Powershell, Azure CLI, Node.js, and Dotnet SDK if needed

1. [Powershell](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell?view=powershell-7.4)
2. [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) (this is needed to compile a .bicep file into an ARM template JSON file)
3. [Node.js](https://nodejs.org/en/download/package-manager)
4. [.NET 8.0](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)

#### Install VS Code Extensions

1. [Azure App Service extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azureappservice)
    - This extension is necessary in order to publish your code to a web application created via accelerator tool
2. [Azure Functions extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions)
    - This extension is necessary in order to deploy the functions application
3. [C# extension](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp)
    - This extension is necessary in order to run the accelerator tool
4. [C# Dev Kit extension](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit)
    - This extension is necessary in order to run the accelerator tool

### Run the Accelerator
1. Open the /infrastructure directory in VS code and click "Run and Debug" in the left toolbar. The program will run in the integrated terminal within VS Code.
    - Select the C# Launch Configuration from the dropdown.
    - A browser window will open to the Azure Portal. If you are not already logged in, you will be prompted to login.
2. Select `Seed Azure Infrastructure` for your first execution. You can use the arrow keys to select the option and hit enter to run it.
3. Follow the prompts in the terminal.
4. Once the accelerator has run successfully, you should be able to see two web app services, an app service plan, an Azure function, and a storage account all within the resource group you created.

### Admin Application Additional Setup
1. You will need an admin user to log into the admin application. Navigate to your marketplace in [OrderCloud Portal](https://portal.ordercloud.io/) and open the API Console.
2. Navigate to Admin Users and create a new user with a password.  The admin user will now have the necessary `admin` security profile roles to view and edit all resources included in the admin application.

### Publish Your App Code
1. In VS Code, open the directory for the app code you want to publish (admin, functions, or storefront) and run `npm install`
    - Ensure you do not have the project open at the root, as attempting to deploy from the root will cause unintended results.
2. Right click anywhere in the file explorer and select "Deploy To Web App" or "Deploy To Function App".  Please note, this option will not appear if you have opened the project root in VS Code.
3. If your deployment was successful, you should see a popup in the lower right hand side that will launch the app
   - If your initial attempt at deploy was unsuccessful and you have to retry, occasionally you may observe a 503 in the browser for 2-3 minutes before the site loads correctly
   

