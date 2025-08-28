import { z } from "zod";

/** Layout and sections */
export const SectionEntrySchema = z.object({
  type: z.string(),
  variant: z.string(),
  enabled: z.boolean().optional(),
  props: z.record(z.any()).optional()
});

export const LayoutSchema = z.object({
  sections: z.array(SectionEntrySchema)
});

/** Proposal content is section-keyed */
export const ProposalSchema = z.record(z.any());

/** Tenant profile (branding + defaults) */
export const ProfileSchema = z.object({
  templateVersion: z.string(),
  branding: z.object({
    name: z.string(),
    logoUrl: z.string().optional(),
    colors: z.object({
      primary: z.string(),
      secondary: z.string(),
      background: z.string(),
      text: z.string()
    })
  }),
  layoutDefaults: LayoutSchema.optional(),
  flags: z.record(z.boolean()).optional()
});

/** References library + named collections */
export const ReferenceItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  quote: z.string().optional(),
  logoUrl: z.string().optional(),
  metrics: z.array(z.object({ label: z.string(), before: z.string().optional(), after: z.string().optional() })).optional(),
  tags: z.array(z.string()).optional(),
  link: z.string().optional()
});

export const ReferencesSchema = z.object({
  templateVersion: z.string(),
  references: z.array(ReferenceItemSchema),
  collections: z.record(z.array(z.string())).optional()
});
