import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ArrowRight,
  Star,
  MapPin,
  Phone,
  Clock,
  ChefHat,
  Flame,
  Award,
  Users,
  Quote,
  Sparkles,
  ExternalLink,
  Utensils,
  Timer
} from 'lucide-react';

// Press Logos Component
const PressLogo = ({ name, className = "" }) => {
  const logos = {
    'CPR': (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
          <span className="text-white font-bold text-xs">CPR</span>
        </div>
        <span className="text-white/80 font-semibold tracking-tight">Colorado Public Radio</span>
      </div>
    ),
    '9NEWS': (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 rounded bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
          <span className="text-white font-black text-sm">9</span>
        </div>
        <span className="text-white/80 font-bold tracking-tight">NEWS</span>
      </div>
    ),
    'YELP': (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 rounded bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
          <span className="text-white font-black text-lg">Y</span>
        </div>
        <span className="text-white/80 font-bold tracking-tight">yelp</span>
      </div>
    ),
    'DENVER POST': (
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="text-white/80 font-serif font-bold text-lg tracking-tight italic">The Denver Post</span>
      </div>
    )
  };
  return logos[name] || null;
};

// Partner Logo Component - These would ideally be replaced with actual images
const PartnerLogo = ({ name, className = "" }) => {
  const logos = {
    'GOGO': (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <span className="text-white/70 font-black text-xl tracking-widest">GOGO</span>
        <span className="text-white/40 text-[10px] tracking-wider">CHARTERS</span>
      </div>
    ),
    'CATERPILLAR': (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <span className="text-amber-400/90 font-black text-xl tracking-tight">CAT</span>
        <div className="h-1 w-12 bg-amber-400/60 mt-0.5"></div>
      </div>
    ),
    'MLB': (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center">
          <span className="text-white/80 font-black text-sm">MLB</span>
        </div>
      </div>
    ),
    'BVSD': (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <span className="text-white/70 font-bold text-lg tracking-tight">BVSD</span>
        <span className="text-white/40 text-[9px]">Boulder Valley Schools</span>
      </div>
    ),
    'SISTER CARMEN': (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <span className="text-white/70 font-semibold text-sm tracking-tight">Sister Carmen</span>
        <span className="text-white/40 text-[10px]">Community Center</span>
      </div>
    )
  };
  return logos[name] || null;
};

// Animated Counter Component
const AnimatedNumber = ({ value, suffix = "", duration = 2 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value);
      const increment = end / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const pressOutlets = ['CPR', '9NEWS', 'YELP', 'DENVER POST'];
  const cateringPartners = ['GOGO', 'CATERPILLAR', 'MLB', 'BVSD', 'SISTER CARMEN'];

  const features = [
    {
      icon: ChefHat,
      title: 'Master Chefs',
      description: 'Recipes passed down through generations, prepared by skilled artisans of authentic Indian cuisine.'
    },
    {
      icon: Flame,
      title: 'Tandoor Fired',
      description: 'Traditional clay oven cooking at 900°F for that unmistakable smoky, charred perfection.'
    },
    {
      icon: Award,
      title: 'Award Winning',
      description: "Recognized as Lafayette's premier destination for authentic Indian & Himalayan flavors."
    },
    {
      icon: Users,
      title: 'Corporate Catering',
      description: 'Trusted by Fortune 500 companies, schools, and organizations across Colorado.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Google Review',
      rating: 5,
      text: 'The butter chicken here is absolutely divine. Best Indian food in the Boulder-Lafayette area, hands down!',
      image: null
    },
    {
      name: 'Corporate Event Manager',
      role: 'Caterpillar Inc.',
      rating: 5,
      text: 'Tandoori Kitchen has catered our corporate events for 3 years. Always exceptional quality and service.',
      image: null
    },
    {
      name: 'Michael R.',
      role: 'Yelp Elite',
      rating: 5,
      text: 'Authentic flavors that transport you straight to India. The samosas and naan are perfection!',
      image: null
    }
  ];

  const menuHighlights = [
    { name: 'Butter Chicken', emoji: '🍛', description: 'Our signature creamy tomato curry' },
    { name: 'Tandoori Mixed Grill', emoji: '🍢', description: 'Assortment from the clay oven' },
    { name: 'Lamb Biryani', emoji: '🍚', description: 'Fragrant basmati rice masterpiece' },
    { name: 'Garlic Naan', emoji: '🫓', description: 'Fresh from our tandoor oven' },
    { name: 'Samosa Chaat', emoji: '🥟', description: 'Crispy pastry with chutneys' },
    { name: 'Mango Lassi', emoji: '🥭', description: 'Creamy yogurt refreshment' },
  ];

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Main gradient orbs */}
          <motion.div 
            className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(234,88,12,0.15) 0%, transparent 70%)',
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)',
            }}
            animate={{
              x: [0, -40, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Subtle grain overlay */}
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 max-w-7xl mx-auto px-4 py-32 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Tagline Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-full mb-10"
            >
              <Sparkles className="w-4 h-4 text-orange-400" strokeWidth={2} />
              <span className="text-sm font-medium text-white/70 tracking-wide">Lafayette's Authentic Indian Kitchen</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-6 tracking-tighter"
            >
              <span className="block text-white">Tandoori</span>
              <span className="block bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                Kitchen
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-lg sm:text-xl md:text-2xl text-white/50 mb-4 max-w-2xl mx-auto font-light tracking-wide"
            >
              Indian & Himalayan Cuisine
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="text-base sm:text-lg text-white/30 mb-12 max-w-xl mx-auto font-light"
            >
              Where centuries-old recipes meet modern Colorado hospitality. 
              Fire-roasted perfection, served with heart.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={() => navigate('/shop')}
                className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02]"
              >
                <span>Order Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
              </button>
              <a
                href="tel:+13036658530"
                className="px-8 py-4 backdrop-blur-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-white rounded-2xl font-medium transition-all duration-300 flex items-center gap-2"
              >
                <Phone className="w-4 h-4" strokeWidth={2} />
                <span>(303) 665-8530</span>
              </a>
            </motion.div>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="grid grid-cols-3 gap-4 sm:gap-8 mt-20 max-w-3xl mx-auto"
          >
            <div className="text-center p-4">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                <AnimatedNumber value="15" suffix="+" />
              </div>
              <div className="text-sm text-white/40 font-medium">Years Serving Colorado</div>
            </div>
            <div className="text-center p-4 border-x border-white/[0.06]">
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-3xl sm:text-4xl font-bold text-white">5.0</span>
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-sm text-white/40 font-medium">Google Rating</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                <AnimatedNumber value="10000" suffix="+" />
              </div>
              <div className="text-sm text-white/40 font-medium">Happy Customers</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-2"
          >
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-2 bg-white/40 rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          AS FEATURED IN (PRESS) SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-white/30 font-medium">As Featured In</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 md:gap-16"
          >
            {pressOutlets.map((outlet, index) => (
              <motion.div
                key={outlet}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                className="grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-500 cursor-pointer"
              >
                <PressLogo name={outlet} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          WHY TANDOORI KITCHEN SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 sm:mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Why Tandoori Kitchen?
            </h2>
            <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto font-light">
              More than a restaurant — a culinary journey through the heart of India
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative p-8 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.05] hover:border-orange-500/20 transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="w-7 h-7 text-orange-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/40 font-light leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          LUNCH BUFFET SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-[2.5rem] overflow-hidden"
          >
            {/* Card Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/10 to-orange-600/20" />
            <div className="absolute inset-0 backdrop-blur-xl" />
            <div className="absolute inset-0 border border-orange-500/30 rounded-[2.5rem]" />

            {/* Content */}
            <div className="relative p-8 sm:p-12 md:p-16">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                {/* Left Side - Text */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full mb-6"
                  >
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-semibold text-orange-400">WEEKDAY SPECIAL</span>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight"
                  >
                    Lunch
                    <span className="block text-orange-400">Buffet</span>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-white/60 mb-6 max-w-md"
                  >
                    Unlimited authentic Indian dishes, fresh naan from our tandoor, and so much more. All you can eat!
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-4 mb-8"
                  >
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock className="w-5 h-5 text-orange-400" />
                      <span>Mon-Fri 11AM-2:30PM</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Utensils className="w-5 h-5 text-orange-400" />
                      <span>15+ Dishes Daily</span>
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    onClick={() => navigate('/lunch-buffet')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center gap-3 px-8 py-4 bg-white hover:bg-white/90 text-black rounded-2xl font-bold transition-all shadow-lg"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>

                {/* Right Side - Price Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    {/* Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-2xl opacity-40" />

                    {/* Card */}
                    <motion.div
                      whileHover={{ scale: 1.02, rotate: 1 }}
                      className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 sm:p-10 text-center shadow-2xl cursor-pointer"
                      onClick={() => navigate('/lunch-buffet')}
                    >
                      {/* Badge */}
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -top-4 -right-4 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-black shadow-lg"
                      >
                        BEST VALUE!
                      </motion.div>

                      <p className="text-white/80 text-sm font-semibold tracking-wider mb-3">ALL YOU CAN EAT</p>

                      <div className="flex items-start justify-center gap-1 mb-2">
                        <span className="text-3xl text-white/80 font-bold mt-3">$</span>
                        <motion.span
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-8xl font-black text-white"
                        >
                          14
                        </motion.span>
                        <span className="text-3xl text-white/80 font-bold mt-3">.99</span>
                      </div>

                      <p className="text-white/70 text-sm mb-6">per person</p>

                      {/* Features */}
                      <div className="space-y-2 text-left">
                        {['Tandoori Specialties', 'Fresh Naan Bread', 'Curries & Rice', 'Desserts Included'].map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + idx * 0.1 }}
                            className="flex items-center gap-2 text-white/90"
                          >
                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          MENU HIGHLIGHTS SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="menu" className="py-24 sm:py-32 px-4 bg-gradient-to-b from-transparent via-orange-950/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Signature Dishes
            </h2>
            <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto font-light">
              Taste the favorites that keep our guests coming back
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {menuHighlights.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                onClick={() => navigate('/shop')}
                className="group cursor-pointer p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/30 hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className="text-4xl sm:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.emoji}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{item.name}</h3>
                <p className="text-sm text-white/40">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <button
              onClick={() => navigate('/shop')}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-white/90 text-black rounded-2xl font-semibold transition-all duration-300"
            >
              <span>View Full Menu</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CATERING PARTNERS SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-xl bg-orange-500/10 border border-orange-500/20 rounded-full mb-8">
              <Users className="w-4 h-4 text-orange-400" strokeWidth={2} />
              <span className="text-sm font-medium text-orange-400/90">Trusted by Industry Leaders</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Our Catering Partners
            </h2>
            <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto font-light">
              Proud to serve Colorado's leading organizations with exceptional Indian cuisine
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-16"
          >
            {/* Partner logos grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 items-center justify-items-center">
              {cateringPartners.map((partner, index) => (
                <motion.div
                  key={partner}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                  className="w-full h-24 sm:h-28 flex items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-500 grayscale hover:grayscale-0"
                >
                  <PartnerLogo name={partner} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Catering CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 sm:mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-orange-500/10 via-orange-600/5 to-transparent border border-orange-500/20 text-center"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Planning a Corporate Event?
            </h3>
            <p className="text-white/50 mb-8 max-w-xl mx-auto">
              From intimate board meetings to large company gatherings, we bring authentic Indian flavors to your event with white-glove service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+13036658530"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl font-semibold transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                <span>Call for Catering</span>
              </a>
              <button
                onClick={() => navigate('/shop')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white rounded-2xl font-medium transition-all duration-300"
              >
                <span>Order Online</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TESTIMONIALS SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-4 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              What People Say
            </h2>
            <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto font-light">
              Join thousands of satisfied customers who've made Tandoori Kitchen their favorite
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="relative p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.06]"
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-white/[0.05]" />
                
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                
                <p className="text-white/70 mb-6 leading-relaxed font-light">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{testimonial.name}</div>
                    <div className="text-white/40 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          LOCATION & HOURS SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Visit Us
            </h2>
            <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto font-light">
              Located in the heart of Lafayette, Colorado
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Location Card */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-orange-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Location</h3>
              <p className="text-white/60 text-lg mb-2">199 W South Boulder Rd</p>
              <p className="text-white/60 text-lg mb-6">Lafayette, CO 80026</p>
              <a
                href="https://maps.google.com/?q=400+W+South+Boulder+Rd+Lafayette+CO+80026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                <span>Get Directions</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Hours Card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-orange-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Hours</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="text-white/60">Monday - Thursday</span>
                  <span className="text-white">11am - 2:30pm</span>
                  <span className="text-white">4:30pm - 9pm</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-white/60">Friday - Saturday</span>
                  <span className="text-white">11am - 2:30pm</span>
                  <span className="text-white">4:30pm - 9:30pm</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-white/60">Sunday</span>
                  <span className="text-white">11am - 2:30pm</span>
                  <span className="text-white">4:30pm - 9pm</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FINAL CTA SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative p-10 sm:p-16 rounded-[2.5rem] overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-red-600/10" />
            <div className="absolute inset-0 backdrop-blur-3xl" />
            <div className="absolute inset-0 border border-orange-500/20 rounded-[2.5rem]" />
            
            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Ready to Experience<br />Authentic Flavors?
              </h2>
              <p className="text-lg sm:text-xl text-white/50 mb-10 max-w-xl mx-auto font-light">
                Order now and taste the difference that 15+ years of passion and tradition brings to every dish.
              </p>
              <button
                onClick={() => navigate('/shop')}
                className="group px-10 py-5 bg-white hover:bg-white/90 text-black rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-3 mx-auto shadow-2xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02]"
              >
                <span>Start Your Order</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer Spacer */}
      <div className="h-16" />
    </div>
  );
};

export default Home;