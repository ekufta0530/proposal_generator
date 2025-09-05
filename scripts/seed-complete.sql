-- Complete Seed File for Proposals Platform
-- This file sets up the Hive Gaming organization with test user and sample wireframe proposal

-- ========================================
-- 1. INSERT ORGANIZATIONS (without default_tenant first)
-- ========================================

-- Insert Hive Gaming organization without default_tenant to avoid foreign key constraint
INSERT INTO organizations (id, name) VALUES ('Kj8mN2pQ', 'Hive Gaming') 
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 2. INSERT TENANTS
-- ========================================

-- Insert Hive Gaming tenant
INSERT INTO tenants (id, name, org_id) VALUES ('hive-gaming', 'Hive Gaming', 'Kj8mN2pQ') 
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 3. UPDATE ORGANIZATIONS WITH DEFAULT TENANT
-- ========================================

-- Update organization with default_tenant now that tenant exists
UPDATE organizations SET default_tenant = 'hive-gaming' WHERE id = 'Kj8mN2pQ';

-- ========================================
-- 4. INSERT TENANT PROFILES
-- ========================================

-- Hive Gaming Profile
INSERT INTO tenant_profiles (tenant_id, data) VALUES (
  'hive-gaming',
  '{
    "branding": {
      "name": "Hive Gaming",
      "colors": {
        "primary": "#e10600",
        "secondary": "#000000",
        "background": "#ffffff",
        "text": "#000000"
      }
    },
    "templateVersion": "1.0.0"
  }'
) ON CONFLICT (tenant_id) DO UPDATE SET 
  data = EXCLUDED.data,
  updated_at = now();


-- ========================================
-- 5. INSERT TENANT REFERENCES
-- ========================================

-- Hive Gaming References
INSERT INTO tenant_references (tenant_id, data) VALUES (
  'hive-gaming',
  '{
    "templateVersion": "1.0.0",
    "references": [
      {
        "id": "ref-a8-1",
        "title": "Esports Partnership Success",
        "quote": "A8 Esports delivered exceptional results for our brand partnership."
      },
      {
        "id": "ref-a8-2", 
        "title": "Community Engagement",
        "quote": "Their community-first approach created authentic connections."
      }
    ],
    "collections": {
      "default": ["ref-a8-1", "ref-a8-2"]
    }
  }'
) ON CONFLICT (tenant_id) DO UPDATE SET 
  data = EXCLUDED.data,
  updated_at = now();



-- ========================================
-- 6. INSERT PROPOSAL LAYOUTS
-- ========================================

-- Hive Gaming Layout
INSERT INTO proposal_layouts (tenant_id, data) VALUES (
  'hive-gaming',
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
  }'
) ON CONFLICT (tenant_id) DO UPDATE SET 
  data = EXCLUDED.data,
  updated_at = now();

-- ========================================
-- 7. INSERT PROPOSAL CONTENT
-- ========================================

-- Hive Gaming Sample Proposal (Live) - Complete Wireframe Proposal
INSERT INTO proposal_content (tenant_id, slug, data, is_draft) VALUES (
  'hive-gaming',
  'coca-cola-a8-esports-proposal',
  '{
    "sections": [
      {
        "type": "Hero",
        "variant": "backgroundImg",
        "enabled": true,
        "props": {
          "eyebrow": "Presented by Coca-Cola & A8 Esports",
          "title": "Refresh: Europe — Content Creator Acceler8tor",
          "subtitle": "Empowering new voices in esports to build authentic brand love.",
          "backgroundImage": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop"
        }
      },
      {
        "type": "Overview",
        "variant": "opportunity",
        "enabled": true,
        "props": {
          "title": "The Opportunity",
          "description": "Esports communities rally around trusted creators. By supporting grassroots talent with real value, brands earn authentic affinity.",
          "kpis": [
            {
              "label": "Target Audience",
              "value": "Gen Z & Young Adults"
            },
            {
              "label": "Engagement",
              "value": "Always-on social & streaming"
            },
            {
              "label": "Community",
              "value": "Creator-led trust"
            }
          ],
          "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
          "imageAlt": "Creator setup placeholder"
        }
      },
      {
        "type": "Objectives",
        "variant": "strategy",
        "enabled": true,
        "props": {
          "title": "Objectives & Strategy",
          "subtitle": "Build brand love via community, content, and creators.",
          "objectives": [
            {
              "title": "Community",
              "description": "Engage esports audiences at the grassroots level."
            },
            {
              "title": "Content",
              "description": "Always-on programming that audiences genuinely care about."
            },
            {
              "title": "Creators",
              "description": "Test & learn across diverse creators to find the best fit."
            }
          ]
        }
      },
      {
        "type": "Campaign",
        "variant": "overview",
        "enabled": true,
        "props": {
          "activateTitle": "ACTIVATE",
          "activateDescription": "Two-day creator conference leveling up craft, growth, and sustainability.",
          "activateBullets": [
            "Workshops & keynotes",
            "Pro tips & live demos",
            "Wellness & community"
          ],
          "activateLink": "#activation",
          "amplifyTitle": "AMPLIFY",
          "amplifyDescription": "Pre-event media + creator content amplified across channels.",
          "amplifyBullets": [
            "Social & stream integrations",
            "UGC hooks",
            "Tested creator formats"
          ],
          "amplifyLink": "#amplify"
        }
      },
      {
        "type": "Activation",
        "variant": "details",
        "enabled": true,
        "props": {
          "title": "Activation Details",
          "details": [
            {
              "label": "What",
              "value": "2-day micro-influencer conference (within TwitchCon AMS)"
            },
            {
              "label": "Why",
              "value": "Grassroots authenticity → brand love"
            },
            {
              "label": "When",
              "value": "Mid-July (2 days), plus TwitchCon day"
            },
            {
              "label": "Who",
              "value": "25 diverse micro-influencers (UK & EU)"
            },
            {
              "label": "Where",
              "value": "Amsterdam: office / show floor / hotel"
            },
            {
              "label": "Communities",
              "value": "LoL, Rocket League, FIFA, Wild Rift, Variety, Cosplay"
            }
          ],
          "themes": [
            {
              "title": "Craft",
              "items": [
                "Setup & studio workflow",
                "Personal brand & style",
                "Gameplay skill edge"
              ]
            },
            {
              "title": "Growth",
              "items": [
                "Platform-specific hacks",
                "Community engagement",
                "Access to pros & devs"
              ]
            },
            {
              "title": "Sustainability",
              "items": [
                "Mental health habits",
                "Physical wellness",
                "Business of content"
              ]
            }
          ]
        }
      },
      {
        "type": "Timeline",
        "variant": "steps",
        "enabled": true,
        "props": {
          "title": "Program Timeline",
          "steps": [
            {
              "title": "Planning",
              "description": "Creator roster & show planning"
            },
            {
              "title": "Launch (April)",
              "description": "Refresh Your Plays flight begins"
            },
            {
              "title": "Conference (May–July)",
              "description": "2-day event + TwitchCon"
            },
            {
              "title": "Reporting (August)",
              "description": "Reach, engagement, brand love, event KPIs"
            }
          ]
        }
      },
      {
        "type": "Amplification",
        "variant": "content",
        "enabled": true,
        "props": {
          "leftTitle": "TwitchCon Showfloor Pods (Concept)",
          "leftDescription": "Branded broadcast pods with light overlays (#BoostedByCoke). Attendees stream on a short delay to featured channels.",
          "leftNote": "Note: Not in current budget; scalable add-on.",
          "rightTitle": "Refresh Your Plays",
          "rightDescription": "Creator-led segments that teach meta shifts & role transitions; UGC hook for community submissions.",
          "rightBullets": [
            "4 × :60s videos per creator",
            "2 × per month",
            "3-month flight"
          ]
        }
      },
      {
        "type": "Measurement",
        "variant": "success",
        "enabled": true,
        "props": {
          "leftTitle": "How We Measure Success — Content",
          "leftBullets": [
            "Reach",
            "Engagement",
            "Brand Love (Affinity + Sentiment)"
          ],
          "rightTitle": "How We Measure Success — Event",
          "rightBullets": [
            "Attendance",
            "Participation",
            "Attendee Feedback",
            "Onsite Content Sentiment"
          ]
        }
      },
      {
        "type": "Roles",
        "variant": "responsibilities",
        "enabled": true,
        "props": {
          "leftTitle": "A8 Responsibilities",
          "leftBullets": [
            "Talent & partner management",
            "Activation strategy & event production",
            "Amplification & community engagement"
          ],
          "rightTitle": "Brand Partner",
          "rightBullets": [
            "Brand guidance & approvals",
            "Co-marketing & promotion",
            "Measurement alignment"
          ]
        }
      },
      {
        "type": "Budget",
        "variant": "pricing",
        "enabled": true,
        "props": {
          "title": "Budget & Scope",
          "tiers": [
            {
              "title": "Partnership",
              "price": "$75,000",
              "description": "4-month engagement",
              "bullets": [
                "4-month engagement",
                "Talent & event programming",
                "Partner management"
              ]
            },
            {
              "title": "Activation",
              "price": "$100,000",
              "description": "T&E, venue, tech, deco",
              "bullets": [
                "T&E, venue, tech, deco",
                "Speaker fees",
                "Reporting add-ons"
              ]
            },
            {
              "title": "Refresh Your Plays",
              "price": "$100,000",
              "description": "Talent + video production",
              "bullets": [
                "Talent + video production",
                "A8 network media",
                "4M+ impressions est."
              ]
            }
          ]
        }
      },
      {
        "type": "Contact",
        "variant": "info",
        "enabled": true,
        "props": {
          "title": "Thank You",
          "company": "Hive Gaming",
          "contactName": "Steve Buzby",
          "contactTitle": "Founder | Chief Disruption Officer",
          "contactEmail": "steve@hivegaming.org",
          "assets": [
            {
              "label": "Download one-pager (PDF)",
              "url": "#"
            },
            {
              "label": "Brand kit",
              "url": "#"
            },
            {
              "label": "Schedule (CSV)",
              "url": "#"
            }
          ]
        }
      }
    ]
  }',
  false
) ON CONFLICT (tenant_id, slug, is_draft) DO UPDATE SET 
  data = EXCLUDED.data,
  updated_at = now();

-- ========================================
-- 8. INSERT USERS AND USER-ORGANIZATION RELATIONSHIPS
-- ========================================

-- Insert test user (eric)
INSERT INTO users (id, email, password_hash, name, is_active) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'eric@example.com',
  '$2a$12$C7BzDmMwHqWHGgYcUGfT6OSuRpqqN3znUtMMbXCpBB3QFsUGho8VS',
  'Eric',
  true
) ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Add user to Hive Gaming organization as owner
INSERT INTO user_organizations (user_id, org_id, role) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Kj8mN2pQ',
  'owner'
) ON CONFLICT (user_id, org_id) DO UPDATE SET 
  role = EXCLUDED.role;

-- ========================================
-- 9. VERIFICATION QUERIES
-- ========================================

-- Display summary of what was created
SELECT 'ORGANIZATIONS' as table_name, COUNT(*) as count FROM organizations
UNION ALL
SELECT 'TENANTS' as table_name, COUNT(*) as count FROM tenants
UNION ALL
SELECT 'USERS' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'USER_ORGANIZATIONS' as table_name, COUNT(*) as count FROM user_organizations
UNION ALL
SELECT 'TENANT_PROFILES' as table_name, COUNT(*) as count FROM tenant_profiles
UNION ALL  
SELECT 'TENANT_REFERENCES' as table_name, COUNT(*) as count FROM tenant_references
UNION ALL
SELECT 'PROPOSAL_LAYOUTS' as table_name, COUNT(*) as count FROM proposal_layouts
UNION ALL
SELECT 'PROPOSAL_CONTENT' as table_name, COUNT(*) as count FROM proposal_content;
