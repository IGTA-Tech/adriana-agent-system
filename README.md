# Adriana Multi-Brand Voice Agent System

Complete documentation and code for building Sherrod's multi-brand AI voice agent system.

## 🎯 Overview

**Adriana** is an AI receptionist that handles inbound calls for 6 immigration brands:
- Sherrod Sports Visas (SSV)
- Aventus Visa Agents
- O1dMatch
- IGTA (Innovative Global Talent Agency)
- DC Federal Litigation PLLC
- Sevyn (Multi-brand catch-all)

## 📁 Repository Structure

```
adriana-agent-system/
├── docs/
│   ├── FULL-SYSTEM-ROADMAP.md      # Complete implementation roadmap
│   ├── SHEETS-INTEGRATION.md        # Google Sheets data integration plan
│   ├── BRAND-CONFIGURATIONS.md      # Per-brand settings and prompts
│   └── KNOWLEDGE-BASE-GUIDE.md      # KB content structure
├── code/
│   ├── retell/                      # Retell AI integration code
│   │   ├── retell-client.js         # API client
│   │   ├── retell-webhook.js        # Webhook handlers
│   │   └── setup-retell.js          # Agent setup script
│   ├── database/
│   │   └── supabase.js              # Supabase client
│   └── webhooks/
│       └── call-webhook.js          # Call completion handlers
├── config/
│   ├── agents.json                  # Retell agent IDs
│   ├── brands.json                  # Brand phone numbers and settings
│   └── supabase-schema.sql          # Database schema
└── knowledge-base/
    ├── bd-patterns/                 # 773 BD response patterns
    └── procedures/                  # Immigration procedures
```

## 🔧 Tech Stack

- **Voice AI:** Retell AI (replaced Bland.ai)
- **Telephony:** Twilio (SIP Trunk)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Railway
- **Sheets:** Google Sheets API

## 📞 Phone Numbers & Agents

| Brand | Phone Number | Retell Agent ID |
|-------|--------------|-----------------|
| SSV | +1 (310) 879-1273 | agent_7da721b94b86ba716827acffe7 |
| Aventus | +1 (208) 899-1247 | agent_bfe16e1b8cf6c636c7e19adf28 |
| O1dMatch | +1 (980) 350-2728 | agent_906648d9ec452da965adcef5b4 |
| IGTA | +1 (646) 664-8181 | agent_e36c715ef37150e1922224f1b8 |
| DC Federal | +1 (980) 348-2626 | agent_aa3a89807af38b76ee127c68d3 |
| Sevyn (Multi) | +1 (980) 303-2854 | agent_1ecfdc7b6f9b4726373438ace9 |

## 📊 Key Integrations

### Google Sheets
- **Master Lead Sheet** (`10yzVfq3aH89c2UUMJrI5PCrXv_vK1NIBm3jM2IlbIu4`) - 35 tabs, 10,000+ leads
- **Cases Assigned** (`1Ma1_6kERm9CpDnyb_F1N_IvaEYlitdt-p5q1Oop5pWg`) - Active case tracking
- **Call Log Sheet** - Audit trail for all calls

### Supabase Database
- `calls` - Call records with transcripts
- `leads` - New leads from calls
- `sms_messages` - SMS conversation log
- `stats` - Daily statistics

### Webhooks
- Retell → `/retell/webhook` → Supabase + Sheets
- Twilio → `/voice` → SIP Trunk → Retell

## 🚀 Getting Started

1. Clone this repo
2. Copy `.env.example` to `.env` and fill in credentials
3. Run `npm install`
4. Deploy to Railway: `railway up`

## 📖 Documentation

- [Full System Roadmap](docs/FULL-SYSTEM-ROADMAP.md) - Implementation options A/B/C
- [Sheets Integration](docs/SHEETS-INTEGRATION.md) - Data flow and column mapping
- [Brand Configurations](docs/BRAND-CONFIGURATIONS.md) - Per-brand prompts and settings
- [Knowledge Base Guide](docs/KNOWLEDGE-BASE-GUIDE.md) - How to update agent knowledge

## 🔐 Credentials Required

```env
# Retell AI
RETELL_API_KEY=key_xxxxx

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJxxxxx

# Google (Service Account)
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

## 🎯 Two Operating Modes

### Business Development (BD) Mode
- For new callers
- Qualify interest, capture contact info
- Write to Master Lead Sheet (brand tab)
- Use 773 proven BD response patterns

### Customer Service (CS) Mode
- For existing clients
- Verify with Client ID
- Look up in Cases sheet
- Provide status updates or route to human

## 📬 Questions?

Contact: sherrod@sherrodsportsvisas.com
