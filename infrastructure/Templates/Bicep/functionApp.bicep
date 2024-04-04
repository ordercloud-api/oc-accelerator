@minLength(3)
@maxLength(10)
@description('Provide a prefix for your resources (hyphens will be removed)')
param prefix string = 'ocstart'

@description('Name of the directory that represents your functions application')
param funcAppName string

@description('Provide the azure region to deploy to')
param location string = resourceGroup().location

param funcAppConfig array

param appPlanId string

// Creates the functions application
resource functionApp 'Microsoft.Web/sites@2018-11-01' = {
  name: '${prefix}-${funcAppName}-${uniqueString(resourceGroup().id)}'
  // name: funcAppName
  location: location
  tags: {
    acceleratorApp: 'functions'
  }
  kind: 'functionapp'
  properties: {
    siteConfig: {
      appSettings: [for setting in funcAppConfig: {
        name: setting.name
        value: setting.value
      } ]
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
    serverFarmId: appPlanId
  }
  dependsOn: []
}