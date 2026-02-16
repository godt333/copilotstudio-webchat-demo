# UK Citizen Advice Website Copilot Studio Agent - Web Chat Integration Demo

A modern citizen advice website built with React, TypeScript, and Fluent UI, featuring an AI-powered chat interface powered by Microsoft Copilot Studio.

## 🌐 Live Demo

**Production URL:** https://mango-meadow-02b192903.4.azurestaticapps.net

## 🚀 Features

- **Modern UK Government-inspired Design** - Clean, accessible interface following GOV.UK design patterns
- **Comprehensive Advice Topics:**
  - Benefits (Universal Credit, Housing Benefit, PIP, etc.)
  - Housing (Tenant rights, landlord responsibilities, eviction)
  - Employment (Workplace rights, discrimination, redundancy)
  - Consumer Rights (Refunds, faulty goods, Section 75)
  - Traffic Appeals (Parking tickets, speeding fines, ULEZ)
- **AI-Powered Chat Widget** - Integrated Copilot Studio chatbot for instant advice
- **Fully Responsive** - Works on desktop, tablet, and mobile devices
- **Accessible** - Built with accessibility in mind

## 🛠 Tech Stack

- **Frontend:** React 19 + TypeScript
- **UI Components:** Fluent UI React v9
- **Routing:** React Router v6
- **Build Tool:** Vite (Rolldown)
- **Hosting:** Azure Static Web Apps
- **Chat:** Microsoft Copilot Studio (integration ready)

## 📁 Project Structure

```
src/
├── components/
│   ├── chat/          # Chat widget component
│   ├── common/        # Reusable components (TopicCard, PageHeader, InfoCard)
│   └── layout/        # Layout components (Header, Footer, Layout)
├── pages/             # Page components
│   ├── HomePage.tsx
│   ├── BenefitsPage.tsx
│   ├── HousingPage.tsx
│   ├── EmploymentPage.tsx
│   ├── ConsumerRightsPage.tsx
│   └── TrafficAppealsPage.tsx
├── App.tsx            # Main app with routing
└── main.tsx           # Entry point

infra/                 # Azure infrastructure (Bicep)
├── main.bicep
└── main.bicepparam
```

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Local Development

The app runs at `http://localhost:5173` by default.

## ☁️ Azure Deployment

### Infrastructure

The project includes Bicep templates for Azure deployment:

```bash
# Deploy to Azure (requires Azure CLI)
az deployment group create \
  --resource-group rg-sm-dev \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam
```

### Static Web App Deployment

```bash
# Build the app
npm run build

# Deploy using SWA CLI
swa deploy ./dist --deployment-token <YOUR_TOKEN> --env production
```

## 🤖 Copilot Studio Integration

The chat widget is prepared for Copilot Studio integration. To connect your bot:

1. Create a Copilot in [Copilot Studio](https://copilotstudio.microsoft.com)
2. Configure knowledge sources with UK government data
3. Get the embed code from Copilot Studio
4. Update `src/components/chat/ChatWidget.tsx` with your bot's configuration

### Sample Topics for the Bot

The bot should be trained to answer questions about:
- Universal Credit eligibility and application
- Tenant rights and landlord responsibilities
- Employment law and workplace rights
- Consumer protection and refunds
- Parking ticket appeals and traffic penalties

## 📄 License

This project is for demonstration purposes.
