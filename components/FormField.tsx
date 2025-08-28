'use client';

import { useState } from 'react';

interface Field {
  kind: string;
  name: string;
  label: string;
  of?: string;
}

interface FormFieldProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
  sectionType: string;
  fieldPath: string;
}

export default function FormField({ field, value, onChange, sectionType, fieldPath }: FormFieldProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle different field types
  switch (field.kind) {
    case 'string':
      return (
        <label style={{ display: 'block', marginBottom: '8px' }}>
          <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            {field.label}:
          </span>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        </label>
      );

    case 'color':
      return (
        <label style={{ display: 'block', marginBottom: '8px' }}>
          <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            {field.label}:
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              style={{ width: '50px', height: '40px', border: 'none', borderRadius: '4px' }}
            />
            <input
              type="text"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
              placeholder="#000000"
            />
          </div>
        </label>
      );

    case 'list':
      if (field.of === 'string') {
        return (
          <label style={{ display: 'block', marginBottom: '8px' }}>
            <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              {field.label} (one per line):
            </span>
            <textarea
              value={Array.isArray(value) ? value.join('\n') : ''}
              onChange={(e) => onChange(e.target.value.split('\n').filter(Boolean))}
              rows={4}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
              placeholder={`Enter ${field.label.toLowerCase()}, one per line`}
            />
          </label>
        );
      }

      if (field.of === 'object') {
        const items = Array.isArray(value) ? value : [];
        
        return (
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: '500' }}>{field.label}:</span>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#6b7280'
                }}
              >
                {isExpanded ? '▼' : '▶'} {items.length} items
              </button>
            </div>
            
            {isExpanded && (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px', backgroundColor: '#f9fafb' }}>
                {items.map((item, index) => (
                  <div key={index} style={{ marginBottom: '12px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong>Item {index + 1}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = items.filter((_, i) => i !== index);
                          onChange(newItems);
                        }}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    
                    {/* Render object fields based on the first item's structure or common patterns */}
                    {renderObjectFields(item, (newItem) => {
                      const newItems = [...items];
                      newItems[index] = newItem;
                      onChange(newItems);
                    })}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    const newItem = createDefaultObject(field.label);
                    onChange([...items, newItem]);
                  }}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  + Add {field.label.slice(0, -1)}
                </button>
              </div>
            )}
          </div>
        );
      }

      return (
        <label style={{ display: 'block', marginBottom: '8px' }}>
          <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            {field.label}:
          </span>
          <textarea
            value={Array.isArray(value) ? value.join('\n') : ''}
            onChange={(e) => onChange(e.target.value.split('\n').filter(Boolean))}
            rows={4}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
            placeholder={`Enter ${field.label.toLowerCase()}, one per line`}
          />
        </label>
      );

    default:
      return (
        <label style={{ display: 'block', marginBottom: '8px' }}>
          <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            {field.label} (unsupported type: {field.kind}):
          </span>
          <input
            type="text"
            value={JSON.stringify(value) || ''}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                onChange(e.target.value);
              }
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </label>
      );
  }
}

// Helper function to render object fields based on common patterns
function renderObjectFields(item: any, onChange: (value: any) => void) {
  const fields = [];
  
  // Common field patterns based on the field name
  if (item.title !== undefined) {
    fields.push(
      <label key="title" style={{ display: 'block', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Title:</span>
        <input
          type="text"
          value={item.title || ''}
          onChange={(e) => onChange({ ...item, title: e.target.value })}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        />
      </label>
    );
  }
  
  if (item.description !== undefined) {
    fields.push(
      <label key="description" style={{ display: 'block', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Description:</span>
        <textarea
          value={item.description || ''}
          onChange={(e) => onChange({ ...item, description: e.target.value })}
          rows={2}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        />
      </label>
    );
  }
  
  if (item.label !== undefined) {
    fields.push(
      <label key="label" style={{ display: 'block', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Label:</span>
        <input
          type="text"
          value={item.label || ''}
          onChange={(e) => onChange({ ...item, label: e.target.value })}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        />
      </label>
    );
  }
  
  if (item.value !== undefined) {
    fields.push(
      <label key="value" style={{ display: 'block', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Value:</span>
        <input
          type="text"
          value={item.value || ''}
          onChange={(e) => onChange({ ...item, value: e.target.value })}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        />
      </label>
    );
  }
  
  if (item.price !== undefined) {
    fields.push(
      <label key="price" style={{ display: 'block', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Price:</span>
        <input
          type="text"
          value={item.price || ''}
          onChange={(e) => onChange({ ...item, price: e.target.value })}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        />
      </label>
    );
  }
  
  if (item.bullets !== undefined) {
    fields.push(
      <label key="bullets" style={{ display: 'block', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Bullets (one per line):</span>
        <textarea
          value={Array.isArray(item.bullets) ? item.bullets.join('\n') : ''}
          onChange={(e) => onChange({ ...item, bullets: e.target.value.split('\n').filter(Boolean) })}
          rows={2}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        />
      </label>
    );
  }
  
  if (item.items !== undefined) {
    fields.push(
      <label key="items" style={{ display: 'block', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Items (one per line):</span>
        <textarea
          value={Array.isArray(item.items) ? item.items.join('\n') : ''}
          onChange={(e) => onChange({ ...item, items: e.target.value.split('\n').filter(Boolean) })}
          rows={2}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        />
      </label>
    );
  }
  
  if (item.url !== undefined) {
    fields.push(
      <label key="url" style={{ display: 'block', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>URL:</span>
        <input
          type="url"
          value={item.url || ''}
          onChange={(e) => onChange({ ...item, url: e.target.value })}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        />
      </label>
    );
  }
  
  // If no common fields found, show a JSON editor
  if (fields.length === 0) {
    fields.push(
      <label key="json" style={{ display: 'block', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>JSON:</span>
        <textarea
          value={JSON.stringify(item, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              // Keep the text as-is if it's not valid JSON
            }
          }}
          rows={3}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}
        />
      </label>
    );
  }
  
  return <div>{fields}</div>;
}

// Helper function to create default objects based on field type
function createDefaultObject(fieldLabel: string): any {
  const label = fieldLabel.toLowerCase();
  
  if (label.includes('kpi') || label.includes('metric')) {
    return { label: '', value: '' };
  }
  
  if (label.includes('objective') || label.includes('goal')) {
    return { title: '', description: '' };
  }
  
  if (label.includes('detail') || label.includes('info')) {
    return { title: '', description: '' };
  }
  
  if (label.includes('step') || label.includes('phase')) {
    return { title: '', description: '' };
  }
  
  if (label.includes('theme') || label.includes('topic')) {
    return { title: '', items: [] };
  }
  
  if (label.includes('detail') || label.includes('info')) {
    return { label: '', value: '' };
  }
  
  if (label.includes('tier') || label.includes('package')) {
    return { title: '', price: '', description: '', bullets: [] };
  }
  
  if (label.includes('asset') || label.includes('resource')) {
    return { label: '', url: '' };
  }
  
  // Default fallback
  return { title: '', description: '' };
}
