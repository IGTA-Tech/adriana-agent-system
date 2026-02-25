# Multi-Brand Voice/SMS System - Full Optimization Roadmap
**Generated:** 2026-02-22 15:55 PST
**Goal:** Complete BD + Customer Service system for all 5 brands

---

## 📊 CURRENT STATE vs OPTIMAL STATE

| Component | Current | Optimal | Gap |
|-----------|---------|---------|-----|
| Voice Routing | ✅ All 5 → Bland.ai | Per-brand prompts | Need 5 Bland agents |
| SMS | ❌ Not configured | Per-brand AI responses | Need 10DLC + routing |
| Client Lookup | ✅ Sheet has Brand/ID | Real-time API | Need webhook endpoint |
| BD Mode | ✅ 773 patterns exist | Per-brand BD flow | Need integration |
| CS Mode | ✅ Client IDs assigned | Verification flow | Need Bland prompts |
| CRM Sync | ❌ Manual | Auto-log all calls | Need webhook handler |

---

## 🎯 OPTION A: Single Bland Agent + Dynamic Prompts (Fastest)

**How it works:**
- Keep 1 Bland.ai agent
- Pass brand context via webhook
- Dynamic prompts based on To: number

**Pros:** Fast setup, lower cost
**Cons:** Less brand customization

**Implementation:**
```
1. Create webhook endpoint: /voice/inbound
2. Twilio → Webhook → Detect brand → Call Bland.ai with custom prompt
3. Bland.ai uses dynamic prompt for greeting + flow
```

**Time:** 2-4 hours
**Cost:** No additional Bland.ai cost

---

## 🎯 OPTION B: 5 Separate Bland Agents (Most Customized)

**How it works:**
- Create 5 Bland.ai agents (one per brand)
- Each has brand-specific training, voice, knowledge base
- Direct routing: Twilio → Specific agent

**Pros:** Full customization, brand-specific voices
**Cons:** More setup, higher Bland.ai cost

**Implementation:**
```
1. Create 5 agents in Bland.ai dashboard
2. Upload brand-specific knowledge to each
3. Configure Twilio: each number → its agent
```

**Time:** 1-2 days
**Cost:** May need higher Bland.ai tier

---

## 🎯 OPTION C: Custom Webhook Server (Maximum Control)

**How it works:**
- Build Node.js server to handle all routing
- Server queries Sheet for client data
- Server decides BD vs CS mode
- Server calls Bland.ai with full context

**Pros:** Full control, real-time data, custom logic
**Cons:** Needs hosting, more code

**Architecture:**
```
Twilio → Your Server → Query Sheet
                    → Determine Mode (BD/CS)
                    → Build Custom Prompt
                    → Call Bland.ai API
                    → Log to Airtable
                    → Return TwiML
```

**Time:** 1-2 days
**Cost:** Server hosting (~$10-20/mo)

---

## 🔧 RECOMMENDED: OPTION C (Custom Webhook Server)

### Why Option C?

1. **Per-brand logic** - Full control over each brand's flow
2. **Real-time data** - Query Sheet before every call
3. **BD + CS switching** - Automatic mode detection
4. **Call logging** - Every call logged to Airtable
5. **SMS ready** - Same server handles voice + SMS
6. **Future-proof** - Add Go High Level, Zapier, etc.

---

## 📋 COMPLETE IMPLEMENTATION PLAN

### Phase 1: Webhook Server (Day 1)

**File:** `/home/innovativeautomations/brand-voice-server/index.js`

**Endpoints:**
```
POST /voice/inbound     - Handle inbound calls
POST /voice/status      - Call status updates
POST /sms/inbound       - Handle inbound SMS (after 10DLC)
POST /sms/outbound      - Send SMS
GET  /client/:phone     - Lookup client by phone
GET  /health            - Health check
```

**Features:**
- Brand detection by To: number
- Client lookup in Google Sheet
- Mode detection (BD vs CS)
- Dynamic Bland.ai prompt generation
- Airtable call logging

---

### Phase 2: Per-Brand Configuration

**SSV (310) 879-1273**
```javascript
{
  brand: 'SSV',
  greeting: 'Thank you for calling Sherrod Sports Visas...',
  bdPrompt: 'You are a sports visa specialist. Focus on P-1A and O-1A...',
  csPrompt: 'Help existing clients with case status, documents, payments...',
  paymentLinks: ['sherrodsportsvisas.com/500', '/1000', '/3000'...],
  intakeForm: 'sherrodsportsvisas.report',
  escalation: 'sherrod@sherrodsportsvisas.com'
}
```

**Aventus (469) 629-7468**
```javascript
{
  brand: 'Aventus',
  greeting: 'Thank you for calling Aventus Visa Agents...',
  bdPrompt: 'You help agents and attorneys find petitioner services...',
  csPrompt: 'Help existing petitioner clients with their cases...',
  paymentLinks: ['aventusvisaagents.com/500', '/2000', '/3000'...],
  escalation: 'bran@aventusvisaagents.com'
}
```

**O1dMatch (561) 794-4621**
```javascript
{
  brand: 'O1dMatch',
  greeting: 'You have reached O1dMatch...',
  bdPrompt: 'Help tech professionals and entrepreneurs evaluate O-1A/EB-1A...',
  csPrompt: 'Help existing O1dMatch clients with profile building...',
  intakeForm: 'o1dmatch.com/evaluate',
  escalation: 'info@o1dmatch.com'
}
```

**IGTA (561) 786-9628**
```javascript
{
  brand: 'IGTA',
  greeting: 'Thank you for calling Innovative Global Talent Agency...',
  bdPrompt: 'Help entertainers, artists, athletes with O-1B, P-1B...',
  csPrompt: 'Help existing talent clients with visas and representation...',
  intakeForm: 'oandpvisas.community',
  escalation: 'info@innovativeglobaltalent.com'
}
```

**DC Federal (202) 999-3631**
```javascript
{
  brand: 'DCFederal',
  greeting: 'DC Federal Litigation PLLC...',
  bdPrompt: 'Handle inquiries about federal litigation, appeals...',
  csPrompt: 'Help existing litigation clients with case status...',
  escalation: 'info@dcfederallitigation.com'
}
```

---

### Phase 3: BD Mode Flow (Per Brand)

```
Inbound Call (new number)
    ↓
Greeting: "[Brand greeting]"
    ↓
"Are you interested in [brand-specific services]?"
    ↓
Capture: Name, Email, Phone, Visa Interest
    ↓
Use BD patterns (773 available) for responses
    ↓
"I'll send you our intake form at [intakeForm]"
    ↓
Log to Airtable Lead Record
    ↓
Send follow-up SMS (after 10DLC)
```

---

### Phase 4: Customer Service Mode Flow (Per Brand)

```
Inbound Call (recognized number)
    ↓
Greeting: "I see you're calling about your case with [Brand]."
    ↓
"Can you confirm your Client ID? It starts with [prefix]."
    ↓
Client: "[prefix]-XXX" or "XXX"
    ↓
Verify against Sheet
    ↓
IF MATCH:
  "Thank you, [Name]. Your [visa_type] case is in [stage]."
  "How can I help you today?"
    ↓
Handle: Status check, document questions, payment, scheduling
    ↓
Log interaction to Communication Log tab
    ↓
IF ESCALATION NEEDED:
  "Let me have [escalation contact] call you back."
```

---

### Phase 5: SMS Integration (After 10DLC)

**10DLC Registration Required:**
1. Register A2P campaign with Twilio
2. Wait 1-5 business days for approval
3. Associate all 5 numbers with campaign

**SMS Flow (Per Brand):**
```
Inbound SMS → Detect Brand → GPT-4o-mini Response
                          → Brand-specific context
                          → Log to Airtable
                          → Reply via Twilio
```

---

### Phase 6: CRM Integration

**Option 1: Enhanced Airtable (Current)**
- All calls logged to Call Log table
- All leads to Lead Record table
- Communication Log in Sheet

**Option 2: Go High Level (If credentials provided)**
- Sync contacts both ways
- Trigger workflows on call events
- Use GHL for follow-up sequences

**Option 3: Zapier/Make Integration**
- Webhook on call complete → Zapier
- Create tasks, send emails, update CRM

---

## 🚀 QUICK START (Today)

### Step 1: Deploy Webhook Server

```bash
# Create server
mkdir -p /home/innovativeautomations/brand-voice-server
cd /home/innovativeautomations/brand-voice-server

# Install dependencies
npm init -y
npm install express twilio @google-cloud/sheets axios

# Deploy to Railway/Render/etc.
# Get public URL: https://your-server.com

# Update Twilio webhooks
twilio phone-number update +13108791273 --voice-url https://your-server.com/voice/inbound
```

### Step 2: Update Bland.ai Prompts

```bash
# API call to update agent with brand awareness
curl -X PATCH https://api.bland.ai/v1/agents/{agent_id} \
  -H "Authorization: {key}" \
  -d '{"prompt": "You are Sevyn, an AI assistant for multiple immigration brands..."}'
```

### Step 3: Test Each Number

```bash
# Call each number and verify:
# 1. Correct greeting plays
# 2. BD mode works for new callers
# 3. CS mode works for known numbers
```

---

## 💰 COST ESTIMATE

| Item | Monthly Cost |
|------|--------------|
| Twilio (5 numbers) | ~$6 |
| Twilio (voice minutes) | ~$50-100 |
| Bland.ai | Current plan |
| Server hosting (Railway) | ~$5-20 |
| 10DLC registration | One-time ~$15 |
| **Total** | **~$75-140/month** |

---

## ⏱️ TIMELINE

| Phase | Time | Deliverable |
|-------|------|-------------|
| 1 | 2-4 hours | Webhook server live |
| 2 | 1-2 hours | All brand configs |
| 3 | 2-3 hours | BD flow tested |
| 4 | 2-3 hours | CS flow tested |
| 5 | 1-5 days | SMS after 10DLC |
| 6 | 1 day | CRM integration |

**Total: 2-3 days to full optimization**

---

## ✅ DECISION NEEDED

**Which option do you want?**

**A)** Single Bland agent + dynamic prompts (fastest, 2-4 hours)

**B)** 5 separate Bland agents (most customized, 1-2 days)

**C)** Custom webhook server (recommended, maximum control, 1-2 days)

**Or a hybrid?** Start with A, migrate to C over time.
