-- Adriana Multi-Brand Voice Agent System
-- Supabase Schema

-- Calls table - stores all inbound/outbound call records
CREATE TABLE calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id TEXT UNIQUE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  brand TEXT NOT NULL,
  caller_phone TEXT NOT NULL,
  caller_name TEXT,
  caller_email TEXT,
  caller_type TEXT DEFAULT 'unknown', -- new_lead, existing_client, vendor, other
  inquiry_topic TEXT,
  outcome TEXT, -- ended, transferred, voicemail, not_connected
  follow_up_needed BOOLEAN DEFAULT FALSE,
  call_duration_min NUMERIC,
  summary TEXT,
  transcript TEXT,
  recording_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table - new leads captured from calls
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id TEXT REFERENCES calls(call_id),
  name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  brand TEXT NOT NULL,
  source TEXT DEFAULT 'voice', -- voice, sms, web
  status TEXT DEFAULT 'new', -- new, contacted, qualified, converted, lost
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS messages table - conversation log
CREATE TABLE sms_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  direction TEXT NOT NULL, -- inbound, outbound
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  body TEXT NOT NULL,
  brand TEXT,
  ai_response TEXT,
  twilio_sid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily stats table - aggregated metrics
CREATE TABLE stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_calls INTEGER DEFAULT 0,
  total_sms INTEGER DEFAULT 0,
  total_leads INTEGER DEFAULT 0,
  calls_by_brand JSONB DEFAULT '{}',
  follow_ups_needed INTEGER DEFAULT 0,
  avg_call_duration NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_calls_brand ON calls(brand);
CREATE INDEX idx_calls_timestamp ON calls(timestamp DESC);
CREATE INDEX idx_calls_caller_phone ON calls(caller_phone);
CREATE INDEX idx_calls_follow_up ON calls(follow_up_needed) WHERE follow_up_needed = true;
CREATE INDEX idx_leads_brand ON leads(brand);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_sms_from ON sms_messages(from_number);
CREATE INDEX idx_stats_date ON stats(date DESC);

-- RLS Policies (optional - for direct client access)
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON calls FOR ALL USING (true);
CREATE POLICY "Service role full access" ON leads FOR ALL USING (true);
CREATE POLICY "Service role full access" ON sms_messages FOR ALL USING (true);
CREATE POLICY "Service role full access" ON stats FOR ALL USING (true);
