# Enhanced Form Features

This document explains the enhanced form capabilities in the proposal portal, including support for nested objects, arrays, and pre-populated fields when editing existing proposals.

## Overview

The portal now includes advanced form handling that supports:
- **Complex Field Types**: Nested objects, arrays, and mixed data structures
- **Pre-populated Forms**: When editing existing proposals, fields are automatically filled with current data
- **Smart Object Handling**: Automatic detection and rendering of common object patterns
- **Image URL Support**: Direct URL input for images instead of file uploads

## Form Field Types

### 1. String Fields
Simple text input fields for titles, descriptions, and other text content.

```typescript
{ kind: "string", name: "title", label: "Title" }
```

### 2. Color Fields
Color picker with both visual selector and hex input.

```typescript
{ kind: "color", name: "color", label: "Background Color" }
```

### 3. List Fields (String Arrays)
Multi-line text areas where each line becomes an array item.

```typescript
{ kind: "list", name: "bullets", label: "Bullet Points", of: "string" }
```

### 4. List Fields (Object Arrays)
Expandable sections for complex object arrays with individual field editing.

```typescript
{ kind: "list", name: "objectives", label: "Objectives", of: "object" }
```

## Object Array Handling

### Automatic Field Detection
The form automatically detects and renders common object patterns:

- **KPIs/Metrics**: `{ label: "", value: "" }`
- **Objectives/Goals**: `{ title: "", description: "" }`
- **Details/Info**: `{ label: "", value: "" }`
- **Steps/Phases**: `{ title: "", description: "" }`
- **Themes/Topics**: `{ title: "", items: [] }`
- **Tiers/Packages**: `{ title: "", price: "", description: "", bullets: [] }`
- **Assets/Resources**: `{ label: "", url: "" }`

### Interactive Object Editing
- **Expandable Sections**: Click to expand/collapse object arrays
- **Individual Item Editing**: Each object gets its own form fields
- **Add/Remove Items**: Dynamic addition and removal of array items
- **Smart Defaults**: New items are created with appropriate default structure

## Pre-populated Forms

### Loading Existing Data
When editing a proposal (via URL parameters), the form automatically:

1. **Checks localStorage** for draft versions first
2. **Loads from database** if no draft exists
3. **Populates all fields** with current values
4. **Shows loading state** during data retrieval

### URL Parameters
```
/portal?tenant=coca-cola&slug=refresh-europe
```

### Data Flow
1. **URL Detection**: Checks for `slug` parameter
2. **Draft Priority**: Loads from localStorage if available
3. **Database Fallback**: Fetches from database if no draft
4. **State Updates**: Updates sections and proposal data
5. **Form Population**: All fields are pre-filled

## Enhanced User Experience

### Loading States
- **Profile Loading**: Shows "Loading profile..." when fetching tenant data
- **Proposal Loading**: Shows "Loading proposal data..." when fetching proposal
- **Publishing**: Shows "Publishing..." during save operations

### Form Validation
- **Required Fields**: Visual indicators for required content
- **Data Types**: Proper input types (text, color, URL, etc.)
- **Array Handling**: Automatic conversion between text and arrays

### Smart Defaults
- **New Objects**: Automatically structured based on field type
- **Empty Arrays**: Initialize with appropriate object structure
- **Missing Data**: Graceful handling of undefined/null values

## Example Usage

### Creating a New Proposal
1. Select tenant from dropdown
2. Enter proposal slug
3. Add sections using the "+ Add section" button
4. Fill in form fields (strings, colors, lists, objects)
5. Save draft or publish to live

### Editing an Existing Proposal
1. Navigate to `/portal?tenant=<tenant>&slug=<slug>`
2. Form automatically loads with current data
3. Make changes to any fields
4. Save draft or publish updates

### Working with Object Arrays
1. **Expand Section**: Click the "▶ X items" button
2. **Edit Items**: Modify individual object fields
3. **Add Items**: Click "+ Add [Item Type]" button
4. **Remove Items**: Click "Remove" button on any item
5. **Collapse**: Click "▼ X items" to hide the section

## Technical Implementation

### FormField Component
Located at `components/FormField.tsx`, this component handles:

- **Field Type Detection**: Routes to appropriate input type
- **Value Management**: Handles complex data structures
- **Change Handling**: Updates parent state correctly
- **UI Rendering**: Consistent styling and layout

### Portal Integration
The portal (`app/portal/page.tsx`) includes:

- **Data Loading**: useEffect hooks for proposal loading
- **State Management**: Proposal and sections state
- **Form Rendering**: Maps sections to FormField components
- **Save/Publish**: Handles draft and live publishing

### API Endpoints
- **`/api/proposal`**: Loads existing proposal data
- **`/api/sections`**: Saves proposal data
- **`/api/tenants`**: Loads tenant information

## Best Practices

### Form Design
1. **Use Descriptive Labels**: Clear, user-friendly field names
2. **Group Related Fields**: Logical organization of form sections
3. **Provide Defaults**: Sensible default values for new items
4. **Handle Edge Cases**: Graceful handling of missing or malformed data

### Data Structure
1. **Consistent Naming**: Use consistent field names across components
2. **Type Safety**: Define proper TypeScript interfaces
3. **Validation**: Validate data before saving
4. **Error Handling**: Provide clear error messages

### User Experience
1. **Loading States**: Show progress during data operations
2. **Auto-save**: Consider auto-saving drafts
3. **Keyboard Navigation**: Support keyboard shortcuts
4. **Mobile Responsive**: Ensure forms work on mobile devices

## Future Enhancements

### Planned Features
- **Rich Text Editor**: WYSIWYG editing for content fields
- **Image Upload**: Direct file upload with preview
- **Form Validation**: Real-time validation with error messages
- **Auto-complete**: Smart suggestions for common values
- **Bulk Operations**: Select and edit multiple items at once

### Advanced Features
- **Conditional Fields**: Show/hide fields based on other values
- **Field Dependencies**: Auto-populate fields based on selections
- **Template System**: Pre-built templates for common proposal types
- **Version History**: Track changes and allow rollbacks
