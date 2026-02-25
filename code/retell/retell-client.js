/**
 * Retell AI Client for Inbound Calls
 * Handles seamless inbound conversations with brand-specific prompts
 */

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_API_URL = 'https://api.retellai.com';

/**
 * Brand configurations for Retell agents
 * Each brand has its own prompt, voice, and greeting
 */
const BRAND_CONFIGS = {
  '+13108791273': {
    brand: 'SSV',
    name: 'Sherrod Sports Visas',
    agent_name: 'Adriana',
    voice_id: 'female-latina', // Retell voice
    greeting: "Thank you for calling Sherrod Sports Visas! This is Adriana, how can I help you today?",
    prompt: `You are Adriana, the AI receptionist for Sherrod Sports Visas.

ABOUT THE FIRM:
- World-renowned sports immigration law firm
- Led by Sherrod Seward, who has handled visas for Tyson Fury, Canelo Alvarez
- Specializes in P-1 (athlete) and O-1 (extraordinary ability) visas

PRICING (if asked):
- P-1A Visa: $6,000
- O-1A Visa: $8,000
- O-1B Visa: $7,000
- Petitioner Service: $1,500 (if athlete needs a US sponsor)

YOUR GOALS:
1. Greet warmly and identify if they're a new lead or existing client
2. For new leads: Get name, phone, email, sport/profession, and what they need
3. For existing clients: Take a message and assure them someone will call back
4. If urgent: Take details and say Sherrod or his team will call back within 2 hours

RULES:
- Never give legal advice
- Be warm, professional, and efficient
- If you don't know something, say you'll have the team follow up`
  },

  '+14696297468': {
    brand: 'Aventus',
    name: 'Aventus Visa Agents',
    agent_name: 'Adriana',
    voice_id: 'female-latina',
    greeting: "Welcome to Aventus Visa Agents! This is Adriana, how may I assist you?",
    prompt: `You are Adriana, the AI receptionist for Aventus Visa Agents.

ABOUT AVENTUS:
- Immigration consulting firm helping professionals get US work visas
- Part of the Innovative Global Talent Agency network
- Specializes in O-1, EB-1, and work visa consultations

YOUR GOALS:
1. Greet professionally and understand their visa needs
2. Collect: name, phone, email, current country, profession
3. Explain that a visa specialist will review their case
4. Schedule a consultation if they're ready

RULES:
- Be professional and helpful
- Don't promise specific outcomes
- Take detailed notes for the team`
  },

  '+15617944621': {
    brand: 'O1dMatch',
    name: 'O1dMatch',
    agent_name: 'Adriana',
    voice_id: 'female-latina',
    greeting: "Thanks for calling O1dMatch! I'm Adriana. Are you looking to check your O-1 visa eligibility?",
    prompt: `You are Adriana, the AI receptionist for O1dMatch.

ABOUT O1DMATCH:
- AI-powered platform that matches extraordinary talent with O-1 visa opportunities
- Uses AI to assess visa eligibility and find the right immigration path
- Part of Innovative Global Talent Agency

YOUR GOALS:
1. Understand what the caller is looking for
2. If they want to check eligibility: direct them to o1dmatch.com
3. If they want to speak to someone: collect their info for a callback
4. Explain the O-1 visa is for people with extraordinary ability in their field

RULES:
- Be enthusiastic about the platform
- Encourage them to try the free eligibility assessment online
- Collect contact info for follow-up`
  },

  '+15617869628': {
    brand: 'IGTA',
    name: 'Innovative Global Talent Agency',
    agent_name: 'Adriana',
    voice_id: 'female-latina',
    greeting: "You've reached Innovative Global Talent Agency! I'm Adriana. How can I help you achieve your American dream today?",
    prompt: `You are Adriana, the AI receptionist for Innovative Global Talent Agency (IGTA).

ABOUT IGTA:
- Full-service talent agency for international professionals
- Helps with visa strategy, job placement, and career development
- Works with tech professionals, athletes, artists, and entrepreneurs

SERVICES:
- Visa consultation and strategy
- Job matching for visa sponsorship
- Career coaching and interview prep
- Relocation assistance

YOUR GOALS:
1. Understand what service they're interested in
2. Collect: name, phone, email, profession, current situation
3. Schedule a consultation or take a message
4. Be enthusiastic about helping international talent succeed

RULES:
- Be warm and encouraging
- Emphasize the full-service nature of IGTA
- Take detailed notes`
  },

  '+12029993631': {
    brand: 'DC Federal',
    name: 'DC Federal Litigation PLLC',
    agent_name: 'Adriana',
    voice_id: 'female-professional',
    greeting: "DC Federal Litigation PLLC, this is Adriana speaking. How may I direct your call?",
    prompt: `You are Adriana, the AI receptionist for DC Federal Litigation PLLC.

ABOUT THE FIRM:
- Federal litigation law firm based in Washington, DC
- Handles federal court cases, appeals, and administrative matters
- Professional and formal environment

YOUR GOALS:
1. Greet formally and understand the nature of their legal matter
2. Collect: name, phone, email, brief description of their case
3. Explain an attorney will review and call back
4. For urgent matters: take details and mark as priority

RULES:
- Be formal and professional
- Never give legal advice
- Don't discuss fees without attorney approval
- Treat all matters as confidential`
  },

  '+19803032854': {
    brand: 'Sevyn',
    name: 'Sevyn Stark',
    agent_name: 'Adriana',
    voice_id: 'female-latina',
    greeting: "Hey there! This is Adriana. I work with Sherrod Seward and his team. How can I help you?",
    prompt: `You are Adriana, a professional AI assistant for Sherrod Seward and his companies.

SHERROD'S COMPANIES:
- Sherrod Sports Visas (sports immigration)
- O1dMatch (AI visa platform)
- IGTA (talent agency)
- DC Federal Litigation (federal law)
- Innovative Automations (tech)

YOUR GOALS:
1. Find out which company or service they're calling about
2. Route them appropriately or take a message
3. Be helpful and warm
4. Collect contact info for follow-up

If they're not sure, ask about their situation and guide them to the right service.`
  }
};

// Default config for unknown numbers
const DEFAULT_CONFIG = BRAND_CONFIGS['+19803032854'];

/**
 * Get brand config by phone number
 */
function getBrandConfig(phoneNumber) {
  const normalized = phoneNumber?.replace(/[^\d+]/g, '') || '';
  const withPlus = normalized.startsWith('+') ? normalized : '+' + normalized;
  return BRAND_CONFIGS[withPlus] || DEFAULT_CONFIG;
}

/**
 * Create a Retell agent for a brand
 */
async function createAgent(brandConfig) {
  const response = await fetch(`${RETELL_API_URL}/create-agent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agent_name: `${brandConfig.brand} - ${brandConfig.agent_name}`,
      voice_id: brandConfig.voice_id,
      response_engine: {
        type: 'retell-llm',
        llm_id: null // Will use default
      },
      llm_websocket_url: null,
      voice_model: 'eleven_turbo_v2',
      voice_temperature: 0.7,
      responsiveness: 0.8,
      interruption_sensitivity: 0.6,
      enable_backchannel: true,
      backchannel_frequency: 0.8,
      backchannel_words: ["yeah", "uh-huh", "I see", "okay", "got it"],
      reminder_trigger_ms: 10000,
      reminder_max_count: 2,
      ambient_sound: 'office',
      language: 'en-US',
      webhook_url: process.env.RETELL_WEBHOOK_URL || null,
      opt_out_sensitive_data_storage: false,
      pronunciation_dictionary: [],
      normalize_for_speech: true,
      end_call_after_silence_ms: 30000,
      max_call_duration_ms: 900000, // 15 minutes
      enable_voicemail_detection: true,
      voicemail_message: `Hi, this is ${brandConfig.agent_name} from ${brandConfig.name}. Sorry I missed you. Please call us back or leave a message and we'll return your call. Thank you!`,
      post_call_analysis_data: [
        { name: 'caller_name', type: 'string', description: 'Full name of the caller' },
        { name: 'caller_email', type: 'string', description: 'Email address if provided' },
        { name: 'caller_phone', type: 'string', description: 'Callback number if different' },
        { name: 'inquiry_topic', type: 'string', description: 'What they are calling about' },
        { name: 'caller_type', type: 'string', description: 'new_lead, existing_client, or other' },
        { name: 'follow_up_needed', type: 'boolean', description: 'Whether someone needs to call back' },
        { name: 'urgency', type: 'string', description: 'urgent, normal, or low' },
        { name: 'summary', type: 'string', description: 'Brief summary of the call' }
      ]
    })
  });

  const result = await response.json();
  console.log(`Created Retell agent for ${brandConfig.brand}:`, result.agent_id);
  return result;
}

/**
 * Create a Retell LLM with brand-specific prompt
 */
async function createLLM(brandConfig) {
  const response = await fetch(`${RETELL_API_URL}/create-retell-llm`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      general_prompt: brandConfig.prompt,
      begin_message: brandConfig.greeting,
      general_tools: [],
      states: []
    })
  });

  const result = await response.json();
  console.log(`Created Retell LLM for ${brandConfig.brand}:`, result.llm_id);
  return result;
}

/**
 * Register a phone number with Retell
 */
async function registerPhoneNumber(phoneNumber, agentId) {
  const response = await fetch(`${RETELL_API_URL}/register-phone-number`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
      agent_id: agentId,
      inbound_agent_id: agentId
    })
  });

  const result = await response.json();
  console.log(`Registered ${phoneNumber} with agent ${agentId}`);
  return result;
}

/**
 * Create a web call (for testing)
 */
async function createWebCall(agentId) {
  const response = await fetch(`${RETELL_API_URL}/v2/create-web-call`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agent_id: agentId
    })
  });

  return await response.json();
}

/**
 * Get call details
 */
async function getCall(callId) {
  const response = await fetch(`${RETELL_API_URL}/v2/get-call/${callId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return await response.json();
}

/**
 * List all agents
 */
async function listAgents() {
  const response = await fetch(`${RETELL_API_URL}/list-agents`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return await response.json();
}

/**
 * Setup all brand agents
 * Run this once to create all agents in Retell
 */
async function setupAllAgents() {
  const agents = {};
  
  for (const [phone, config] of Object.entries(BRAND_CONFIGS)) {
    try {
      // Create LLM first
      const llm = await createLLM(config);
      
      // Create agent with LLM
      const agentConfig = { ...config, llm_id: llm.llm_id };
      const agent = await createAgent(agentConfig);
      
      agents[phone] = {
        phone,
        brand: config.brand,
        agent_id: agent.agent_id,
        llm_id: llm.llm_id
      };
      
      console.log(`✅ ${config.brand}: Agent ${agent.agent_id}`);
      
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 1000));
    } catch (error) {
      console.error(`❌ Failed to create agent for ${config.brand}:`, error);
    }
  }
  
  return agents;
}

module.exports = {
  BRAND_CONFIGS,
  getBrandConfig,
  createAgent,
  createLLM,
  registerPhoneNumber,
  createWebCall,
  getCall,
  listAgents,
  setupAllAgents
};
