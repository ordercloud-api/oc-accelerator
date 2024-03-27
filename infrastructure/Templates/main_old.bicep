@minLength(3)
@maxLength(10)
@description('Provide a prefix for your resources')
param prefix string = 'ocstart'

@description('Provide the azure region to deploy to')
param location string = resourceGroup().location

@description('Provide the API client ID representing the buyer')
param storefrontApiClientID string

@description('Name of the directory that represents your buyer/storefront application')
param storefrontAppName string

@description('Provide the API client ID representing the seller')
param adminApiClientID string

@description('Name of the directory that represents your admin application')
param adminAppName string

@description('Provide the hash key value of webhooks, integration events, etc.')
param hashKey string

@description('Provide the OC API URL to your marketplace')
param ocApiUrl string = 'https://sandboxapi.ordercloud.io'

@description('Name of the directory that represents your functions application')
param funcAppName string

// Creates the storage account
resource functionStorage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${prefix}${uniqueString(resourceGroup().id)}'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

param keyData array = [
  {
    key: 'OrderCloudSettings.StorefrontApiClientID'
    value: storefrontApiClientID
    // tag: {
    //   tag01_name: 'tag01_value'
    //   tag02_name: 'tag02_value'
    // }
    contentType: 'string'
  }
  {
    key: 'OrderCloudSettings.AdminApiClientID'
    value: adminApiClientID
    //label: 'key02_label01'
    // tag: {
    //   tag01_name: 'tag01_value'
    //   tag02_name: 'tag02_value'
    // }
    contentType: 'string'
  }
  {
    key: 'OrderCloudSettings.ApiUrl'
    value: ocApiUrl
    contentType: 'string'
  }
    {
    key: 'OrderCloudSettings.HashKey'
    value: hashKey
    contentType: 'string'
  }
]

// Create the app configuration
resource appConfig 'Microsoft.AppConfiguration/configurationStores@2023-03-01' = {
  name: '${prefix}-config-${uniqueString(resourceGroup().id)}'
  location: location
  sku: {
    name: 'Standard'
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    enablePurgeProtection: false // This is just for testing so I can delete and try again
  }
}

resource configStoreName_keyData_label_keyData_key 'Microsoft.AppConfiguration/configurationStores/keyValues@2020-07-01-preview' = [for item in keyData: {
  parent: appConfig
  name: '${(contains(item, 'label') ? '${item.key}$${item.label}' : item.key)}'
  properties: {
    value: item.value
    contentType: (contains(item, 'contentType') ? item.contentType : null)
    tags: (contains(item, 'tag') ? item.tag : null)
  }
}]

// Creates the app service plan
resource appPlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: '${prefix}-appplan-${uniqueString(resourceGroup().id)}'
  location: location
  sku: {
    name: 'P1v2'
    tier: 'PremiumV2'
    size: 'P1v2'
    family: 'Pv2'
    capacity: 1
  }
}

// Defines unique details for every web app/func app created
param appDetails array = [
  {
    name: '${prefix}-${storefrontAppName}-${uniqueString(resourceGroup().id)}'
    kind: 'app'
    clientAffinityEnabled: true
  }
  {
    name: '${prefix}-${adminAppName}-${uniqueString(resourceGroup().id)}'
    kind: 'app'
    clientAffinityEnabled: true
  }
  {
    name: '${prefix}-${funcAppName}-${uniqueString(resourceGroup().id)}'
    kind: 'functionapp'
    clientAffinityEnabled: true
  }
]

// Create web and function apps
resource webApps 'Microsoft.Web/sites@2022-09-01' = [for app in appDetails: {
  name: app.name
  kind: app.kind
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appPlan.id
    httpsOnly: true
    clientAffinityEnabled: app.clientAffinityEnabled
    siteConfig: {
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      netFrameworkVersion: 'v6.0'
      remoteDebuggingEnabled: false
      webSocketsEnabled: false
      use32BitWorkerProcess: false
    }
  }
}]

// Create slots for each web and function app
resource webAppSlots 'Microsoft.Web/sites/slots@2022-09-01' = [for (app, i) in appDetails: {
  name: 'warmup'
  kind: app.kind
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  parent: webApps[i]
  properties: {
    serverFarmId: appPlan.id
    httpsOnly: true
    clientAffinityEnabled: app.clientAffinityEnabled
    siteConfig: {
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      netFrameworkVersion: 'v6.0'
      remoteDebuggingEnabled: false
      webSocketsEnabled: false
      use32BitWorkerProcess: false
    }
  }
}]

// Configures the key vault and access policies
// Note: This will remove any manually added access policies when re-run
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: '${prefix}-kv-${uniqueString(resourceGroup().id)}'
  location: location
  properties: {
    accessPolicies: [for i in range(0, 6): {
        tenantId: subscription().tenantId
        objectId: i <= 2 ? webAppSlots[i].identity.principalId : webApps[i-3].identity.principalId
        permissions: {
          keys: [
            'encrypt', 'decrypt', 'wrapKey', 'unwrapKey', 'sign', 'verify', 'get', 'list', 'create', 'update', 'import', 'delete', 'backup', 'restore', 'recover', 'purge'
          ]
          secrets: [
            'get', 'list', 'set', 'delete', 'backup', 'restore', 'recover', 'purge'
          ]
          certificates: [
            'get', 'list', 'delete', 'create', 'import', 'update', 'managecontacts', 'getissuers', 'listissuers', 'setissuers', 'deleteissuers', 'manageissuers', 'recover', 'purge'
          ]
        }
    }]
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
  }
}

// Create key vault reference with application configuration connection string
resource appConfigurationConnectionKvRef 'Microsoft.KeyVault/vaults/secrets@2023-02-01' = {
  parent: keyVault
  name: 'appConfigConnectionString'
  properties: {
    value: appConfig.listKeys().value[0].connectionString
    // for the function app, we want the storage account connection string
  }
}

// Configure app settings for web apps
resource webAppSettings 'Microsoft.Web/sites/config@2022-09-01' = [for (app, i) in appDetails: if (app.kind != 'functionapp') {
  parent: webApps[i]
  name: 'web'
  properties: {
    appSettings: [
      {
        name: 'AppConfigurationConnectionString'
        value: '@Microsoft.KeyVault(SecretUri=${appConfigurationConnectionKvRef.properties.secretUri})'
      }
      {
        name: 'VITE_APP_NAME'
        value: app.name
      }
      {
        name: 'VITE_APP_CONFIG_BASE'
        value: '/'
      }
    ]
  }
}]

// Configure slot settings for web apps
resource webAppSlotSettings 'Microsoft.Web/sites/slots/config@2022-09-01' = [for (app, i) in appDetails: if (app.kind != 'functionapp') {
  parent: webAppSlots[i]
  name: 'web'
  properties: {
    appSettings: [
      {
        name: 'AppConfigurationConnectionString'
        value: '@Microsoft.KeyVault(SecretUri=${appConfigurationConnectionKvRef.properties.secretUri})'
      }
    ]
  }
}]

// // Configure slot settings for web apps
// resource azFunctionSlotSettings 'Microsoft.Web/sites/slots/config@2022-09-01' = {
//   parent: webAppSlots[2]
//   name: 'web'
//   properties: {
//     appSettings: [
//       {
//         name: 'AppConfigurationConnectionString'
//         value: '@Microsoft.KeyVault(SecretUri=${appConfigurationConnectionKvRef.properties.secretUri})'
//       }
//     ]
//   }
// }


// // Configure app settings for web apps
// resource azFunctionSettings 'Microsoft.Web/sites/config@2022-09-01' = {
//   parent: webApps[2]
//   name: 'web'
//   properties: {
//     appSettings: [
//       {
//         name: 'AppConfigurationConnectionString'
//         value: '@Microsoft.KeyVault(SecretUri=${appConfigurationConnectionKvRef.properties.secretUri})'
//       }
//     ]
//   }
// }
