/**
 * Supabase Client for Adriana Multi-Brand System
 * Primary database for calls, leads, SMS, and stats
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wwxftuxdppoqgqdfaexl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3eGZ0dXhkcHBvcWdxZGZhZXhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjAyODU0NiwiZXhwIjoyMDg3NjA0NTQ2fQ.SM1oEiq7D2hgGt1gTnx8BTj4D2oofP1EpRWz0OutSF0';

const REST_URL = `${SUPABASE_URL}/rest/v1`;

/**
 * Make authenticated request to Supabase
 */
async function supabaseRequest(table, method = 'GET', data = null, query = '') {
  const url = `${REST_URL}/${table}${query}`;
  
  const options = {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal'
    }
  };
  
  if (data && (method === 'POST' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Supabase ${method} ${table} failed:`, error);
      return null;
    }
    
    if (method === 'GET' || options.headers.Prefer === 'return=representation') {
      return await response.json();
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Supabase error (${table}):`, error.message);
    return null;
  }
}

/**
 * Save a call record
 */
async function saveCall(callData) {
  const result = await supabaseRequest('calls', 'POST', {
    call_id: callData.call_id,
    brand: callData.brand,
    caller_phone: callData.caller_phone,
    caller_name: callData.caller_name || null,
    caller_email: callData.caller_email || null,
    caller_type: callData.caller_type || 'unknown',
    inquiry_topic: callData.inquiry_topic || null,
    outcome: callData.outcome || null,
    follow_up_needed: callData.follow_up_needed || false,
    call_duration_min: callData.call_duration_min || null,
    summary: callData.summary || null,
    transcript: callData.transcript || null,
    metadata: callData.metadata || {}
  });
  
  if (result) {
    console.log(`✅ Call saved to Supabase: ${callData.call_id}`);
    return result[0] || result;
  }
  return null;
}

/**
 * Save a lead
 */
async function saveLead(leadData) {
  const result = await supabaseRequest('leads', 'POST', {
    call_id: leadData.call_id || null,
    name: leadData.name || null,
    phone: leadData.phone,
    email: leadData.email || null,
    brand: leadData.brand,
    source: leadData.source || 'voice',
    status: leadData.status || 'new',
    notes: leadData.notes || null
  });
  
  if (result) {
    console.log(`✅ Lead saved to Supabase`);
    return result[0] || result;
  }
  return null;
}

/**
 * Save SMS message
 */
async function saveSMS(smsData) {
  const result = await supabaseRequest('sms_messages', 'POST', {
    direction: smsData.direction,
    from_number: smsData.from,
    to_number: smsData.to,
    body: smsData.body,
    brand: smsData.brand || null,
    ai_response: smsData.ai_response || null,
    twilio_sid: smsData.twilio_sid || null
  });
  
  if (result) {
    console.log(`✅ SMS saved to Supabase`);
  }
  return result;
}

/**
 * Get recent calls
 */
async function getCalls(options = {}) {
  const { brand, limit = 50, followUpOnly = false } = options;
  
  let query = '?order=timestamp.desc';
  if (limit) query += `&limit=${limit}`;
  if (brand) query += `&brand=eq.${brand}`;
  if (followUpOnly) query += `&follow_up_needed=eq.true`;
  
  const calls = await supabaseRequest('calls', 'GET', null, query);
  return calls || [];
}

/**
 * Get leads
 */
async function getLeads(options = {}) {
  const { brand, status, limit = 50 } = options;
  
  let query = '?order=created_at.desc';
  if (limit) query += `&limit=${limit}`;
  if (brand) query += `&brand=eq.${brand}`;
  if (status) query += `&status=eq.${status}`;
  
  const leads = await supabaseRequest('leads', 'GET', null, query);
  return leads || [];
}

/**
 * Get today's stats
 */
async function getStats() {
  const today = new Date().toISOString().split('T')[0];
  const stats = await supabaseRequest('stats', 'GET', null, `?date=eq.${today}`);
  
  if (stats && stats.length > 0) {
    return stats[0];
  }
  
  // Return default stats if none exist
  return {
    date: today,
    total_calls: 0,
    total_sms: 0,
    total_leads: 0,
    calls_by_brand: {}
  };
}

/**
 * Increment SMS count
 */
async function incrementSMSCount() {
  const today = new Date().toISOString().split('T')[0];
  
  // Try to update existing record
  const result = await supabaseRequest('stats', 'PATCH', {
    total_sms: 'total_sms + 1',
    updated_at: new Date().toISOString()
  }, `?date=eq.${today}`);
  
  // If no record exists, create one
  if (!result) {
    await supabaseRequest('stats', 'POST', {
      date: today,
      total_sms: 1
    });
  }
}

/**
 * Get all data for dashboard
 */
async function getDashboardData() {
  const [calls, leads, stats] = await Promise.all([
    getCalls({ limit: 20 }),
    getLeads({ limit: 20 }),
    getStats()
  ]);
  
  return {
    calls,
    leads,
    stats,
    timestamp: new Date().toISOString()
  };
}

/**
 * Health check - verify Supabase connection
 */
async function healthCheck() {
  try {
    const result = await supabaseRequest('stats', 'GET', null, '?limit=1');
    return { ok: true, connected: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

module.exports = {
  saveCall,
  saveLead,
  saveSMS,
  getCalls,
  getLeads,
  getStats,
  getDashboardData,
  incrementSMSCount,
  healthCheck,
  supabaseRequest
};
