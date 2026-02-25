# Knowledge Base Guide

How to add and manage content for Adriana's knowledge base.

---

## Current Knowledge Sources

### 1. BD Response Patterns (773 patterns)
**Location:** Immigration Knowledge Base  
**Content:** High-conversion email/response patterns with 99.8% conversion rate

Categories:
- Initial outreach responses
- Follow-up sequences
- Objection handling
- Pricing discussions
- Document requests

### 2. Workflow Videos (342 transcribed)
**Location:** `/home/innovativeautomations/immigration-knowledge-base/`

Categories:
- Training procedures
- Client correspondence
- Sports immigration specifics
- IGTA operations
- Case processing

### 3. Brand Websites (Potential Source)
Could scrape for additional content:
- sherrodsportsvisas.com
- aventusvisaagents.com
- o1dmatch.com
- innovativeglobaltalent.com
- dcfederallitigation.com

---

## Adding Knowledge to Retell Agents

### Option 1: Update System Prompt

The main way to add knowledge is through the system prompt:

```bash
curl -X PATCH "https://api.retellai.com/update-retell-llm/{llm_id}" \
  -H "Authorization: Bearer {RETELL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "general_prompt": "Your updated prompt with new knowledge..."
  }'
```

### Option 2: Knowledge Base Upload (Retell Feature)

Retell supports uploading documents to agent knowledge bases:

1. Go to Retell dashboard
2. Select agent → Knowledge Base
3. Upload PDFs or text files
4. Agent will RAG-search during calls

### Option 3: Custom Function Calls

For dynamic data (pricing, availability), use Retell function calls:

```javascript
// In retell-client.js
const functions = [
  {
    name: "check_availability",
    description: "Check consultation availability",
    parameters: {
      type: "object",
      properties: {
        date: { type: "string" },
        brand: { type: "string" }
      }
    }
  }
];
```

---

## Recommended Knowledge Structure

### Per-Brand Knowledge Files

```
knowledge-base/
├── ssv/
│   ├── services.md        # P-1A, O-1A pricing and process
│   ├── faqs.md            # Common questions
│   ├── athletes.md        # Sports-specific info
│   └── case-types.md      # Visa categories handled
├── aventus/
│   ├── services.md
│   └── faqs.md
├── o1dmatch/
│   ├── platform.md        # How the platform works
│   ├── eligibility.md     # O-1A criteria
│   └── faqs.md
├── igta/
│   ├── services.md
│   └── talent-types.md
├── dcfederal/
│   ├── practice-areas.md
│   └── process.md
└── shared/
    ├── visa-types.md      # General visa info
    ├── timelines.md       # Processing times
    └── uscis-updates.md   # Current USCIS news
```

---

## Content Templates

### Service Description Template
```markdown
# [Service Name]

## Overview
Brief description of the service.

## Who It's For
- Target audience 1
- Target audience 2

## Pricing
- Option A: $X,XXX
- Option B: $X,XXX

## Process
1. Step one
2. Step two
3. Step three

## Timeline
Typical processing time: X-X months

## Requirements
- Requirement 1
- Requirement 2
```

### FAQ Template
```markdown
# FAQs - [Brand]

## Q: [Common Question]?
A: [Clear, concise answer]

## Q: [Another Question]?
A: [Answer]
```

---

## Scraping Brand Websites

If you decide to scrape brand websites for content:

```javascript
// scrape-brands.js
const axios = require('axios');
const cheerio = require('cheerio');

const brands = [
  { name: 'SSV', url: 'https://sherrodsportsvisas.com' },
  { name: 'Aventus', url: 'https://aventusvisaagents.com' },
  // ...
];

async function scrapeBrand(brand) {
  const pages = ['/', '/services', '/about', '/faq', '/pricing'];
  
  for (const page of pages) {
    const response = await axios.get(brand.url + page);
    const $ = cheerio.load(response.data);
    
    // Extract main content
    const content = $('main').text().trim();
    
    // Save to knowledge base
    fs.writeFileSync(`knowledge-base/${brand.name}/${page.replace('/', '') || 'home'}.md`, content);
  }
}
```

---

## Syncing with Automations

To keep knowledge base consistent with other systems:

### Google Sheets Sync
- Pricing should match Sheet columns
- Client IDs should follow Sheet format
- Brand names should be consistent

### Airtable Sync
- Lead Record base structure
- Status values should match

### n8n Workflows
- 65 workflows in https://igta.app.n8n.cloud
- Check for overlapping automation logic

---

## Testing Knowledge Updates

After updating agent knowledge:

1. **Make test call** to the agent
2. **Ask about updated content** to verify it's working
3. **Check Retell dashboard** for call transcript
4. **Review post-call analysis** for accuracy

```bash
# Quick test call (outbound)
node code/test-agent.js agent_xxxxx "Hi, I'm calling about O-1A visa pricing"
```

---

## Knowledge Update Checklist

- [ ] Update system prompt in Retell
- [ ] Upload any new documents to KB
- [ ] Test with sample questions
- [ ] Update BRAND-CONFIGURATIONS.md
- [ ] Notify team of changes
- [ ] Update any related Google Sheets columns
- [ ] Check n8n workflows for conflicts
