-- Add Coca-Cola layout to the database
-- This layout is based on the current layoutDefaults from their profile

INSERT INTO proposal_layouts (tenant_id, data, is_draft) VALUES (
  'coca-cola',
  '{
    "sections": [
      { "type": "Hero", "variant": "backgroundImg", "enabled": true },
      { "type": "Overview", "variant": "opportunity", "enabled": true },
      { "type": "Objectives", "variant": "strategy", "enabled": true },
      { "type": "Campaign", "variant": "overview", "enabled": true },
      { "type": "Activation", "variant": "details", "enabled": true },
      { "type": "Timeline", "variant": "steps", "enabled": true },
      { "type": "Amplification", "variant": "content", "enabled": true },
      { "type": "Measurement", "variant": "success", "enabled": true },
      { "type": "Roles", "variant": "responsibilities", "enabled": true },
      { "type": "Budget", "variant": "pricing", "enabled": true },
      { "type": "Contact", "variant": "info", "enabled": true }
    ]
  }',
  false
);

-- Also add a draft version
INSERT INTO proposal_layouts (tenant_id, data, is_draft) VALUES (
  'coca-cola',
  '{
    "sections": [
      { "type": "Hero", "variant": "backgroundImg", "enabled": true },
      { "type": "Overview", "variant": "opportunity", "enabled": true },
      { "type": "Objectives", "variant": "strategy", "enabled": true },
      { "type": "Campaign", "variant": "overview", "enabled": true },
      { "type": "Activation", "variant": "details", "enabled": true },
      { "type": "Timeline", "variant": "steps", "enabled": true },
      { "type": "Amplification", "variant": "content", "enabled": true },
      { "type": "Measurement", "variant": "success", "enabled": true },
      { "type": "Roles", "variant": "responsibilities", "enabled": true },
      { "type": "Budget", "variant": "pricing", "enabled": true },
      { "type": "Contact", "variant": "info", "enabled": true }
    ]
  }',
  true
);
