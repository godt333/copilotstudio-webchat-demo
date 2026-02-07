<#
.SYNOPSIS
    Deploys the DLS Proxy Bot to Azure.

.DESCRIPTION
    This script deploys all required Azure resources for the Direct Line Speech proxy bot:
    - Azure App Service Plan
    - Azure App Service (Node.js)
    - Azure Bot Service
    - Direct Line Speech Channel
    - Web Chat Channel

.PARAMETER ResourceGroupName
    The name of the resource group to deploy to (will be created if it doesn't exist).

.PARAMETER BotName
    The globally unique name for the bot.

.PARAMETER Location
    The Azure region for deployment.

.PARAMETER CopilotTokenEndpoint
    The Copilot Studio Direct Line token endpoint.

.PARAMETER SpeechResourceId
    The full resource ID of your existing Azure Speech resource.

.PARAMETER SpeechRegion
    The region of your Speech resource.

.EXAMPLE
    .\deploy.ps1 -ResourceGroupName "rg-dls-proxy" -BotName "my-dls-proxy-bot" -Location "eastus"
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$ResourceGroupName,

    [Parameter(Mandatory = $true)]
    [string]$BotName,

    [Parameter(Mandatory = $false)]
    [string]$Location = "eastus",

    [Parameter(Mandatory = $false)]
    [string]$CopilotTokenEndpoint,

    [Parameter(Mandatory = $false)]
    [string]$SpeechResourceId,

    [Parameter(Mandatory = $false)]
    [string]$SpeechRegion = "eastus",

    [Parameter(Mandatory = $false)]
    [string]$Sku = "B1"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  DLS Proxy Bot - Azure Deployment Script" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check Azure CLI
Write-Host "🔍 Checking Azure CLI..." -ForegroundColor Yellow
$azVersion = az version 2>$null | ConvertFrom-Json
if (-not $azVersion) {
    Write-Host "❌ Azure CLI not found. Please install it from https://aka.ms/installazurecli" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Azure CLI version: $($azVersion.'azure-cli')" -ForegroundColor Green

# Check login status
Write-Host "🔍 Checking Azure login status..." -ForegroundColor Yellow
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "⚠️  Not logged in. Running 'az login'..." -ForegroundColor Yellow
    az login
    $account = az account show | ConvertFrom-Json
}
Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
Write-Host "   Subscription: $($account.name)" -ForegroundColor Gray

# Create resource group if needed
Write-Host ""
Write-Host "📦 Checking resource group: $ResourceGroupName" -ForegroundColor Yellow
$rgExists = az group exists --name $ResourceGroupName
if ($rgExists -eq "false") {
    Write-Host "   Creating resource group in $Location..." -ForegroundColor Gray
    az group create --name $ResourceGroupName --location $Location | Out-Null
    Write-Host "✅ Resource group created" -ForegroundColor Green
} else {
    Write-Host "✅ Resource group exists" -ForegroundColor Green
}

# Create Azure AD App Registration for the bot
Write-Host ""
Write-Host "🔐 Creating Azure AD App Registration for bot..." -ForegroundColor Yellow
$appName = "$BotName-app"

# Check if app already exists
$existingApp = az ad app list --display-name $appName 2>$null | ConvertFrom-Json
if ($existingApp -and $existingApp.Count -gt 0) {
    Write-Host "   App registration already exists, using existing..." -ForegroundColor Gray
    $appId = $existingApp[0].appId
    
    # Reset credentials
    $newCreds = az ad app credential reset --id $appId 2>$null | ConvertFrom-Json
    $appPassword = $newCreds.password
} else {
    # Create new app registration
    $appResult = az ad app create --display-name $appName | ConvertFrom-Json
    $appId = $appResult.appId
    
    # Create password
    $credResult = az ad app credential reset --id $appId | ConvertFrom-Json
    $appPassword = $credResult.password
}

Write-Host "✅ App ID: $appId" -ForegroundColor Green

# Get Copilot Token Endpoint if not provided
if (-not $CopilotTokenEndpoint) {
    Write-Host ""
    Write-Host "📝 Copilot Studio Token Endpoint not provided." -ForegroundColor Yellow
    $CopilotTokenEndpoint = Read-Host "   Enter your Copilot Studio Token Endpoint URL"
}

# Get Speech Resource ID if not provided
if (-not $SpeechResourceId) {
    Write-Host ""
    Write-Host "📝 Speech Resource ID not provided." -ForegroundColor Yellow
    Write-Host "   Format: /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.CognitiveServices/accounts/{name}" -ForegroundColor Gray
    $SpeechResourceId = Read-Host "   Enter your Speech Resource ID"
}

# Deploy ARM template
Write-Host ""
Write-Host "🚀 Deploying Azure resources..." -ForegroundColor Yellow
Write-Host "   This may take 3-5 minutes..." -ForegroundColor Gray

$templateFile = Join-Path $PSScriptRoot "azuredeploy.json"

$deploymentResult = az deployment group create `
    --resource-group $ResourceGroupName `
    --template-file $templateFile `
    --parameters `
        botName=$BotName `
        microsoftAppId=$appId `
        microsoftAppPassword=$appPassword `
        copilotTokenEndpoint=$CopilotTokenEndpoint `
        speechResourceId=$SpeechResourceId `
        speechRegion=$SpeechRegion `
        sku=$Sku `
    --query "properties.outputs" `
    | ConvertFrom-Json

if (-not $deploymentResult) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Azure resources deployed successfully!" -ForegroundColor Green

# Build and deploy the bot code
Write-Host ""
Write-Host "📦 Building bot code..." -ForegroundColor Yellow

$botPath = Split-Path $PSScriptRoot -Parent
Push-Location $botPath

npm install
npm run build

# Create deployment package
$zipPath = Join-Path $env:TEMP "dls-proxy-bot.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath }

Compress-Archive -Path @("dist", "node_modules", "package.json") -DestinationPath $zipPath

Write-Host "✅ Bot built and packaged" -ForegroundColor Green

# Deploy to App Service
Write-Host ""
Write-Host "🚀 Deploying bot code to App Service..." -ForegroundColor Yellow

$appServiceName = "$BotName-app"
az webapp deployment source config-zip `
    --resource-group $ResourceGroupName `
    --name $appServiceName `
    --src $zipPath

Pop-Location

Write-Host "✅ Bot code deployed!" -ForegroundColor Green

# Get Direct Line Speech credentials
Write-Host ""
Write-Host "🔑 Retrieving Direct Line Speech credentials..." -ForegroundColor Yellow

$dlsSettings = az bot directline show `
    --resource-group $ResourceGroupName `
    --name $BotName `
    2>$null | ConvertFrom-Json

# Output summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Bot Configuration:" -ForegroundColor Cyan
Write-Host "   Bot Name:        $BotName" -ForegroundColor White
Write-Host "   App ID:          $appId" -ForegroundColor White
Write-Host "   Endpoint:        $($deploymentResult.botEndpoint.value)" -ForegroundColor White
Write-Host "   App Service:     $($deploymentResult.appServiceUrl.value)" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Save these credentials for the frontend:" -ForegroundColor Yellow
Write-Host "   SPEECH_REGION:   $SpeechRegion" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Copy the Speech region to your frontend .env file" -ForegroundColor White
Write-Host "   2. Test the bot in Azure Portal > Bot Service > Test in Web Chat" -ForegroundColor White
Write-Host "   3. Update the frontend to use Direct Line Speech SDK" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation: docs/DIRECT_LINE_SPEECH_PROXY.md" -ForegroundColor Gray
Write-Host ""
