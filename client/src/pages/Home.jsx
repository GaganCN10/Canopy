import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Leaf, Camera, Shield, Map, Waves, ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

function AnimatedCounter({ end, label, suffix = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <p className="font-display text-4xl lg:text-5xl font-semibold text-canopy-forest-600">{end}{suffix}</p>
      <p className="text-sm text-canopy-ink-900/70 mt-1 font-medium">{label}</p>
    </motion.div>
  );
}

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Camera,
      title: 'Report Sightings',
      description: 'Log wildlife observations with photos, location data, and species identification. Community-verified for accuracy.',
      href: '/sightings/report',
    },
    {
      icon: Shield,
      title: 'Anti-Poaching Intelligence',
      description: 'Submit anonymous tips, review evidence, and coordinate with rangers to protect endangered species.',
      href: '/tips/submit',
    },
    {
      icon: Map,
      title: 'Interactive Map',
      description: 'Explore sightings, HWC incidents, and rescue operations on a live geospatial dashboard.',
      href: '/map',
    },
    {
      icon: Waves,
      title: 'Predictive Analytics',
      description: 'ML-powered hotspot mapping, population forecasting, and anomaly detection for proactive conservation.',
      href: '/analytics',
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-canopy-forest-950/70 via-canopy-forest-950/50 to-canopy-sand-50" />
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8">
              <Leaf className="w-4 h-4" />
              Wildlife Conservation Platform
            </div>
            <h1 className="font-display text-white mb-6 leading-tight">
              Protecting biodiversity,<br />one observation at a time.
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
              Canopy unifies species monitoring, citizen science, anti-poaching intelligence, and predictive analytics into one field-ready platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/sightings/report')} className="btn-clay text-base px-8 py-4">
                Report a Sighting
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button onClick={() => navigate('/map')} className="btn-secondary text-base px-8 py-4 border-white/30 text-white hover:bg-white/10">
                Explore the Map
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <AnimatedCounter end="1,247" label="Species Tracked" />
            <AnimatedCounter end="8,532" label="Sightings Logged" />
            <AnimatedCounter end="342" label="Active Rescues" />
            <AnimatedCounter end="89" label="Verified Tips" suffix="%" />
          </div>
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-semibold mb-4">How Canopy Works</h2>
            <p className="text-lg text-canopy-ink-900/70 max-w-2xl mx-auto">
              From field observation to actionable intelligence — every step designed for conservation teams.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                custom={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                onClick={() => navigate(feature.href)}
                className="card p-8 cursor-pointer group hover:shadow-ambient-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-canopy-sand-100 flex items-center justify-center mb-6 group-hover:bg-canopy-forest-600/10 transition-colors">
                  <feature.icon className="w-7 h-7 text-canopy-forest-600" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm text-canopy-ink-900/70 leading-relaxed mb-4">{feature.description}</p>
                <div className="flex items-center text-sm font-medium text-canopy-forest-600 group-hover:text-canopy-forest-800 transition-colors">
                  Learn more
                  <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-semibold mb-2">Recent Sightings</h2>
              <p className="text-canopy-ink-900/70">Latest verified wildlife observations from the field.</p>
            </div>
            <button onClick={() => navigate('/sightings')} className="btn-secondary text-sm hidden sm:flex">
              View all
            </button>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item * 0.05 }}
                className="card overflow-hidden group hover:shadow-ambient-lg transition-all duration-300"
              >
                <div className="aspect-[4/5] bg-canopy-sand-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-canopy-forest-950/60 to-transparent z-10" />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-canopy-forest-600">
                      Verified
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <p className="font-display text-xl font-semibold text-white mb-1">Elephant herd</p>
                    <p className="text-sm text-white/80">Loxodonta africana</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-xs font-mono text-canopy-ink-900/50">2 hours ago</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-canopy-moss-300/20 text-canopy-forest-600 font-medium">Verified</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
