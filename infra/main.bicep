// Citizen Advice Website - Azure Infrastructure
// Deploys a Static Web App for the React frontend
// Deploys an App Service for the Voice Server backend

@description('The location for the resources')
param location string = 'eastus'

@description('The name of the Static Web App')
param staticWebAppName string = 'swa-citizenadvice-dev'

@description('The name of the App Service Plan')
param appServicePlanName string = 'asp-citizenadvice-dev'

@description('The name of the Voice Server App Service')
param voiceServerAppName string = 'app-citizenadvice-voice-dev'

@description('SKU for the Static Web App')
@allowed(['Free', 'Standard'])
param staticWebAppSku string = 'Free'

@description('SKU for the App Service Plan')
param appServiceSku string = 'B1'

@description('Azure Speech Services Key')
@secure()
param speechKey string

@description('Azure Speech Services Region')
param speechRegion string = 'eastus'

@description('Copilot Studio Direct Line Token Endpoint')
param directLineTokenEndpoint string

@description('Proxy Bot Direct Line Secret (optional)')
@secure()
param proxyBotDirectLineSecret string = ''

@description('Tags for the resources')
param tags object = {
  project: 'CitizenAdvice'
  environment: 'dev'
  purpose: 'Copilot Studio Demo'
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

// App Service Plan for the Voice Server
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  sku: {
    name: appServiceSku
  }
  properties: {
    reserved: true // Linux
  }
  kind: 'linux'
}

// App Service for the Voice Server (Node.js backend)
resource voiceServerApp 'Microsoft.Web/sites@2023-12-01' = {
  name: voiceServerAppName
  location: location
  tags: tags
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        {
          name: 'SPEECH_KEY'
          value: speechKey
        }
        {
          name: 'SPEECH_REGION'
          value: speechRegion
        }
        {
          name: 'DIRECT_LINE_TOKEN_ENDPOINT'
          value: directLineTokenEndpoint
        }
        {
          name: 'PROXY_BOT_DIRECT_LINE_SECRET'
          value: proxyBotDirectLineSecret
        }
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'PORT'
          value: '8080'
        }
      ]
      cors: {
        allowedOrigins: [
          'https://${staticWebApp.properties.defaultHostname}'
          'http://localhost:5173'
          'http://localhost:5174'
        ]
        supportCredentials: false
      }
    }
  }
}

// Configure Static Web App to use the Voice Server API
resource staticWebAppConfig 'Microsoft.Web/staticSites/config@2023-12-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    VITE_VOICE_SERVER_URL: 'https://${voiceServerApp.properties.defaultHostName}'
  }
}

// Outputs
@description('The default hostname of the Static Web App')
output staticWebAppUrl string = staticWebApp.properties.defaultHostname

@description('The resource ID of the Static Web App')
output staticWebAppId string = staticWebApp.id

@description('The name of the Static Web App')
output staticWebAppName string = staticWebApp.name

@description('The Voice Server URL')
output voiceServerUrl string = voiceServerApp.properties.defaultHostName

@description('The Voice Server App Name')
output voiceServerAppName string = voiceServerApp.name
