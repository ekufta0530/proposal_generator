import React from 'react';

// Common button styles
export const buttonStyles = {
  primary: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  secondary: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  success: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  danger: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  disabled: {
    backgroundColor: '#9ca3af',
    color: '#6b7280',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'not-allowed',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  }
};

// Input styles
export const inputStyles = {
  text: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    backgroundColor: 'white'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    backgroundColor: 'white',
    fontFamily: 'inherit',
    resize: 'vertical'
  }
};

// Card styles
export const cardStyles = {
  container: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.2s ease'
  },
  header: {
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '16px',
    marginBottom: '16px'
  }
};

// Status message styles
export const statusStyles = {
  success: {
    padding: '12px 16px',
    backgroundColor: '#d1fae5',
    border: '1px solid #10b981',
    borderRadius: '8px',
    color: '#065f46',
    fontSize: '14px'
  },
  error: {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#991b1b',
    fontSize: '14px'
  },
  warning: {
    padding: '12px 16px',
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    color: '#92400e',
    fontSize: '14px'
  },
  info: {
    padding: '12px 16px',
    backgroundColor: '#dbeafe',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    color: '#1e40af',
    fontSize: '14px'
  }
};

// Button component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'disabled';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
}

export function Button({ 
  variant = 'primary', 
  children, 
  onClick, 
  disabled = false,
  type = 'button',
  style = {}
}: ButtonProps) {
  const baseStyle = disabled ? buttonStyles.disabled : buttonStyles[variant];
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...style }}
    >
      {children}
    </button>
  );
}

// Input component
interface InputProps {
  type?: 'text' | 'email' | 'url' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  style?: React.CSSProperties;
}

export function Input({ 
  type = 'text',
  value, 
  onChange, 
  placeholder, 
  label,
  required = false,
  style = {}
}: InputProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '6px', 
          fontWeight: '500',
          color: '#374151',
          fontSize: '14px'
        }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{ ...inputStyles.text, ...style }}
      />
    </div>
  );
}

// Select component
interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  label?: string;
  required?: boolean;
  style?: React.CSSProperties;
}

export function Select({ 
  value, 
  onChange, 
  options, 
  placeholder,
  label,
  required = false,
  style = {}
}: SelectProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '6px', 
          fontWeight: '500',
          color: '#374151',
          fontSize: '14px'
        }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{ ...inputStyles.select, ...style }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Textarea component
interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
  required?: boolean;
  style?: React.CSSProperties;
}

export function Textarea({ 
  value, 
  onChange, 
  placeholder, 
  label,
  rows = 4,
  required = false,
  style = {}
}: TextareaProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '6px', 
          fontWeight: '500',
          color: '#374151',
          fontSize: '14px'
        }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        style={{ ...inputStyles.textarea, ...style }}
      />
    </div>
  );
}

// Card component
interface CardProps {
  children: React.ReactNode;
  title?: string;
  style?: React.CSSProperties;
}

export function Card({ children, title, style = {} }: CardProps) {
  return (
    <div style={{ ...cardStyles.container, ...style }}>
      {title && (
        <div style={cardStyles.header}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#1f2937'
          }}>
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
}

// Status message component
interface StatusMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function StatusMessage({ type, children, style = {} }: StatusMessageProps) {
  return (
    <div style={{ ...statusStyles[type], ...style }}>
      {children}
    </div>
  );
}
