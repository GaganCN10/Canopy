import React, { useState, useId } from 'react';

const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  autoComplete,
  icon: Icon,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const hasValue = value && value.length > 0;
  const showFloatingLabel = focused || hasValue;

  return (
    <div className="mb-5">
      <div className="relative">
        {Icon && (
          <Icon
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
              focused ? 'text-canopy-forest-600' : 'text-canopy-ink-900/30'
            }`}
          />
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onFocus={() => setFocused(true)}
          autoComplete={autoComplete}
          className={`w-full bg-transparent border-0 border-b-2 ${
            error
              ? 'border-canopy-clay-500'
              : focused
                ? 'border-canopy-forest-600'
                : 'border-canopy-mist-200'
          } pb-3 pt-6 text-canopy-ink-900 placeholder-transparent transition-colors duration-200 outline-none ${
            Icon ? 'pl-10' : 'pl-0'
          }`}
          placeholder={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />

        <label
          htmlFor={id}
          className={`absolute left-0 transition-all duration-200 pointer-events-none ${
            Icon ? 'pl-10' : 'pl-0'
          } ${
            showFloatingLabel
              ? 'top-2 text-[11px] tracking-widest uppercase text-canopy-forest-600'
              : 'top-5 text-base text-canopy-ink-900/40'
          }`}
        >
          {label}
          {required && <span className="text-canopy-clay-500 ml-1">*</span>}
        </label>
      </div>

      {error && (
        <motion.p
          id={`${id}-error`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-canopy-clay-500 flex items-center gap-1.5"
          role="alert"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </motion.p>
      )}

      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-xs text-canopy-ink-900/40">
          {hint}
        </p>
      )}
    </div>
  );
};

export default InputField;
