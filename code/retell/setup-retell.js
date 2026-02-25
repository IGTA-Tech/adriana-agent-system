#!/usr/bin/env node
/**
 * Retell Setup Script
 * Creates all brand agents and LLMs in Retell
 * 
 * Usage: RETELL_API_KEY=xxx node setup-retell.js
 */

require('dotenv').config({ path: '../.env' });

const { 
  BRAND_CONFIGS, 
  createLLM, 
  createAgent,
  listAgents 
} = require('./retell-client');

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_API_URL = 'https://api.retellai.com';

if (!RETELL_API_KEY) {
  console.error('❌ RETELL_API_KEY not set!');
  console.log('Usage: RETELL_API_KEY=xxx node setup-retell.js');
  process.exit(1);
}

async function createRetellLLM(config) {
  const response = await fetch(`${RETELL_API_URL}/create-retell-llm`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      general_prompt: config.prompt,
      begin_message: config.greeting
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create LLM: ${error}`);
  }

  return await response.json();
}

async function createRetellAgent(config, llmId) {
  const response = await fetch(`${RETELL_API_URL}/create-agent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agent_name: `${config.brand} - Adriana`,
      response_engine: {
        type: 'retell-llm',
        llm_id: llmId
      },
      voice_id: 'retell-Marissa', // Professional female voice (recommended)
      voice_temperature: 0.7,
      responsiveness: 0.8,
      interruption_sensitivity: 0.6,
      enable_backchannel: true,
      backchannel_frequency: 0.8,
      language: 'en-US',
      ambient_sound: 'call-center',
      end_call_after_silence_ms: 30000,
      max_call_duration_ms: 900000,
      post_call_analysis_data: [
        { name: 'caller_name', type: 'string', description: 'Full name of the caller' },
        { name: 'caller_email', type: 'string', description: 'Email address if provided' },
        { name: 'inquiry_topic', type: 'string', description: 'What they are calling about' },
        { name: 'caller_type', type: 'enum', description: 'Type of caller', choices: ['new_lead', 'existing_client', 'vendor', 'other'] },
        { name: 'follow_up_needed', type: 'boolean', description: 'Whether someone needs to call back' },
        { name: 'urgency', type: 'enum', description: 'Urgency level', choices: ['urgent', 'normal', 'low'] },
        { name: 'summary', type: 'string', description: 'Brief summary of the conversation' }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create agent: ${error}`);
  }

  return await response.json();
}

async function importPhoneNumber(phoneNumber, agentId) {
  // Import existing Twilio number to Retell
  const response = await fetch(`${RETELL_API_URL}/import-phone-number`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
      termination_uri: process.env.TWILIO_SIP_URI, // If using SIP
      inbound_agent_id: agentId,
      outbound_agent_id: agentId
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`   ⚠️ Could not import phone number: ${error}`);
    return null;
  }

  return await response.json();
}

async function main() {
  console.log('🚀 Setting up Retell AI for Multi-Brand Calling System\n');
  console.log('='.repeat(60) + '\n');
  
  const results = [];
  
  for (const [phone, config] of Object.entries(BRAND_CONFIGS)) {
    console.log(`📞 Setting up ${config.brand} (${phone})...`);
    
    try {
      // Step 1: Create LLM
      console.log('   Creating LLM...');
      const llm = await createRetellLLM(config);
      console.log(`   ✅ LLM created: ${llm.llm_id}`);
      
      // Step 2: Create Agent
      console.log('   Creating Agent...');
      const agent = await createRetellAgent(config, llm.llm_id);
      console.log(`   ✅ Agent created: ${agent.agent_id}`);
      
      results.push({
        phone,
        brand: config.brand,
        llm_id: llm.llm_id,
        agent_id: agent.agent_id
      });
      
      console.log(`   🎉 ${config.brand} ready!\n`);
      
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 1500));
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}\n`);
    }
  }
  
  console.log('='.repeat(60));
  console.log('\n📋 SETUP COMPLETE\n');
  console.log('Add these to your .env file:\n');
  
  results.forEach(r => {
    console.log(`RETELL_AGENT_${r.brand}=${r.agent_id}`);
  });
  
  console.log('\n📄 Full Results:\n');
  console.log(JSON.stringify(results, null, 2));
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync('./retell-agents.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Saved to retell-agents.json');
}

main().catch(console.error);
