/**
 * Retell Webhook Handler
 * Receives call events from Retell and logs to Supabase + Google Sheets
 */

const { saveCall } = require('../database/supabase');

/**
 * Handle Retell webhook events
 */
async function handleRetellWebhook(req, res) {
  const event = req.body;
  
  console.log(`\n📞 Retell Event: ${event.event}`);
  
  switch (event.event) {
    case 'call_started':
      console.log(`   Call started: ${event.call.call_id}`);
      console.log(`   From: ${event.call.from_number} → To: ${event.call.to_number}`);
      break;
      
    case 'call_ended':
      await handleCallEnded(event.call);
      break;
      
    case 'call_analyzed':
      await handleCallAnalyzed(event.call);
      break;
      
    default:
      console.log(`   Unhandled event type: ${event.event}`);
  }
  
  res.json({ received: true });
}

/**
 * Handle call ended event
 */
async function handleCallEnded(call) {
  console.log(`   Call ended: ${call.call_id}`);
  console.log(`   Duration: ${call.duration_ms ? Math.round(call.duration_ms / 60000) : 0} min`);
  console.log(`   Status: ${call.call_status}`);
  
  // Extract brand from phone number
  const { getBrandConfig } = require('./retell-client');
  const brand = getBrandConfig(call.to_number);
  
  // Prepare call data for Supabase
  const callData = {
    call_id: call.call_id,
    brand: brand.brand,
    caller_phone: call.from_number,
    caller_name: null, // Will be filled by analysis
    caller_email: null,
    caller_type: 'unknown',
    inquiry_topic: null,
    outcome: call.call_status,
    follow_up_needed: false,
    call_duration_min: call.duration_ms ? Math.round(call.duration_ms / 60000) : null,
    summary: null,
    transcript: call.transcript || null,
    recording_url: call.recording_url || null,
    metadata: {
      retell_call_id: call.call_id,
      agent_id: call.agent_id,
      call_type: call.call_type,
      end_reason: call.disconnection_reason
    }
  };
  
  // Save to Supabase
  await saveCall(callData);
}

/**
 * Handle call analyzed event (post-call analysis)
 */
async function handleCallAnalyzed(call) {
  console.log(`   Call analyzed: ${call.call_id}`);
  
  const analysis = call.call_analysis || {};
  
  console.log(`   Caller Name: ${analysis.caller_name || 'N/A'}`);
  console.log(`   Topic: ${analysis.inquiry_topic || 'N/A'}`);
  console.log(`   Follow-up: ${analysis.follow_up_needed ? 'YES' : 'No'}`);
  
  // Update the call record with analysis data
  const { supabaseRequest } = require('../database/supabase');
  
  await supabaseRequest('calls', 'PATCH', {
    caller_name: analysis.caller_name || null,
    caller_email: analysis.caller_email || null,
    caller_type: analysis.caller_type || 'unknown',
    inquiry_topic: analysis.inquiry_topic || null,
    follow_up_needed: analysis.follow_up_needed || false,
    summary: analysis.summary || null
  }, `?call_id=eq.${call.call_id}`);
  
  // Send notification to Sherrod if follow-up needed
  if (analysis.follow_up_needed) {
    await notifyTeam(call, analysis);
  }
}

/**
 * Send notification to team
 */
async function notifyTeam(call, analysis) {
  const { getBrandConfig } = require('./retell-client');
  const brand = getBrandConfig(call.to_number);
  
  let message = `📞 NEW ${brand.brand} LEAD (Retell)\n`;
  message += `From: ${call.from_number}\n`;
  if (analysis.caller_name) message += `Name: ${analysis.caller_name}\n`;
  if (analysis.caller_email) message += `Email: ${analysis.caller_email}\n`;
  if (analysis.inquiry_topic) message += `Topic: ${analysis.inquiry_topic}\n`;
  if (analysis.urgency === 'urgent') message += `⚠️ URGENT\n`;
  message += `\n${analysis.summary || 'No summary'}`;
  
  try {
    const twilio = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    await twilio.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER || '+19803032854',
      to: '+15617408303' // Sherrod
    });
    
    console.log('📱 Notification sent to Sherrod');
  } catch (error) {
    console.error('SMS notification failed:', error.message);
  }
}

/**
 * Twilio webhook to forward calls to Retell
 * This replaces the old Bland.ai flow
 */
function handleTwilioToRetell(req, res) {
  const twilio = require('twilio');
  const calledNumber = req.body.Called || req.body.To || '';
  const callerNumber = req.body.From || '';
  
  const { getBrandConfig } = require('./retell-client');
  const brand = getBrandConfig(calledNumber);
  
  console.log(`\n📞 Inbound call (Retell flow)`);
  console.log(`   From: ${callerNumber}`);
  console.log(`   To: ${calledNumber} (${brand.brand})`);
  
  const twiml = new twilio.twiml.VoiceResponse();
  
  // Connect to Retell via SIP or Stream
  // Option 1: Forward to Retell phone number (if configured)
  // Option 2: Use Twilio <Connect> with Retell WebSocket
  
  // For now, use the agent's Retell number
  // This will be updated once we have the Retell phone numbers
  const retellNumber = process.env[`RETELL_NUMBER_${brand.brand}`];
  
  if (retellNumber) {
    twiml.dial({
      timeout: 60,
      callerId: calledNumber,
      action: '/retell/call-complete'
    }, retellNumber);
  } else {
    // Fallback: Use TwiML Connect with Stream to Retell WebSocket
    const connect = twiml.connect();
    connect.stream({
      url: `wss://api.retellai.com/audio-websocket/${brand.agent_id}`,
      track: 'both_tracks'
    });
  }
  
  res.type('text/xml');
  res.send(twiml.toString());
}

module.exports = {
  handleRetellWebhook,
  handleCallEnded,
  handleCallAnalyzed,
  handleTwilioToRetell
};
