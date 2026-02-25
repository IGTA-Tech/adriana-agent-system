# Sheets Integration Analysis

**Date:** 2026-02-23  
**Purpose:** Deep analysis of 3 critical operational sheets for multi-brand voice integration

---

## Sheet 1: Cases Assigned - Ankit Giri

**ID:** `1Ma1_6kERm9CpDnyb_F1N_IvaEYlitdt-p5q1Oop5pWg`  
**Purpose:** Active case management and processing tracker

### Structure
| Tab | Purpose | Row Count |
|-----|---------|-----------|
| IGTA Drafted Cases | Cases being prepared | ~5 |
| Document Submissions | Doc upload log | ~2 |
| Processing Log | Case action history | ~5 |
| Settings | System config (folder IDs) | Config |
| Ushkevich Immigration | Partner cases | Empty |
| Petitioners Services | Petitioner service cases | Unknown |
| Gill Law Firm Cases | Partner cases | Unknown |
| Compliance Dashboard | Compliance tracking | Unknown |

### Key Columns (IGTA Drafted Cases)
- Beneficiary's Name
- Petitioner's Name
- Type of Visa
- Urgency
- Notes on what's missing

### Voice System Role
**USE FOR: Customer Service Mode (CS)**
- When caller says "I'm an existing client"
- Adriana asks for last 4 digits of case ID
- Look up beneficiary name in Processing Log
- Provide status update or route to human

---

## Sheet 2: Innovative Global Holdings Lead Sheet (MASTER)

**ID:** `10yzVfq3aH89c2UUMJrI5PCrXv_vK1NIBm3jM2IlbIu4`  
**Purpose:** CENTRAL LEAD DATABASE FOR ALL BRANDS

### This is the Big One
- **35 tabs total**
- **SSV: 5,002 leads**
- **IGTA: 4,675 leads**
- This is the single source of truth for leads

### Key Tabs & Structure

#### SSV Tab (5,002 rows)
Columns:
- Date of Initial Contact
- Push: SSV / Pushed: SSV (automation flags)
- Full Name, First Name, Last Name
- Eval Score
- Sports/Non Sports
- Lead Status
- Email, Phone Number
- Intake Form, Folder Link
- Contact Status, Last Contacted Date
- Quotation Visa Type, Latest Amount of Quotation
- Updates, Notes
- Interested In Petitioner Service

#### IGTA Lead Sheet Tab (4,675 rows)
Similar structure with IGTA-specific columns

#### Aventus Leads Tab
- Same pattern
- Brand-specific lead tracking

#### CURRENT CLIENTS Tab
- Name, Status, Email
- Weekly Contact tracking
- Interested in Petitioner Service
- Employer info

#### Deals Tab
- Deal ID, Contact Name, Company, Brand
- Stage, Value, Probability, Expected Close

### Voice System Role
**USE FOR: Business Development Mode (BD) - PRIMARY**
- ALL new leads from calls should go here
- Match by brand:
  - SSV calls → SSV tab
  - IGTA calls → IGTA Lead Sheet tab
  - Aventus calls → Aventus Leads tab
  - O1dMatch calls → Could go to IGTA or create new tab
  - DC Federal calls → Could go to new tab or separate sheet

---

## Sheet 3: Aventus Visa Agents All Form Leads

**ID:** `1t8oUodMM0Aah_xBMLLC4uVxO9MeydHGDd0Th8y4ISX0`  
**Purpose:** Aventus-specific form submissions (website/portal)

### Structure
Columns:
- submitted on
- email
- form name
- name
- phone number
- message
- current status
- visa type needed
- field of expertise
- notable achievements

### Voice System Role
**USE FOR: Aventus-specific call logging (OPTIONAL)**
- Could log Aventus calls here in addition to master sheet
- Or could be deprecated in favor of master sheet Aventus tab

---

## My Recommendations

### Recommendation 1: Use Master Sheet as Primary Destination

**Why:**
- Already has 10,000+ leads organized by brand
- Has established column structure
- Team is already using it
- Single source of truth

**How:**
- SSV calls → Append to `SSV` tab
- IGTA calls → Append to `IGTA Lead Sheet` tab
- Aventus calls → Append to `Aventus Leads` tab
- O1dMatch calls → Create new `O1dMatch` tab (or use IGTA)
- DC Federal calls → Create new `DC Federal` tab (or separate)

### Recommendation 2: Cases Sheet for Customer Service Lookup

**Why:**
- Contains active case data
- Has Processing Log with beneficiary names
- Can match caller to case

**How:**
- When caller says "existing client"
- Query `Processing Log` by beneficiary name or phone
- Return case status to Adriana for verbal response
- If no match, route to human or take message

### Recommendation 3: Keep Call Log Sheet for Audit Trail

**Why:**
- New sheet we created is clean and structured
- Good for debugging and call analytics
- Doesn't interfere with operational data

**How:**
- Log ALL calls to Call Log sheet (current behavior)
- ALSO write to Master Lead Sheet brand tabs for new leads
- ALSO check Cases sheet for existing clients

### Recommendation 4: Skip Aventus Form Sheet

**Why:**
- Redundant with Master Sheet Aventus tab
- Only has ~20 entries (mostly test data)
- Master sheet is more complete

**How:**
- Don't integrate
- Or if needed, just read from it for duplicate checking

---

## Proposed Data Flow

```
Inbound Call
    ↓
Adriana: "Are you existing client or new inquiry?"
    ↓
┌─────────────────────┬──────────────────────────┐
│   EXISTING CLIENT   │      NEW INQUIRY         │
├─────────────────────┼──────────────────────────┤
│ Ask: "Last 4 of     │ Ask qualifying Qs        │
│      case ID"       │ Capture: name, email,    │
│                     │ phone, visa type         │
│ Lookup in:          │                          │
│ - Cases Sheet       │ Write to:                │
│ - Processing Log    │ 1. Call Log (audit)      │
│ - CURRENT CLIENTS   │ 2. Master Sheet by brand │
│                     │                          │
│ Return status       │ SMS notification         │
│ or route to human   │ if follow-up needed      │
└─────────────────────┴──────────────────────────┘
```

---

## Column Mapping for Master Sheet Integration

When writing new leads to Master Sheet:

| Voice Data | SSV Column | IGTA Column |
|------------|------------|-------------|
| timestamp | Date of Initial Contact | Date Added |
| caller_name | Full Name | Lead Name |
| caller_email | Email | (find email col) |
| caller_phone | Phone Number | (find phone col) |
| inquiry_topic | Notes | (notes col) |
| outcome | Lead Status | Lead Status |
| - | Push: SSV = FALSE | Push: IGTA = FALSE |
| - | Lead Style = "Voice Call" | - |

---

## Questions for Sherrod

1. **O1dMatch calls** - Should these go to IGTA tab or create new O1dMatch tab?

2. **DC Federal calls** - Same question - new tab or separate sheet?

3. **Existing client lookup** - What field should we match on?
   - Phone number?
   - Email?
   - Beneficiary name?
   - Case ID (if they have it)?

4. **Current Clients tab** - Should verified existing clients also update this tab?

5. **Eval Score** - Should we leave blank for voice leads, or set a default?

6. **Lead Status** - What should default status be? "New - Voice Lead"?

---

## Summary

| Sheet | Integration Type | Priority |
|-------|------------------|----------|
| Master Lead Sheet | Write new leads to brand tabs | **HIGH** |
| Cases Assigned | Read for CS mode lookup | **MEDIUM** |
| Call Log (new) | Keep for audit/analytics | **KEEP** |
| Aventus Form Sheet | Skip (redundant) | LOW |

The Master Lead Sheet is the crown jewel - 35 tabs, 10,000+ leads, established workflow. Voice calls should feed directly into it by brand.
