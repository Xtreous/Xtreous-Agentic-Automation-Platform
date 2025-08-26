-- Add trigger configuration to workflows table
ALTER TABLE workflows ADD COLUMN trigger_type TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE workflows ADD COLUMN trigger_config JSONB;

-- Add index for efficient querying of triggers
CREATE INDEX IF NOT EXISTS idx_workflows_trigger_type ON workflows(trigger_type);

-- Update existing workflows to have a default trigger type
UPDATE workflows SET trigger_type = 'manual' WHERE trigger_type IS NULL;
