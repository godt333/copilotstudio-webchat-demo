using './main.bicep'

param location = 'eastus2'
param staticWebAppName = 'swa-citizenadvice-techconnect'
param appServicePlanName = 'asp-citizenadvice-techconnect'
param voiceServerAppName = 'app-citizenadvice-voice-techconnect'
param staticWebAppSku = 'Free'
param appServiceSku = 'F1'

// Azure Speech Services - from your .env
param speechKey = '<YOUR_SPEECH_KEY>'
param speechRegion = 'eastus'

// Copilot Studio Direct Line Token Endpoint - from your .env
param directLineTokenEndpoint = 'https://3ef8c0f81a1be5eabbfb700d2af059.06.environment.api.powerplatform.com/powervirtualagents/botsbyschema/copilots_header_79c18/directline/token?api-version=2022-03-01-preview'

// Proxy Bot Direct Line Secret (pending from colleague)
param proxyBotDirectLineSecret = ''

param tags = {
  project: 'CitizenAdvice'
  environment: 'dev'
  purpose: 'GT-TechConnect2026 Voice Demo'
}
