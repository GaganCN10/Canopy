import React from 'react';

const LeafFill = ({ filled }) => (
  <svg viewBox="0 0 24 24" className={`w-5 h-5 transition-all duration-300 ${filled ? 'text-canopy-forest-600 scale-110' : 'text-canopy-mist-200'}`}>
    <path
      d="M12 3c-4.97 4.97-7 9-7 12a7 7 0 1 0 14 0c0-3-2.03-7.03-7-12z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M12 21v-9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 12c1.5-1.5 3-2 3-2s1.5.5 3 2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const PasswordStrengthMeter = ({ password }) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  const labels = ['Length', 'Uppercase', 'Lowercase', 'Number'];
  const values = [checks.length, checks.uppercase, checks.lowercase, checks.number];

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] tracking-widest uppercase text-canopy-ink-900/50">Password strength</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <LeafFill key={level} filled={score >= level} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {labels.map((label, idx) => (
          <div key={label} className="flex items-center gap-1.5 text-xs">
            {values[idx] ? (
              <svg className="w-3.5 h-3.5 text-canopy-forest-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-canopy-mist-200" />
            )}
            <span className={values[idx] ? 'text-canopy-forest-700' : 'text-canopy-ink-900/30'}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
