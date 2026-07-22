import { forwardRef } from 'react';

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', children, ...props },
  ref
) {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-canopy-forest-600 text-white hover:bg-canopy-forest-800 rounded-full',
    secondary: 'bg-white text-canopy-ink-900 border-2 border-canopy-mist-200 hover:bg-canopy-sand-100 rounded-full',
    clay: 'bg-canopy-clay-500 text-white hover:bg-canopy-clay-500/90 rounded-full',
    ghost: 'text-canopy-forest-600 hover:bg-canopy-forest-600/5 rounded-full',
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
});

export default Button;
