import PptxGenJS from 'pptxgenjs';

// Create presentation
const pptx = new PptxGenJS();
pptx.author = 'Citizen Advice Portal';
pptx.title = 'Copilot Studio Web Chat Integration';
pptx.subject = 'THR505 - Integrating and Branding Copilot Studio with Web Chat';
pptx.company = 'Microsoft';

// Define colors
const colors = {
  primary: '0078D4',
  secondary: '5C2D91',
  accent: '00BCF2',
  success: '22C55E',
  warning: 'F97316',
  danger: 'EF4444',
  text: '323130',
  textLight: '605E5C',
  white: 'FFFFFF',
  lightBg: 'F5F5F5'
};

// ============================================
// SLIDE 1: Title Slide
// ============================================
let slide1 = pptx.addSlide();
slide1.background = { color: colors.primary };

slide1.addText('🚀', {
  x: 0, y: 1.5, w: '100%', h: 1,
  fontSize: 72, align: 'center', color: colors.white
});

slide1.addText('Integrating and Branding\nCopilot Studio with Web Chat', {
  x: 0.5, y: 2.5, w: 9, h: 1.5,
  fontSize: 40, bold: true, align: 'center', color: colors.white,
  fontFace: 'Segoe UI'
});

slide1.addText('Text and Audio Integration Patterns', {
  x: 0.5, y: 4.2, w: 9, h: 0.5,
  fontSize: 24, align: 'center', color: colors.white,
  fontFace: 'Segoe UI'
});

slide1.addText('THR505 | Microsoft Copilot Studio', {
  x: 0.5, y: 5.2, w: 9, h: 0.4,
  fontSize: 16, align: 'center', color: colors.white,
  fontFace: 'Segoe UI', italic: true
});

// ============================================
// SLIDE 2: Agenda
// ============================================
let slide2 = pptx.addSlide();

slide2.addText('📋 Agenda', {
  x: 0.5, y: 0.3, w: 9, h: 0.8,
  fontSize: 36, bold: true, color: colors.primary, fontFace: 'Segoe UI'
});

slide2.addText('What we\'ll cover today', {
  x: 0.5, y: 1.0, w: 9, h: 0.4,
  fontSize: 18, color: colors.textLight, fontFace: 'Segoe UI'
});

const agendaItems = [
  'Overview of Integration Approaches',
  'Token Endpoint Architecture (Anonymous Access)',
  'M365 Agents SDK Architecture (Authenticated Access)',
  'Voice Integration Options',
  'Theming and Customization',
  'Feature Comparison & Decision Guide'
];

agendaItems.forEach((item, idx) => {
  slide2.addText(`●  ${item}`, {
    x: 0.7, y: 1.6 + (idx * 0.6), w: 8.5, h: 0.5,
    fontSize: 22, color: colors.text, fontFace: 'Segoe UI'
  });
});

// ============================================
// SLIDE 3: Architecture Overview
// ============================================
let slide3 = pptx.addSlide();

slide3.addText('🏗️ Architecture Overview', {
  x: 0.5, y: 0.3, w: 9, h: 0.8,
  fontSize: 36, bold: true, color: colors.primary, fontFace: 'Segoe UI'
});

slide3.addText('High-level integration layers', {
  x: 0.5, y: 1.0, w: 9, h: 0.4,
  fontSize: 18, color: colors.textLight, fontFace: 'Segoe UI'
});

const layers = [
  { title: '🖥️ User Interface Layer', desc: 'React Application • BotFramework WebChat • Fluent UI', color: 'DBEAFE' },
  { title: '🔗 Connection Layer', desc: 'DirectLine Protocol • CopilotStudioWebChat Connection', color: 'DCFCE7' },
  { title: '🔐 Authentication Layer', desc: 'Token Endpoint (Anonymous) • MSAL/Azure AD (Authenticated)', color: 'FEF3C7' },
  { title: '☁️ Microsoft Cloud Services', desc: 'Copilot Studio • Power Platform API • Azure Bot Service', color: 'F3E8FF' },
  { title: '🤖 AI & Knowledge Layer', desc: 'Topics & Dialogs • Generative AI • Knowledge Sources', color: 'E0F2FE' }
];

layers.forEach((layer, idx) => {
  slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.5, y: 1.5 + (idx * 0.85), w: 7, h: 0.75,
    fill: { color: layer.color },
    line: { color: 'CCCCCC', width: 1 }
  });
  slide3.addText(layer.title, {
    x: 1.6, y: 1.5 + (idx * 0.85), w: 6.8, h: 0.4,
    fontSize: 16, bold: true, color: colors.text, fontFace: 'Segoe UI', valign: 'middle'
  });
  slide3.addText(layer.desc, {
    x: 1.6, y: 1.85 + (idx * 0.85), w: 6.8, h: 0.35,
    fontSize: 11, color: colors.textLight, fontFace: 'Segoe UI', valign: 'middle'
  });
});

// ============================================
// SLIDE 4: Two Integration Approaches
// ============================================
let slide4 = pptx.addSlide();

slide4.addText('🔀 Two Integration Approaches', {
  x: 0.5, y: 0.3, w: 9, h: 0.8,
  fontSize: 36, bold: true, color: colors.primary, fontFace: 'Segoe UI'
});

slide4.addText('Choose based on your authentication requirements', {
  x: 0.5, y: 1.0, w: 9, h: 0.4,
  fontSize: 18, color: colors.textLight, fontFace: 'Segoe UI'
});

// Token Endpoint Box
slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.5, y: 1.5, w: 4.3, h: 3.5,
  fill: { color: 'FFFFFF' },
  line: { color: colors.success, width: 3 }
});

slide4.addText('🎫 Token Endpoint', {
  x: 0.7, y: 1.6, w: 4, h: 0.5,
  fontSize: 22, bold: true, color: colors.success, fontFace: 'Segoe UI'
});

slide4.addText('Anonymous Access', {
  x: 0.7, y: 2.1, w: 4, h: 0.4,
  fontSize: 16, bold: true, color: colors.text, fontFace: 'Segoe UI'
});

const tokenFeatures = ['✓ No user sign-in required', '✓ Public websites', '✓ Citizen services', '✓ Simple implementation'];
tokenFeatures.forEach((item, idx) => {
  slide4.addText(item, {
    x: 0.8, y: 2.6 + (idx * 0.45), w: 3.8, h: 0.4,
    fontSize: 14, color: colors.text, fontFace: 'Segoe UI'
  });
});

// M365 Agents SDK Box
slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 5.2, y: 1.5, w: 4.3, h: 3.5,
  fill: { color: 'FFFFFF' },
  line: { color: colors.secondary, width: 3 }
});

slide4.addText('🔑 M365 Agents SDK', {
  x: 5.4, y: 1.6, w: 4, h: 0.5,
  fontSize: 22, bold: true, color: colors.secondary, fontFace: 'Segoe UI'
});

slide4.addText('Authenticated Access', {
  x: 5.4, y: 2.1, w: 4, h: 0.4,
  fontSize: 16, bold: true, color: colors.text, fontFace: 'Segoe UI'
});

const sdkFeatures = ['✓ Azure AD sign-in', '✓ User identity aware', '✓ Enterprise apps', '✓ SharePoint/Dataverse access'];
sdkFeatures.forEach((item, idx) => {
  slide4.addText(item, {
    x: 5.5, y: 2.6 + (idx * 0.45), w: 3.8, h: 0.4,
    fontSize: 14, color: colors.text, fontFace: 'Segoe UI'
  });
});

// ============================================
// SLIDE 5: Token Endpoint Architecture
// ============================================
let slide5 = pptx.addSlide();

slide5.addShape(pptx.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 1.3,
  fill: { color: colors.success }
});

slide5.addText('🎫 Token Endpoint Architecture', {
  x: 0.5, y: 0.2, w: 9, h: 0.6,
  fontSize: 32, bold: true, color: colors.white, fontFace: 'Segoe UI'
});

slide5.addText('Anonymous access for public websites', {
  x: 0.5, y: 0.8, w: 9, h: 0.4,
  fontSize: 16, color: colors.white, fontFace: 'Segoe UI'
});

// Flow diagram boxes
const flowBoxes = [
  { x: 3.5, y: 1.6, text: '🌐 Web Browser', sub: 'React Application', color: colors.primary },
  { x: 1.5, y: 2.8, text: '1️⃣ GET /token', sub: 'No Auth Required', color: 'E0E0E0', textColor: colors.text },
  { x: 5.5, y: 2.8, text: '🎫 Token Endpoint', sub: 'Power Platform', color: colors.success },
  { x: 3.5, y: 4.0, text: '2️⃣ DirectLine Token', sub: 'Returned to Browser', color: 'E0E0E0', textColor: colors.text },
  { x: 1.5, y: 5.2, text: '💬 WebChat', sub: 'createDirectLine()', color: colors.primary },
  { x: 5.5, y: 5.2, text: '🤖 Copilot Studio', sub: 'Bot Service', color: colors.secondary }
];

flowBoxes.forEach(box => {
  slide5.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: box.x, y: box.y, w: 3, h: 0.9,
    fill: { color: box.color },
    shadow: { type: 'outer', blur: 4, offset: 2, angle: 45, opacity: 0.3 }
  });
  slide5.addText(box.text, {
    x: box.x, y: box.y + 0.1, w: 3, h: 0.4,
    fontSize: 14, bold: true, color: box.textColor || colors.white, fontFace: 'Segoe UI', align: 'center'
  });
  slide5.addText(box.sub, {
    x: box.x, y: box.y + 0.5, w: 3, h: 0.3,
    fontSize: 10, color: box.textColor || colors.white, fontFace: 'Segoe UI', align: 'center'
  });
});

// Arrows
slide5.addText('⬇️', { x: 4.5, y: 2.35, w: 1, h: 0.4, fontSize: 20, align: 'center' });
slide5.addText('➡️', { x: 4.2, y: 3.0, w: 1, h: 0.4, fontSize: 20, align: 'center' });
slide5.addText('⬇️', { x: 4.5, y: 3.6, w: 1, h: 0.4, fontSize: 20, align: 'center' });
slide5.addText('⬇️', { x: 4.5, y: 4.75, w: 1, h: 0.4, fontSize: 20, align: 'center' });
slide5.addText('➡️', { x: 4.2, y: 5.4, w: 1, h: 0.4, fontSize: 20, align: 'center' });

// ============================================
// SLIDE 6: M365 Agents SDK Architecture
// ============================================
let slide6 = pptx.addSlide();

slide6.addShape(pptx.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 1.3,
  fill: { color: colors.secondary }
});

slide6.addText('🔑 M365 Agents SDK Architecture', {
  x: 0.5, y: 0.2, w: 9, h: 0.6,
  fontSize: 32, bold: true, color: colors.white, fontFace: 'Segoe UI'
});

slide6.addText('Authenticated access with Azure AD', {
  x: 0.5, y: 0.8, w: 9, h: 0.4,
  fontSize: 16, color: colors.white, fontFace: 'Segoe UI'
});

const sdkFlowBoxes = [
  { x: 1.5, y: 1.6, text: '👤 User Browser', sub: 'React + MSAL', color: colors.primary },
  { x: 5.5, y: 1.6, text: '🔐 Azure AD', sub: 'Sign In', color: colors.success },
  { x: 3.5, y: 2.8, text: '🎫 Access Token', sub: 'api.powerplatform.com', color: 'E0E0E0', textColor: colors.text },
  { x: 1.5, y: 4.0, text: '📦 CopilotStudioClient', sub: 'SDK Instance', color: colors.secondary },
  { x: 5.5, y: 4.0, text: '☁️ Power Platform API', sub: 'Authenticated', color: colors.primary },
  { x: 3.5, y: 5.2, text: '💬 WebChat + Fluent', sub: 'User-Aware Chat', color: colors.secondary }
];

sdkFlowBoxes.forEach(box => {
  slide6.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: box.x, y: box.y, w: 3, h: 0.9,
    fill: { color: box.color },
    shadow: { type: 'outer', blur: 4, offset: 2, angle: 45, opacity: 0.3 }
  });
  slide6.addText(box.text, {
    x: box.x, y: box.y + 0.1, w: 3, h: 0.4,
    fontSize: 14, bold: true, color: box.textColor || colors.white, fontFace: 'Segoe UI', align: 'center'
  });
  slide6.addText(box.sub, {
    x: box.x, y: box.y + 0.5, w: 3, h: 0.3,
    fontSize: 10, color: box.textColor || colors.white, fontFace: 'Segoe UI', align: 'center'
  });
});

slide6.addText('➡️', { x: 4.2, y: 1.8, w: 1, h: 0.4, fontSize: 20, align: 'center' });
slide6.addText('⬇️', { x: 4.5, y: 2.35, w: 1, h: 0.4, fontSize: 20, align: 'center' });
slide6.addText('⬇️', { x: 4.5, y: 3.55, w: 1, h: 0.4, fontSize: 20, align: 'center' });
slide6.addText('➡️', { x: 4.2, y: 4.2, w: 1, h: 0.4, fontSize: 20, align: 'center' });
slide6.addText('⬇️', { x: 4.5, y: 4.75, w: 1, h: 0.4, fontSize: 20, align: 'center' });

// ============================================
// SLIDE 7: Voice Integration
// ============================================
let slide7 = pptx.addSlide();

slide7.addShape(pptx.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 1.3,
  fill: { color: colors.danger }
});

slide7.addText('🎤 Voice Integration Options', {
  x: 0.5, y: 0.2, w: 9, h: 0.6,
  fontSize: 32, bold: true, color: colors.white, fontFace: 'Segoe UI'
});

slide7.addText('Add speech capabilities to your chat', {
  x: 0.5, y: 0.8, w: 9, h: 0.4,
  fontSize: 16, color: colors.white, fontFace: 'Segoe UI'
});

const voiceOptions = [
  { x: 0.4, title: '🌐 Web Speech API', sub: 'Browser Built-in', color: colors.success, pros: '✓ No cost\n✓ Simple setup', cons: '✗ Limited languages\n✗ Browser dependent' },
  { x: 3.5, title: '☁️ Azure Cognitive', sub: 'Enterprise Grade', color: colors.secondary, pros: '✓ 100+ languages\n✓ Custom voices', cons: '✗ Requires subscription\n✗ Additional cost' },
  { x: 6.6, title: '🔊 DirectLine Speech', sub: 'Full Duplex', color: colors.warning, pros: '✓ Real-time streaming\n✓ Low latency', cons: '✗ Complex setup\n✗ Azure required' }
];

voiceOptions.forEach(opt => {
  slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: opt.x, y: 1.5, w: 3, h: 4,
    fill: { color: 'FFFFFF' },
    line: { color: opt.color, width: 3 }
  });
  slide7.addText(opt.title, {
    x: opt.x + 0.1, y: 1.6, w: 2.8, h: 0.5,
    fontSize: 16, bold: true, color: opt.color, fontFace: 'Segoe UI', align: 'center'
  });
  slide7.addText(opt.sub, {
    x: opt.x + 0.1, y: 2.1, w: 2.8, h: 0.3,
    fontSize: 12, bold: true, color: colors.text, fontFace: 'Segoe UI', align: 'center'
  });
  slide7.addText(opt.pros, {
    x: opt.x + 0.2, y: 2.6, w: 2.6, h: 1,
    fontSize: 11, color: colors.success, fontFace: 'Segoe UI'
  });
  slide7.addText(opt.cons, {
    x: opt.x + 0.2, y: 3.8, w: 2.6, h: 1,
    fontSize: 11, color: colors.danger, fontFace: 'Segoe UI'
  });
});

// ============================================
// SLIDE 8: Theming Options
// ============================================
let slide8 = pptx.addSlide();

slide8.addShape(pptx.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 1.3,
  fill: { color: colors.warning }
});

slide8.addText('🎨 Theming & Customization', {
  x: 0.5, y: 0.2, w: 9, h: 0.6,
  fontSize: 32, bold: true, color: colors.white, fontFace: 'Segoe UI'
});

slide8.addText('Multiple approaches to style your chat', {
  x: 0.5, y: 0.8, w: 9, h: 0.4,
  fontSize: 16, color: colors.white, fontFace: 'Segoe UI'
});

const themeOptions = [
  { x: 0.4, title: '⚡ Style Options', level: 'Easy', color: colors.success, code: 'styleOptions={{\n  bubbleBackground: \'#0078d4\'\n}}' },
  { x: 3.5, title: '🎨 Style Sets', level: 'Medium', color: colors.primary, code: 'createStyleSet({\n  bubble: { borderRadius: 12 }\n})' },
  { x: 6.6, title: '✨ Fluent Theme', level: 'Premium', color: colors.secondary, code: '<FluentThemeProvider>\n  <ReactWebChat />\n</FluentThemeProvider>' }
];

themeOptions.forEach(opt => {
  slide8.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: opt.x, y: 1.5, w: 3, h: 3.8,
    fill: { color: 'FFFFFF' },
    line: { color: opt.color, width: 3 }
  });
  slide8.addText(opt.title, {
    x: opt.x + 0.1, y: 1.6, w: 2.8, h: 0.5,
    fontSize: 16, bold: true, color: opt.color, fontFace: 'Segoe UI', align: 'center'
  });
  slide8.addText(opt.level, {
    x: opt.x + 0.1, y: 2.1, w: 2.8, h: 0.3,
    fontSize: 12, bold: true, color: colors.text, fontFace: 'Segoe UI', align: 'center'
  });
  slide8.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: opt.x + 0.15, y: 2.5, w: 2.7, h: 2.5,
    fill: { color: '1E1E1E' }
  });
  slide8.addText(opt.code, {
    x: opt.x + 0.25, y: 2.6, w: 2.5, h: 2.3,
    fontSize: 9, color: 'D4D4D4', fontFace: 'Consolas'
  });
});

// ============================================
// SLIDE 9: Middleware & Custom Components
// ============================================
let slide9 = pptx.addSlide();

slide9.addText('🔧 Middleware & Custom Components', {
  x: 0.5, y: 0.2, w: 9, h: 0.6,
  fontSize: 32, bold: true, color: colors.primary, fontFace: 'Segoe UI'
});

slide9.addText('Extend WebChat with custom rendering and behavior', {
  x: 0.5, y: 0.75, w: 9, h: 0.4,
  fontSize: 16, color: colors.textLight, fontFace: 'Segoe UI'
});

// Middleware layers (stacked)
const middlewareLayers = [
  { y: 1.3, title: '🖥️ Activity Middleware', desc: 'Custom rendering for specific activity types (cards, attachments, messages)', color: 'DBEAFE', borderColor: '93C5FD' },
  { y: 2.3, title: '📎 Attachment Middleware', desc: 'Custom attachment renderers for Adaptive Cards, Hero Cards, images', color: 'DCFCE7', borderColor: '86EFAC' },
  { y: 3.3, title: '📝 Send Box Middleware', desc: 'Custom input components, suggestions, attachments picker', color: 'FEF3C7', borderColor: 'FCD34D' },
  { y: 4.3, title: '👤 Avatar Middleware', desc: 'Custom bot/user avatars, status indicators, presence', color: 'FCE7F3', borderColor: 'F9A8D4' }
];

middlewareLayers.forEach(layer => {
  slide9.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.5, y: layer.y, w: 7, h: 0.9,
    fill: { color: layer.color },
    line: { color: layer.borderColor, width: 2 }
  });
  slide9.addText(layer.title, {
    x: 1.6, y: layer.y + 0.1, w: 6.8, h: 0.4,
    fontSize: 16, bold: true, color: colors.text, fontFace: 'Segoe UI', align: 'center'
  });
  slide9.addText(layer.desc, {
    x: 1.6, y: layer.y + 0.5, w: 6.8, h: 0.35,
    fontSize: 11, color: colors.textLight, fontFace: 'Segoe UI', align: 'center'
  });
});

// Code example box
slide9.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.5, y: 5.35, w: 9, h: 1.1,
  fill: { color: '2D2D30' }
});

slide9.addText('// Custom Activity Middleware Example', {
  x: 0.65, y: 5.4, w: 8.7, h: 0.3,
  fontSize: 9, color: '6A9955', fontFace: 'Consolas'
});

slide9.addText("const activityMiddleware = () => next => card => {\n  if (card.activity.type === 'message' && card.activity.text?.includes('CUSTOM')) {\n    return () => <CustomMessageCard activity={card.activity} />;\n  }\n  return next(card);\n};", {
  x: 0.65, y: 5.65, w: 8.7, h: 0.75,
  fontSize: 8, color: 'D4D4D4', fontFace: 'Consolas'
});

// ============================================
// SLIDE 10: Feature Comparison Table
// ============================================
let slide10 = pptx.addSlide();

slide10.addText('📊 Feature Comparison', {
  x: 0.5, y: 0.2, w: 9, h: 0.6,
  fontSize: 32, bold: true, color: colors.primary, fontFace: 'Segoe UI'
});

slide10.addText('Token Endpoint vs M365 Agents SDK', {
  x: 0.5, y: 0.75, w: 9, h: 0.4,
  fontSize: 16, color: colors.textLight, fontFace: 'Segoe UI'
});

// Table data
const tableData = [
  ['Feature', '🎫 Token Endpoint', '🔑 M365 Agents SDK'],
  ['User Sign-in Required', '✕ No', '✓ Yes'],
  ['Anonymous Access', '✓ Yes', '✕ No'],
  ['User Identity in Bot', '✕ No', '✓ Yes'],
  ['SSO with Microsoft 365', '✕ No', '✓ Yes'],
  ['SharePoint/Dataverse Access', '✕ No', '✓ Yes'],
  ['Implementation Complexity', '🟢 Low', '🟠 Medium-High'],
  ['Azure AD App Required', '✕ No', '✓ Yes'],
  ['Fluent UI Theme Support', '✓ Yes', '✓ Yes'],
  ['Voice Support', '✓ Yes', '✓ Yes']
];

const rows = tableData.map((row, rowIdx) => {
  return row.map((cell, colIdx) => {
    let opts = {
      text: cell,
      options: {
        fontSize: rowIdx === 0 ? 12 : 11,
        bold: rowIdx === 0 || colIdx === 0,
        color: rowIdx === 0 ? colors.white : (cell.includes('✓') ? colors.success : (cell.includes('✕') ? colors.danger : colors.text)),
        fill: rowIdx === 0 ? { color: colors.accent } : { color: rowIdx % 2 === 0 ? 'F8F8F8' : 'FFFFFF' },
        align: colIdx === 0 ? 'left' : 'center',
        fontFace: 'Segoe UI',
        valign: 'middle'
      }
    };
    return opts;
  });
});

slide10.addTable(rows, {
  x: 0.4, y: 1.2, w: 9.2,
  colW: [3.5, 2.85, 2.85],
  border: { type: 'solid', color: 'E0E0E0', pt: 0.5 },
  fontFace: 'Segoe UI'
});

// ============================================
// SLIDE 11: Decision Guide
// ============================================
let slide11 = pptx.addSlide();

slide11.addShape(pptx.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 1.3,
  fill: { color: '334155' }
});

slide11.addText('🎯 Decision Guide', {
  x: 0.5, y: 0.2, w: 9, h: 0.6,
  fontSize: 32, bold: true, color: colors.white, fontFace: 'Segoe UI'
});

slide11.addText('Which approach should you choose?', {
  x: 0.5, y: 0.8, w: 9, h: 0.4,
  fontSize: 16, color: colors.white, fontFace: 'Segoe UI'
});

// Token Endpoint column
slide11.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.4, y: 1.5, w: 4.4, h: 4,
  fill: { color: 'FFFFFF' },
  line: { color: colors.success, width: 3 }
});

slide11.addText('🎫 Use Token Endpoint', {
  x: 0.5, y: 1.6, w: 4.2, h: 0.5,
  fontSize: 18, bold: true, color: colors.success, fontFace: 'Segoe UI'
});

const tokenUseCases = [
  '✓ Public-facing website',
  '✓ Users should NOT sign in',
  '✓ Public knowledge sources only',
  '✓ Simpler deployment preferred',
  '✓ Citizen services / customer support'
];

tokenUseCases.forEach((item, idx) => {
  slide11.addText(item, {
    x: 0.6, y: 2.2 + (idx * 0.55), w: 4, h: 0.45,
    fontSize: 14, color: colors.text, fontFace: 'Segoe UI'
  });
});

// M365 SDK column
slide11.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 5.2, y: 1.5, w: 4.4, h: 4,
  fill: { color: 'FFFFFF' },
  line: { color: colors.secondary, width: 3 }
});

slide11.addText('🔑 Use M365 Agents SDK', {
  x: 5.3, y: 1.6, w: 4.2, h: 0.5,
  fontSize: 18, bold: true, color: colors.secondary, fontFace: 'Segoe UI'
});

const sdkUseCases = [
  '✓ Enterprise internal app',
  '✓ Bot needs user identity',
  '✓ SharePoint/Dataverse access',
  '✓ Teams or SharePoint integration',
  '✓ SSO with Microsoft 365'
];

sdkUseCases.forEach((item, idx) => {
  slide11.addText(item, {
    x: 5.4, y: 2.2 + (idx * 0.55), w: 4, h: 0.45,
    fontSize: 14, color: colors.text, fontFace: 'Segoe UI'
  });
});

// ============================================
// SLIDE 12: Resources
// ============================================
let slide12 = pptx.addSlide();

slide12.addText('📚 Resources & Documentation', {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 32, bold: true, color: colors.primary, fontFace: 'Segoe UI'
});

slide12.addText('Learn more about Copilot Studio integration', {
  x: 0.5, y: 0.85, w: 9, h: 0.4,
  fontSize: 16, color: colors.textLight, fontFace: 'Segoe UI'
});

// Documentation column
slide12.addText('Documentation', {
  x: 0.5, y: 1.4, w: 4.5, h: 0.5,
  fontSize: 20, bold: true, color: colors.primary, fontFace: 'Segoe UI'
});

const docs = [
  '● Copilot Studio Documentation',
  '● Publish to Custom Apps',
  '● Web Channel Security',
  '● Authentication Configuration',
  '● SSO with Entra ID'
];

docs.forEach((item, idx) => {
  slide12.addText(item, {
    x: 0.6, y: 1.95 + (idx * 0.5), w: 4.3, h: 0.45,
    fontSize: 14, color: colors.text, fontFace: 'Segoe UI'
  });
});

// Packages column
slide12.addText('NPM Packages', {
  x: 5.2, y: 1.4, w: 4.5, h: 0.5,
  fontSize: 20, bold: true, color: colors.secondary, fontFace: 'Segoe UI'
});

const packages = [
  '● @microsoft/agents-copilotstudio-client',
  '● botframework-webchat',
  '● botframework-webchat-fluent-theme',
  '● @azure/msal-browser',
  '● microsoft-cognitiveservices-speech-sdk'
];

packages.forEach((item, idx) => {
  slide12.addText(item, {
    x: 5.3, y: 1.95 + (idx * 0.5), w: 4.5, h: 0.45,
    fontSize: 13, color: colors.text, fontFace: 'Consolas'
  });
});

// ============================================
// SLIDE 13: Thank You
// ============================================
let slide13 = pptx.addSlide();
slide13.background = { color: colors.secondary };

slide13.addText('🎉', {
  x: 0, y: 1.5, w: '100%', h: 1,
  fontSize: 72, align: 'center', color: colors.white
});

slide13.addText('Thank You!', {
  x: 0.5, y: 2.5, w: 9, h: 1,
  fontSize: 48, bold: true, align: 'center', color: colors.white,
  fontFace: 'Segoe UI'
});

slide13.addText('Questions?', {
  x: 0.5, y: 3.5, w: 9, h: 0.6,
  fontSize: 28, align: 'center', color: colors.white,
  fontFace: 'Segoe UI'
});

slide13.addText('THR505 - Integrating and Branding Copilot Studio\nwith Web Chat (Text and Audio)', {
  x: 0.5, y: 4.5, w: 9, h: 0.8,
  fontSize: 16, align: 'center', color: colors.white,
  fontFace: 'Segoe UI', italic: true
});

// Save the presentation
pptx.writeFile({ fileName: 'Copilot-Studio-WebChat-Integration-v2.pptx' })
  .then(fileName => {
    console.log(`✅ PowerPoint file created: ${fileName}`);
  })
  .catch(err => {
    console.error('Error creating PowerPoint:', err);
  });
