import React from 'react';
import { motion } from 'framer-motion';

const LeafIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M12 3c-4.97 4.97-7 9-7 12a7 7 0 1 0 14 0c0-3-2.03-7.03-7-12z" />
    <path d="M12 21v-9" />
    <path d="M9 12c1.5-1.5 3-2 3-2s1.5.5 3 2" />
  </svg>
);

const TreeLayer = ({ delay, opacity, scale, y, color }) => (
  <motion.div
    initial={{ opacity: 0, y: y + 40 }}
    animate={{ opacity, y }}
    transition={{ duration: 1.2, delay, ease: 'easeOut' }}
    className="absolute inset-0 flex items-end justify-center pointer-events-none"
    style={{ transform: `scale(${scale})` }}
  >
    <svg viewBox="0 0 1440 900" className="w-full h-auto" preserveAspectRatio="xMidYMax slice">
      <path d="M0 900V400c80-60 160-120 240-180s200-100 300-120 240 0 360 60 240 140 320 220 140 180 160 220v300H0z" fill={color} />
      <path d="M480 900V350c60-50 120-100 180-150s150-80 240-90 180 10 270 50 180 100 240 160 120 140 150 180v300H480z" fill={color} opacity="0.7" />
      <path d="M960 900V300c40-40 80-80 120-120s100-70 160-80 120 0 180 40 120 80 160 120 80 100 100 130v310H960z" fill={color} opacity="0.4" />
    </svg>
  </motion.div>
);

const LightShaft = ({ x, delay }) => (
  <motion.div
    initial={{ opacity: 0, scaleY: 0.8 }}
    animate={{ opacity: 0.08, scaleY: 1 }}
    transition={{ duration: 1.8, delay, ease: 'easeOut' }}
    className="absolute inset-0 pointer-events-none"
    style={{ background: `radial-gradient(ellipse 80px 600px at ${x}% 0%, rgba(255,255,255,0.6) 0%, transparent 70%)` }}
  />
);

export default function AuthLayout({ children, mode = 'login' }) {
  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-canopy-sand-50">
      {/* Imagery Panel */}
      <div className="relative lg:w-[55%] h-[30vh] lg:h-screen overflow-hidden bg-canopy-forest-950">
        {/* Light shafts */}
        <LightShaft x={20} delay={0.3} />
        <LightShaft x={50} delay={0.5} />
        <LightShaft x={75} delay={0.4} />
        <LightShaft x={90} delay={0.6} />

        {/* Tree layers */}
        <TreeLayer delay={0.2} opacity={0.35} scale={1.1} y={0} color="#0F1F17" />
        <TreeLayer delay={0.4} opacity={0.5} scale={1.05} y={-20} color="#1a3326" />
        <TreeLayer delay={0.6} opacity={0.7} scale={1} y={-40} color="#2C5E3D" />
        <TreeLayer delay={0.8} opacity={0.9} scale={0.95} y={-60} color="#4F8A5D" />

        {/* Floating leaves */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -20, x: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [0, 40, 80],
              x: [0, 20, 40],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'linear',
            }}
            className="absolute text-canopy-moss-300/60"
            style={{ top: `${20 + i * 12}%`, left: `${10 + i * 15}%` }}
          >
            <LeafIcon className="w-4 h-4" />
          </motion.div>
        ))}

        {/* Content */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 lg:p-14">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-white"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <LeafIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl tracking-wide">Canopy</span>
            </div>

            <h1 className="font-display text-3xl lg:text-5xl font-semibold mb-4 leading-tight max-w-lg">
              {isLogin ? 'Welcome back to the canopy' : 'Join the effort to protect what\'s left'}
            </h1>
            <p className="text-white/75 text-base lg:text-lg max-w-md leading-relaxed">
              {isLogin
                ? 'Track sightings, coordinate rescues, and monitor wildlife across protected landscapes.'
                : 'Help us track species, report sightings, and build the world\'s most comprehensive conservation intelligence platform.'}
            </p>

            <div className="mt-10 flex items-center gap-6 text-white/60 text-sm">
              <div>
                <span className="block text-2xl font-display text-white mb-1">12,847</span>
                <span className="tracking-wide uppercase text-xs">Hectares monitored</span>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <span className="block text-2xl font-display text-white mb-1">3,291</span>
                <span className="tracking-wide uppercase text-xs">Community members</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 lg:px-14 bg-canopy-sand-50">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
