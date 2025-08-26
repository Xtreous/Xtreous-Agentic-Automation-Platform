-- Agent templates table
CREATE TABLE agent_templates (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  industry TEXT NOT NULL,
  base_configuration JSONB NOT NULL DEFAULT '{}',
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  suggested_use_cases TEXT[] NOT NULL DEFAULT '{}',
  icon TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_templates_industry ON agent_templates(industry);
CREATE INDEX idx_agent_templates_type ON agent_templates(type);

-- Seed agent templates
INSERT INTO agent_templates (
  name, description, type, industry, base_configuration, capabilities, suggested_use_cases, icon
) VALUES
(
  'Construction Takeoff Assistant',
  'Automates material quantification and cost estimation from construction blueprints.',
  'analytical',
  'construction',
  '{"model": "gpt-4-turbo", "temperature": 0.2}',
  '{"blueprint_analysis", "material_quantification", "cost_estimation"}',
  '{"Automated material takeoffs", "Preliminary cost estimates", "Bid preparation"}',
  'Building'
),
(
  'Customer Support Bot',
  'Handles customer inquiries via email and chat, providing instant responses and intelligent ticket routing.',
  'conversational',
  'customer-service',
  '{"model": "claude-3-sonnet", "response_persona": "friendly"}',
  '{"email_handling", "chat_support", "ticket_routing", "sentiment_analysis"}',
  '{"24/7 customer support", "Answering FAQs", "Routing support tickets"}',
  'Headphones'
),
(
  'Financial Compliance Auditor',
  'Monitors transactions and reports for compliance with financial regulations, flagging potential issues in real-time.',
  'analytical',
  'finance',
  '{"model": "gpt-4o", "strict_mode": true}',
  '{"transaction_monitoring", "compliance_check", "report_generation"}',
  '{"Real-time transaction auditing", "Regulatory compliance checks", "Suspicious activity reporting"}',
  'Shield'
),
(
  'Sales Lead Qualifier',
  'Analyzes incoming leads from various channels to score and qualify them, enriching data and syncing with CRM.',
  'automation',
  'sales',
  '{"crm_system": "salesforce", "scoring_model": "v2.1"}',
  '{"lead_scoring", "data_enrichment", "crm_integration"}',
  '{"Qualifying inbound leads", "Enriching lead data", "Automating CRM entry"}',
  'TrendingUp'
),
(
  'Healthcare Data Extractor',
  'Extracts and structures patient data from various medical documents, including lab reports and clinical notes.',
  'automation',
  'healthcare',
  '{"document_types": ["pdf", "tiff"], "output_format": "json"}',
  '{"ocr", "data_extraction", "hipaa_compliance"}',
  '{"Extracting data from lab reports", "Structuring clinical notes", "Automating patient data entry"}',
  'HeartPulse'
),
(
  'Document Summarizer',
  'Generates concise summaries of long documents, reports, and articles, extracting key phrases and insights.',
  'analytical',
  'other',
  '{"summary_length": "short"}',
  '{"text_summarization", "nlp", "key_phrase_extraction"}',
  '{"Summarizing legal documents", "Creating executive summaries", "Analyzing research papers"}',
  'FileText'
);
