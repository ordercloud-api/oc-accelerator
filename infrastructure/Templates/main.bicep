@minLength(3)
@maxLength(10)
@description('Provide a prefix for your resources (hyphens will be removed)')
param prefix string = 'ocstart'

@description('Name of the directory that represents your functions application')
param funcAppName string

@description('Name of the directory that represents your admin application')
param adminAppName string

@description('Name of the directory that represents your admin application')
param storefrontAppName string

@description('Provide the azure region to deploy to')
param location string = resourceGroup().location

param adminAppConfig array

// TODO: parameterize this
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

// Creates the storage account
resource functionStorage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${prefix}${uniqueString(resourceGroup().id)}'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

// Creates the functions application
resource functionApp 'Microsoft.Web/sites@2018-11-01' = {
  name: '${prefix}-${funcAppName}-${uniqueString(resourceGroup().id)}'
  location: location
  tags: {}
  kind: 'functionapp'
  properties: {
    siteConfig: {
      appSettings: [
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~20'
        }
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${functionStorage.name};AccountKey=${functionStorage.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
        }
      ]
      cors: {
        allowedOrigins: [
          'https://portal.azure.com'
        ]
      }
      use32BitWorkerProcess: false
      ftpsState: 'Disabled'
      alwaysOn: true
      netFrameworkVersion: 'v6.0'
    }
    clientAffinityEnabled: false
    httpsOnly: true
    serverFarmId: appPlan.id
  }
  dependsOn: []
}

// Creates the admin web application
resource adminWebApp 'Microsoft.Web/sites@2018-11-01' = {
  name: '${prefix}-${adminAppName}-${uniqueString(resourceGroup().id)}'
  kind: 'app'
  location: location
  tags: {}
  properties: {
    siteConfig: {
      appSettings: [for setting in adminAppConfig: {
        name: setting.name
        value: setting.value
      } ]
      minTlsVersion: '1.2'
      nodeVersion: '~20'
      alwaysOn: true
      ftpsState: 'FtpsOnly'
    }
    serverFarmId: appPlan.id
    clientAffinityEnabled: true
    httpsOnly: true
  }
}

// Creates the storefront web application
resource storefrontWebApp 'Microsoft.Web/sites@2018-11-01' = {
  name: '${prefix}-${storefrontAppName}-${uniqueString(resourceGroup().id)}'
  kind: 'app'
  location: location
  tags: {}
  properties: {
    siteConfig: {
      appSettings: [
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~20'
        }
      ]
      minTlsVersion: '1.2'
      nodeVersion: '~20'
      alwaysOn: true
      ftpsState: 'FtpsOnly'
    }
    serverFarmId: appPlan.id
    clientAffinityEnabled: true
    httpsOnly: true
  }
}

// each web/function app needs this, iterate over the three?
resource funcApp_scm 'Microsoft.Web/sites/basicPublishingCredentialsPolicies@2022-09-01' = {
  parent: functionApp
  name: 'scm'
  properties: {
    allow: false
  }
}

resource funcApp_ftp 'Microsoft.Web/sites/basicPublishingCredentialsPolicies@2022-09-01' = {
  parent: functionApp
  name: 'ftp'
  properties: {
    allow: false
  }
}
