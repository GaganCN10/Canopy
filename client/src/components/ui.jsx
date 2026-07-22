import { motion } from 'framer-motion';

export function Section({ children, className = '', id, ...props }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`py-16 lg:py-24 ${className}`}
      {...props}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </motion.section>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-10">
      <h1 className="text-3xl lg:text-4xl font-display font-semibold text-canopy-forest-950 mb-3">{title}</h1>
      {subtitle && <p className="text-lg text-canopy-ink-900/70 max-w-2xl">{subtitle}</p>}
      {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-canopy-sand-100 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-canopy-forest-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="font-display text-xl font-semibold text-canopy-forest-950 mb-2">{title}</h3>
      {description && <p className="text-canopy-ink-900/70 max-w-md mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-canopy-sand-100 text-canopy-ink-900/70',
    verified: 'bg-canopy-moss-300/20 text-canopy-forest-600',
    rejected: 'bg-red-50 text-red-700',
    new: 'bg-canopy-sand-100 text-canopy-ink-900/70',
    under_review: 'bg-amber-50 text-amber-700',
    actioned: 'bg-canopy-moss-300/20 text-canopy-forest-600',
    closed: 'bg-canopy-mist-200 text-canopy-ink-900/70',
    intake: 'bg-canopy-sand-100 text-canopy-ink-900/70',
    in_care: 'bg-blue-50 text-blue-700',
    released: 'bg-canopy-moss-300/20 text-canopy-forest-600',
    deceased: 'bg-red-50 text-red-700',
    reported: 'bg-canopy-sand-100 text-canopy-ink-900/70',
    investigating: 'bg-amber-50 text-amber-700',
    resolved: 'bg-canopy-moss-300/20 text-canopy-forest-600',
    crop_raiding: 'bg-canopy-clay-500/10 text-canopy-clay-500',
    livestock_predation: 'bg-red-50 text-red-700',
    property_damage: 'bg-amber-50 text-amber-700',
    injury: 'bg-orange-50 text-orange-700',
    fatal: 'bg-red-50 text-red-700',
    other: 'bg-canopy-mist-200 text-canopy-ink-900/70',
  };

  const label = String(status).replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.other}`}>
      {label}
    </span>
  );
}

export function ConservationBadge({ status }) {
  const colors = {
    LC: 'bg-canopy-moss-300/20 text-canopy-forest-600',
    NT: 'bg-amber-50 text-amber-700',
    VU: 'bg-orange-50 text-orange-700',
    EN: 'bg-red-50 text-red-700',
    CR: 'bg-red-100 text-red-800',
    EW: 'bg-red-100 text-red-800',
    DD: 'bg-canopy-mist-200 text-canopy-ink-900/70',
    NE: 'bg-canopy-mist-200 text-canopy-ink-900/70',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || colors.DD}`}>
      {status}
    </span>
  );
}
