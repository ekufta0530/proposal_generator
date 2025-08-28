-- Complete Seed File for Proposals Platform
-- This file sets up the A8 Esports tenant

-- ========================================
-- 1. INSERT TENANTS
-- ========================================

-- Insert A8 Esports tenant
INSERT INTO tenants (id, name) VALUES ('a8-esports', 'A8 Esports') 
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 2. INSERT TENANT PROFILES
-- ========================================

-- A8 Esports Profile
INSERT INTO tenant_profiles (tenant_id, data) VALUES (
  'a8-esports',
  '{
    "branding": {
      "name": "A8 Esports",
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
-- 3. INSERT TENANT REFERENCES
-- ========================================

-- A8 Esports References
INSERT INTO tenant_references (tenant_id, data) VALUES (
  'a8-esports',
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
-- 4. INSERT PROPOSAL LAYOUTS
-- ========================================

-- A8 Esports Layout
INSERT INTO proposal_layouts (tenant_id, data) VALUES (
  'a8-esports',
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
-- 5. INSERT PROPOSAL CONTENT
-- ========================================

-- A8 Esports Sample Proposal (Live)
INSERT INTO proposal_content (tenant_id, slug, data, is_draft) VALUES (
  'a8-esports',
  'refresh-europe',
  '{
    "Hero": {
      "eyebrow": "Presented by Coca-Cola & A8 Esports",
      "title": "Refresh: Europe — Content Creator Acceler8tor",
      "subtitle": "Empowering new voices in esports to build authentic brand love.",
      "backgroundImage": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop"
    },
    "Overview": {
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
    },
    "Objectives": {
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
    },
    "Campaign": {
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
    },
    "Activation": {
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
    },
    "Timeline": {
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
    },
    "Amplification": {
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
    },
    "Measurement": {
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
    },
    "Roles": {
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
    },
    "Budget": {
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
    },
    "Contact": {
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
    },
    "CustomerStories": {
      "useCollection": "default"
    }
  }',
  false
) ON CONFLICT (tenant_id, slug, is_draft) DO UPDATE SET 
  data = EXCLUDED.data,
  updated_at = now();

-- ========================================
-- 6. VERIFICATION QUERIES
-- ========================================

-- Display summary of what was created
SELECT 'TENANTS' as table_name, COUNT(*) as count FROM tenants
UNION ALL
SELECT 'TENANT_PROFILES' as table_name, COUNT(*) as count FROM tenant_profiles
UNION ALL  
SELECT 'TENANT_REFERENCES' as table_name, COUNT(*) as count FROM tenant_references
UNION ALL
SELECT 'PROPOSAL_LAYOUTS' as table_name, COUNT(*) as count FROM proposal_layouts
UNION ALL
SELECT 'PROPOSAL_CONTENT' as table_name, COUNT(*) as count FROM proposal_content;
