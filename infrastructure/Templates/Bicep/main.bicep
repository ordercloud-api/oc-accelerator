@minLength(3)
@maxLength(10)
@description('Provide a prefix for your resources (hyphens will be removed)')
param prefix string = 'ocstart'

@description('Name of the directory that represents your admin application')
param adminAppName string

@description('Name of the directory that represents your admin application')
param storefrontAppName string

@description('Provide the azure region to deploy to')
param location string = resourceGroup().location

param adminAppConfig array

param storefrontAppConfig array

param appPlanSkuName string

param storageSkuName string

param storageType string

param accessTier string?

// Creates the app service plan
resource appPlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: '${prefix}-appplan-${uniqueString(resourceGroup().id)}'
  location: location
  sku: {
    name: appPlanSkuName
    // ARE ANY OF THESE NECESSARY?
    // tier: 'PremiumV2' 
    // size: 'P1v2'
    // family: 'Pv2'
    // capacity: 1
  }
}

// Creates the storage account
resource functionStorage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${prefix}${uniqueString(resourceGroup().id)}'
  location: location
  sku: {
    name: storageSkuName
  }
  kind: storageType
  properties: accessTier != null ? {
    accessTier: accessTier
  } : null
}

// Creates the admin web application
resource adminWebApp 'Microsoft.Web/sites@2018-11-01' = {
  name: '${prefix}-${adminAppName}-${uniqueString(resourceGroup().id)}'
  kind: 'app'
  location: location
  tags: {
    acceleratorApp: 'admin'
  }
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
  tags: {
    acceleratorApp: 'storefront'
  }
  properties: {
    siteConfig: {
      appSettings: [for setting in storefrontAppConfig: {
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

// each web/function app needs this, iterate over the three?
resource adminApp_scm 'Microsoft.Web/sites/basicPublishingCredentialsPolicies@2022-09-01' = {
  parent: adminWebApp
  name: 'scm'
  properties: {
    allow: false
  }
}

resource adminApp_ftp 'Microsoft.Web/sites/basicPublishingCredentialsPolicies@2022-09-01' = {
  parent: adminWebApp
  name: 'ftp'
  properties: {
    allow: false
  }
}
