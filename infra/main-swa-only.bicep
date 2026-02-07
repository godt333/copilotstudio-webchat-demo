// Citizen Advice Website - Static Web App Only
// Deploys just the Static Web App for the React frontend

@description('The location for the resources')
param location string = 'eastus2'

@description('The name of the Static Web App')
param staticWebAppName string = 'swa-citizenadvice-techconnect'

@description('SKU for the Static Web App')
@allowed(['Free', 'Standard'])
param staticWebAppSku string = 'Free'

@description('Tags for the resources')
param tags object = {
  project: 'CitizenAdvice'
  environment: 'dev'
  purpose: 'GT-TechConnect2026 Voice Demo'
}

// Static Web App for hosting the React frontend
resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: location
  tags: tags
  sku: {
    name: staticWebAppSku
    tier: staticWebAppSku
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    buildProperties: {
      appLocation: '/'
      outputLocation: 'dist'
      appBuildCommand: 'npm run build'
    }
  }
}

// Outputs
@description('The default hostname of the Static Web App')
output staticWebAppUrl string = staticWebApp.properties.defaultHostname

@description('The resource ID of the Static Web App')
output staticWebAppId string = staticWebApp.id

@description('The name of the Static Web App')
output staticWebAppName string = staticWebApp.name
