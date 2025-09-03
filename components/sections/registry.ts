/**
 * Registry maps 'type.variant' to lazy-loaded React components,
 * and exposes metadata for the Portal to generate fields.
 */
export const loaders: Record<string, Record<string, () => Promise<{ default: React.ComponentType<any> }>>> = {
  Hero: {
    simple: () => import("./variants/Hero.simple"),
    imageLeft: () => import("./variants/Hero.imageLeft"),
    backgroundImg: () => import("./variants/Hero.backgroundImg")
  },
  Problem: {
    concise: () => import("./variants/Problem.concise"),
    detailed: () => import("./variants/Problem.detailed")
  },
  CustomerStories: {
    list: () => import("./variants/CustomerStories.list")
  },
  Overview: {
    opportunity: () => import("./variants/Overview.opportunity")
  },
  Objectives: {
    strategy: () => import("./variants/Objectives.strategy")
  },
  Campaign: {
    overview: () => import("./variants/Campaign.overview")
  },
  Activation: {
    details: () => import("./variants/Activation.details")
  },
  Timeline: {
    steps: () => import("./variants/Timeline.steps")
  },
  Amplification: {
    content: () => import("./variants/Amplification.content")
  },
  Measurement: {
    success: () => import("./variants/Measurement.success")
  },
  Roles: {
    responsibilities: () => import("./variants/Roles.responsibilities")
  },
  Budget: {
    pricing: () => import("./variants/Budget.pricing")
  },
  Contact: {
    info: () => import("./variants/Contact.info")
  }
};

/** Metadata drives the portal's auto-generated forms */
export const metadata = {
  Hero: {
    id: "Hero",
    label: "Hero",
    variants: [
      {
        id: "simple", label: "Simple",
        fields: [
          { kind: "string", name: "title", label: "Title" },
          { kind: "string", name: "subtitle", label: "Subtitle" },
          { kind: "color",  name: "color", label: "Background" }
        ],
        defaults: { color: "{{branding.colors.primary}}" }
      },
      {
        id: "imageLeft", label: "Image Left",
        fields: [
          { kind: "string", name: "title", label: "Title" },
          { kind: "string", name: "subtitle", label: "Subtitle" },
          { kind: "color",  name: "color", label: "Background" }
        ],
        defaults: { color: "{{branding.colors.secondary}}" }
      },
      {
        id: "backgroundImg", label: "Background Image",
        fields: [
          { kind: "string", name: "eyebrow", label: "Eyebrow Text" },
          { kind: "string", name: "title", label: "Title" },
          { kind: "string", name: "subtitle", label: "Subtitle" },
          { kind: "string", name: "backgroundImage", label: "Background Image URL" },
          { kind: "string", name: "ctaText", label: "CTA Button Text" },
          { kind: "string", name: "ctaLink", label: "CTA Button Link" }
        ],
        defaults: { 
          eyebrow: "Eyebrow text goes here",
          title: "Hero title goes here",
          subtitle: "Hero subtitle goes here"
        }
      }
    ]
  },
  Problem: {
    id: "Problem",
    label: "Problem Statement",
    variants: [
      { id: "concise",  label: "Concise",  fields: [{ kind:"list", name:"bullets", label:"Bullets", of:"string" }] },
      { id: "detailed", label: "Detailed", fields: [{ kind:"list", name:"bullets", label:"Bullets", of:"string" }] }
    ]
  },
  CustomerStories: {
    id: "CustomerStories",
    label: "Customer Stories",
    variants: [
      { id: "list", label: "List", fields: [
        { kind:"list", name:"include", label:"Include IDs", of:"string" },
        { kind:"list", name:"exclude", label:"Exclude IDs", of:"string" },
        { kind:"string", name:"useCollection", label:"Use collection" }
      ]}
    ]
  },
  Overview: {
    id: "Overview",
    label: "Overview",
    variants: [
      { id: "opportunity", label: "Opportunity", fields: [
        { kind: "string", name: "title", label: "Title" },
        { kind: "string", name: "description", label: "Description" },
        { kind: "list", name: "kpis", label: "KPIs", of: "object" },
        { kind: "string", name: "imageUrl", label: "Image URL" },
        { kind: "string", name: "imageAlt", label: "Image Alt Text" }
      ]}
    ]
  },
  Objectives: {
    id: "Objectives",
    label: "Objectives",
    variants: [
      { id: "strategy", label: "Strategy", fields: [
        { kind: "string", name: "title", label: "Title" },
        { kind: "string", name: "subtitle", label: "Subtitle" },
        { kind: "list", name: "objectives", label: "Objectives", of: "object" }
      ]}
    ]
  },
  Campaign: {
    id: "Campaign",
    label: "Campaign",
    variants: [
      { id: "overview", label: "Overview", fields: [
        { kind: "string", name: "activateTitle", label: "Activate Title" },
        { kind: "string", name: "activateDescription", label: "Activate Description" },
        { kind: "list", name: "activateBullets", label: "Activate Bullets", of: "string" },
        { kind: "string", name: "activateLink", label: "Activate Link" },
        { kind: "string", name: "amplifyTitle", label: "Amplify Title" },
        { kind: "string", name: "amplifyDescription", label: "Amplify Description" },
        { kind: "list", name: "amplifyBullets", label: "Amplify Bullets", of: "string" },
        { kind: "string", name: "amplifyLink", label: "Amplify Link" }
      ]}
    ]
  },
  Activation: {
    id: "Activation",
    label: "Activation",
    variants: [
      { id: "details", label: "Details", fields: [
        { kind: "string", name: "title", label: "Title" },
        { kind: "list", name: "details", label: "Details", of: "object" },
        { kind: "list", name: "themes", label: "Conference Themes", of: "object" }
      ]}
    ]
  },
  Timeline: {
    id: "Timeline",
    label: "Timeline",
    variants: [
      { id: "steps", label: "Steps", fields: [
        { kind: "string", name: "title", label: "Title" },
        { kind: "list", name: "steps", label: "Steps", of: "object" }
      ]}
    ]
  },
  Amplification: {
    id: "Amplification",
    label: "Amplification",
    variants: [
      { id: "content", label: "Content", fields: [
        { kind: "string", name: "leftTitle", label: "Left Title" },
        { kind: "string", name: "leftDescription", label: "Left Description" },
        { kind: "string", name: "leftNote", label: "Left Note" },
        { kind: "string", name: "rightTitle", label: "Right Title" },
        { kind: "string", name: "rightDescription", label: "Right Description" },
        { kind: "list", name: "rightBullets", label: "Right Bullets", of: "string" }
      ]}
    ]
  },
  Measurement: {
    id: "Measurement",
    label: "Measurement",
    variants: [
      { id: "success", label: "Success", fields: [
        { kind: "string", name: "leftTitle", label: "Left Title" },
        { kind: "list", name: "leftBullets", label: "Left Bullets", of: "string" },
        { kind: "string", name: "rightTitle", label: "Right Title" },
        { kind: "list", name: "rightBullets", label: "Right Bullets", of: "string" }
      ]}
    ]
  },
  Roles: {
    id: "Roles",
    label: "Roles",
    variants: [
      { id: "responsibilities", label: "Responsibilities", fields: [
        { kind: "string", name: "leftTitle", label: "Left Title" },
        { kind: "list", name: "leftBullets", label: "Left Bullets", of: "string" },
        { kind: "string", name: "rightTitle", label: "Right Title" },
        { kind: "list", name: "rightBullets", label: "Right Bullets", of: "string" }
      ]}
    ]
  },
  Budget: {
    id: "Budget",
    label: "Budget",
    variants: [
      { id: "pricing", label: "Pricing", fields: [
        { kind: "string", name: "title", label: "Title" },
        { kind: "list", name: "tiers", label: "Pricing Tiers", of: "object" }
      ]}
    ]
  },
  Contact: {
    id: "Contact",
    label: "Contact",
    variants: [
      { id: "info", label: "Info", fields: [
        { kind: "string", name: "title", label: "Title" },
        { kind: "string", name: "company", label: "Company" },
        { kind: "string", name: "contactName", label: "Contact Name" },
        { kind: "string", name: "contactTitle", label: "Contact Title" },
        { kind: "string", name: "contactEmail", label: "Contact Email" },
        { kind: "list", name: "assets", label: "Assets", of: "object" }
      ]}
    ]
  }
} as const;
