# Portal UI System

This document describes the standardized UI system for the proposals portal, including the layout, components, and styling guidelines.

## Overview

The portal now features a consistent, modern UI with:
- **Navigation Bar**: Sticky navigation with logo and menu items
- **Shared Layout**: Consistent page structure and spacing
- **Component Library**: Reusable UI components with consistent styling
- **Responsive Design**: Works well on different screen sizes

## Layout System

### PortalLayout Component

The `PortalLayout` component provides the base structure for all portal pages:

```tsx
<PortalLayout title="Page Title">
  {/* Page content */}
</PortalLayout>
```

**Features:**
- Sticky navigation bar with logo and menu
- Consistent page header with title and accent line
- Responsive container with max-width
- Light gray background for visual separation

### Navigation Bar

The navigation bar includes:
- **Logo**: "P" icon with "Proposals Portal" text
- **Menu Items**: Links to different portal pages
- **Active State**: Current page is highlighted
- **Back to Site**: Link to return to main site

**Current Menu Items:**
- 📝 Create Proposal (`/portal`)
- 📋 View Proposals (`/proposals`)

## Component Library

### Button Component

Consistent button styling with multiple variants:

```tsx
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

**Variants:**
- `primary` - Blue background (default)
- `secondary` - Gray background with border
- `success` - Green background
- `danger` - Red background
- `disabled` - Gray background, disabled state

### Input Component

Styled input fields with labels and validation:

```tsx
<Input
  label="Email Address"
  value={email}
  onChange={setEmail}
  placeholder="Enter your email"
  required={true}
/>
```

**Features:**
- Consistent styling and spacing
- Optional labels with required indicators
- Placeholder text support
- Multiple input types (text, email, url, number)

### Select Component

Dropdown select with options:

```tsx
<Select
  label="Choose Option"
  value={selected}
  onChange={setSelected}
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
/>
```

### Textarea Component

Multi-line text input:

```tsx
<Textarea
  label="Description"
  value={description}
  onChange={setDescription}
  rows={4}
  placeholder="Enter description..."
/>
```

### Card Component

Container for grouping related content:

```tsx
<Card title="Section Title">
  <p>Card content goes here</p>
</Card>
```

**Features:**
- White background with subtle shadow
- Optional title with header styling
- Consistent padding and border radius
- Hover effects for interactivity

### StatusMessage Component

Display status messages with different types:

```tsx
<StatusMessage type="success">
  Operation completed successfully!
</StatusMessage>
```

**Types:**
- `success` - Green background
- `error` - Red background
- `warning` - Yellow background
- `info` - Blue background

## Styling Guidelines

### Color Palette

**Primary Colors:**
- Primary Blue: `#3b82f6`
- Success Green: `#10b981`
- Danger Red: `#ef4444`
- Warning Yellow: `#f59e0b`

**Neutral Colors:**
- Text Primary: `#1f2937`
- Text Secondary: `#6b7280`
- Border: `#e5e7eb`
- Background: `#f8fafc`

### Typography

**Font Stack:**
```css
font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
```

**Font Sizes:**
- Page Title: `32px` (700 weight)
- Card Title: `18px` (600 weight)
- Body Text: `14px` (400 weight)
- Small Text: `12px` (500 weight)

### Spacing

**Consistent Spacing Scale:**
- Extra Small: `4px`
- Small: `8px`
- Medium: `12px`
- Large: `16px`
- Extra Large: `20px`
- 2XL: `24px`
- 3XL: `32px`

### Border Radius

**Consistent Border Radius:**
- Small: `4px`
- Medium: `6px`
- Large: `8px`
- Extra Large: `12px`

## Page Structure

### Standard Page Layout

```tsx
<PortalLayout title="Page Title">
  {/* Filters/Configuration */}
  <Card title="Configuration">
    {/* Form controls */}
  </Card>

  {/* Status Messages */}
  {status && (
    <StatusMessage type="success">
      {status}
    </StatusMessage>
  )}

  {/* Main Content */}
  <Card title="Content">
    {/* Page-specific content */}
  </Card>

  {/* Additional Sections */}
  <Card title="Additional Info">
    {/* Help text, guides, etc. */}
  </Card>
</PortalLayout>
```

## Responsive Design

### Breakpoints

The layout is responsive and adapts to different screen sizes:

- **Desktop**: Full layout with side-by-side elements
- **Tablet**: Stacked layout with adjusted spacing
- **Mobile**: Single column layout with full-width elements

### Grid System

Uses CSS Grid for flexible layouts:

```tsx
// Two-column layout
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
  <Input label="First Name" />
  <Input label="Last Name" />
</div>

// Responsive grid
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
  {/* Cards that wrap on smaller screens */}
</div>
```

## Accessibility

### Keyboard Navigation

All interactive elements support keyboard navigation:
- Tab order follows logical flow
- Focus indicators are visible
- Enter/Space keys work for buttons

### Screen Reader Support

- Semantic HTML elements
- Proper ARIA labels
- Descriptive alt text for images
- Status messages for dynamic content

### Color Contrast

All text meets WCAG AA contrast requirements:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum

## Usage Examples

### Create Proposal Page

```tsx
<PortalLayout title="Create Proposal">
  <Card title="Tenant Configuration">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Select label="Tenant" value={tenant} onChange={setTenant} options={tenants} />
      <Input label="Proposal Slug" value={slug} onChange={setSlug} />
    </div>
  </Card>

  <Card title="Actions">
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Button onClick={saveDraft}>💾 Save Draft</Button>
      <Button variant="success">👁️ Preview Draft</Button>
      <Button variant="success">🚀 Publish to Live</Button>
    </div>
  </Card>
</PortalLayout>
```

### View Proposals Page

```tsx
<PortalLayout title="View Proposals">
  <Card title="Filters">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px' }}>
      <Select label="Tenant" value={tenant} onChange={setTenant} options={tenants} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" id="showDrafts" checked={showDrafts} onChange={setShowDrafts} />
        <label htmlFor="showDrafts">Show drafts only</label>
      </div>
    </div>
  </Card>

  <Card title={`Proposals (${proposals.length})`}>
    {proposals.map(proposal => (
      <div key={proposal.slug} style={{ /* proposal card styling */ }}>
        <h3>{proposal.title}</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary">View</Button>
          <Button variant="primary">Edit</Button>
        </div>
      </div>
    ))}
  </Card>
</PortalLayout>
```

## Future Enhancements

### Planned Features

1. **Dark Mode**: Toggle between light and dark themes
2. **Custom Themes**: Tenant-specific color schemes
3. **Advanced Components**: Date pickers, file uploads, rich text editors
4. **Animations**: Smooth transitions and micro-interactions
5. **Mobile App**: Native mobile experience

### Component Extensions

1. **Data Tables**: Sortable, filterable data grids
2. **Modals**: Overlay dialogs for confirmations
3. **Tooltips**: Contextual help and information
4. **Progress Indicators**: Loading states and progress bars
5. **Breadcrumbs**: Navigation hierarchy

## Best Practices

### Component Usage

1. **Consistent Naming**: Use descriptive, consistent names for components
2. **Props Interface**: Define clear TypeScript interfaces for all props
3. **Default Values**: Provide sensible defaults for optional props
4. **Error Handling**: Include proper error states and validation

### Styling Guidelines

1. **Inline Styles**: Use inline styles for component-specific styling
2. **Consistent Spacing**: Follow the spacing scale consistently
3. **Color Usage**: Use the defined color palette
4. **Typography**: Follow the typography hierarchy

### Performance

1. **Component Optimization**: Use React.memo for expensive components
2. **Bundle Size**: Keep component library lightweight
3. **Lazy Loading**: Load components only when needed
4. **Caching**: Cache frequently used data and components
