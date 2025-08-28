# Draft/Publish Workflow

The proposal platform supports a flexible draft and publish workflow that allows users to work on proposals locally and then publish them for public access.

## Overview

The workflow consists of two main phases:

1. **Draft phase** - Work on proposals locally with immediate preview
2. **Publish phase** - Save to database for live access

## Architecture

### Data Storage

- **Drafts** - Stored in browser localStorage for immediate access
- **Published content** - Stored in PostgreSQL database for live access
- **Tenant profiles** - Stored in database with draft/live separation

### Workflow States

```
Draft (localStorage) ──> Preview ──> Publish ──> Live (Database)
```

## Portal Interface

### Available Actions

The portal provides four main actions:

1. **💾 Save Draft** (Blue) - Save to localStorage
2. **👁️ Preview Draft** (Green) - Open draft preview
3. **🚀 Publish to Live** (Dark Green) - Publish to database
4. **🌐 View Live** (Purple) - Open published version

### Button States

- **Save Draft** - Always available, saves to localStorage
- **Preview Draft** - Available when draft exists in localStorage
- **Publish to Live** - Available when draft exists, publishes to database
- **View Live** - Available when published version exists

## Data Flow

### Save Draft

1. **User clicks "Save Draft"**
2. **Data collected** from portal form
3. **Saved to localStorage** with tenant/slug key
4. **Success message** displayed to user

```javascript
// Save draft to localStorage
localStorage.setItem(`layoutOverride:${tenant}:${slug}`, JSON.stringify(sections));
localStorage.setItem(`proposal:${tenant}:${slug}`, JSON.stringify(proposal));
```

### Preview Draft

1. **User clicks "Preview Draft"**
2. **Opens new tab** with draft preview URL
3. **Loads data** from localStorage
4. **Falls back** to seed data if localStorage is empty
5. **Renders proposal** with draft content

### Publish to Live

1. **User clicks "Publish to Live"**
2. **Data collected** from portal form
3. **API call** to `/api/sections` with `isDraft: false`
4. **Saved to database** in live tables
5. **localStorage cleared** after successful publish
6. **Success message** displayed

```javascript
// Publish to database
const response = await fetch('/api/sections', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tenant,
    layout: { sections },
    proposal: { slug, ...proposal, profile, references },
    isDraft: false
  })
});
```

### View Live

1. **User clicks "View Live"**
2. **Opens new tab** with live proposal URL
3. **Loads data** from database only
4. **Renders proposal** with published content

## Database Schema

### Draft vs Live Separation

Each table supports draft/live separation with `is_draft` boolean:

```sql
-- Draft data
tenant_profiles (tenant_id, data, is_draft=true)
tenant_references (tenant_id, data, is_draft=true)
proposal_layouts (tenant_id, data, is_draft=true)
proposal_content (tenant_id, slug, data, is_draft=true)

-- Live data
tenant_profiles (tenant_id, data, is_draft=false)
tenant_references (tenant_id, data, is_draft=false)
proposal_layouts (tenant_id, data, is_draft=false)
proposal_content (tenant_id, slug, data, is_draft=false)
```

### Data Structure

When publishing, the system saves:

- **Layout** - Section configuration and styling
- **Proposal content** - Actual proposal data
- **Profile** - Tenant branding and defaults
- **References** - Customer stories and testimonials

## API Endpoints

### `/api/sections`

**POST** - Save proposal data to database

```json
{
  "tenant": "acme",
  "layout": {
    "sections": [
      {
        "type": "Hero",
        "variant": "imageLeft",
        "props": { "color": "#10b981" }
      }
    ]
  },
  "proposal": {
    "slug": "yeti",
    "Hero": { "title": "Proposal Title" },
    "Problem": { "bullets": ["One", "Two", "Three"] },
    "profile": { "branding": { ... } },
    "references": { "templateVersion": "1.0.0", "references": [] }
  },
  "isDraft": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully saved 4 items to database",
  "results": [
    { "type": "layout", "id": "uuid" },
    { "type": "proposal", "slug": "yeti", "id": "uuid" },
    { "type": "profile", "id": "uuid" },
    { "type": "references", "id": "uuid" }
  ],
  "isDraft": false
}
```

## Rendering Pipeline

### Draft Preview (`/proposal/[slug]?draft=1`)

1. **Database** - Try to load draft data from database
2. **localStorage** - Load draft content from browser storage
3. **Seed fallback** - Use local seed files for development
4. **Rendering** - Compose and render with tenant branding

### Live Proposal (`/proposal/[slug]`)

1. **Database** - Load live data from database only
2. **Tenant detection** - Automatically find which tenant published the proposal
3. **Data validation** - Ensure all required data is present
4. **Rendering** - Compose and render with tenant branding

## Benefits

### Development Workflow

- **Immediate feedback** - Save and preview instantly
- **No network dependency** - Drafts work offline
- **Fast iteration** - No database round-trips for drafts
- **Safe experimentation** - Drafts don't affect live content

### Production Workflow

- **Data integrity** - Database transactions ensure consistency
- **Public access** - Live proposals are publicly accessible
- **Version control** - Database maintains history
- **Scalability** - PostgreSQL handles complex queries efficiently

### User Experience

- **Clear workflow** - Intuitive save/preview/publish cycle
- **Visual feedback** - Status messages and button states
- **Error handling** - Graceful fallbacks and error messages
- **Performance** - Fast local storage for drafts

## Error Handling

### Common Scenarios

1. **Draft not found** - Falls back to seed data
2. **Publish failure** - Shows error message, keeps draft
3. **Database error** - Retry mechanism with user feedback
4. **Validation error** - Shows specific field errors

### Recovery

- **Draft recovery** - Drafts remain in localStorage
- **Publish retry** - Can retry failed publishes
- **Data validation** - Prevents invalid data from being saved
- **Graceful degradation** - System continues working with partial data

## Future Enhancements

1. **Auto-save** - Automatic draft saving
2. **Version history** - Track changes over time
3. **Collaboration** - Multi-user draft editing
4. **Publishing workflow** - Approval processes
5. **Rollback** - Revert to previous versions
