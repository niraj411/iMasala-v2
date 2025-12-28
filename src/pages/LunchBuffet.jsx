// src/pages/LunchBuffet.jsx
// Interactive, mobile-optimized Lunch Buffet page

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Clock, Users, Utensils, Flame, Star, ChevronRight,
  Calendar, MapPin, Phone, Sparkles, Check, ArrowRight,
  Timer, Heart, Award, Leaf
} from 'lucide-react';

// Buffet menu items with icons
const buffetItems = [
  { name: 'Tandoori Chicken', icon: '🍗', category: 'Tandoori', popular: true },
  { name: 'Butter Chicken', icon: '🍛', category: 'Curry', popular: true },
  { name: 'Lamb Curry', icon: '🍖', category: 'Curry' },
  { name: 'Chana Masala', icon: '🫘', category: 'Vegetarian', veg: true },
  { name: 'Palak Paneer', icon: '🧀', category: 'Vegetarian', veg: true },
  { name: 'Dal Makhani', icon: '🍲', category: 'Vegetarian', veg: true },
  { name: 'Fresh Naan', icon: '🫓', category: 'Breads', popular: true },
  { name: 'Garlic Naan', icon: '🧄', category: 'Breads' },
  { name: 'Basmati Rice', icon: '🍚', category: 'Rice' },
  { name: 'Biryani', icon: '🥘', category: 'Rice', popular: true },
  { name: 'Samosas', icon: '🥟', category: 'Appetizers' },
  { name: 'Pakoras', icon: '🧆', category: 'Appetizers', veg: true },
  { name: 'Raita', icon: '🥛', category: 'Sides' },
  { name: 'Mango Lassi', icon: '🥭', category: 'Drinks' },
  { name: 'Kheer', icon: '🍮', category: 'Desserts' },
  { name: 'Gulab Jamun', icon: '🧁', category: 'Desserts', popular: true },
];

// Feature cards data
const features = [
  { icon: Utensils, title: 'Unlimited Servings', desc: 'Eat as much as you want' },
  { icon: Flame, title: 'Fresh & Hot', desc: 'Continuously replenished' },
  { icon: Leaf, title: 'Veg Options', desc: 'Plenty of vegetarian choices' },
  { icon: Star, title: 'Dessert Included', desc: 'Kheer & gulab jamun' },
];

export default function LunchBuffet() {
  const navigate = useNavigate();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isBuffetOpen, setIsBuffetOpen] = useState(false);
  const [timeUntilOpen, setTimeUntilOpen] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Check if buffet is currently open
  useEffect(() => {
    const checkBuffetStatus = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hours * 60 + minutes;

      const openTime = 11 * 60; // 11:00 AM
      const closeTime = 14 * 60 + 30; // 2:30 PM

      // Monday (1) to Friday (5)
      const isWeekday = day >= 1 && day <= 5;
      const isDuringHours = currentTime >= openTime && currentTime < closeTime;

      setIsBuffetOpen(isWeekday && isDuringHours);

      // Calculate time until next opening
      if (!isWeekday || currentTime >= closeTime) {
        // Find next weekday
        let daysUntil = 1;
        let nextDay = day + 1;
        while (nextDay > 5 || nextDay < 1) {
          nextDay = nextDay > 6 ? 1 : nextDay + 1;
          daysUntil++;
        }
        if (day >= 1 && day <= 5 && currentTime < openTime) {
          setTimeUntilOpen(`Opens today at 11:00 AM`);
        } else {
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          setTimeUntilOpen(`Opens ${dayNames[nextDay]} at 11:00 AM`);
        }
      } else if (currentTime < openTime) {
        const minsUntil = openTime - currentTime;
        const h = Math.floor(minsUntil / 60);
        const m = minsUntil % 60;
        setTimeUntilOpen(`Opens in ${h > 0 ? `${h}h ` : ''}${m}m`);
      }
    };

    checkBuffetStatus();
    const interval = setInterval(checkBuffetStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate featured items
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentItemIndex((prev) => (prev + 1) % buffetItems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const categories = ['all', ...new Set(buffetItems.map(item => item.category))];
  const filteredItems = activeCategory === 'all'
    ? buffetItems
    : buffetItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 via-black to-red-900/20" />
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            {isBuffetOpen ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 font-semibold text-sm">OPEN NOW</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full">
                <Timer className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 font-semibold text-sm">{timeUntilOpen}</span>
              </div>
            )}
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
              Lunch
              <span className="block bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
                Buffet
              </span>
            </h1>
            <p className="text-xl text-white/60 max-w-md mx-auto">
              An endless journey through authentic Indian flavors
            </p>
          </motion.div>

          {/* Price Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex justify-center"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-xl opacity-50" />

              <div className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-center shadow-2xl">
                <div className="absolute -top-3 -right-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold"
                  >
                    BEST VALUE
                  </motion.div>
                </div>

                <p className="text-white/80 text-sm font-medium mb-2">ALL YOU CAN EAT</p>
                <div className="flex items-start justify-center gap-1">
                  <span className="text-2xl text-white/80 font-bold mt-2">$</span>
                  <span className="text-7xl font-black text-white">14</span>
                  <span className="text-3xl text-white/80 font-bold mt-2">.99</span>
                </div>
                <p className="text-white/70 text-sm mt-2">per person</p>

                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-center gap-2 text-white/90">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Mon - Fri • 11AM - 2:30PM</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="font-bold text-white text-sm">{feature.title}</h3>
                <p className="text-white/50 text-xs mt-1">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* What's on the Buffet */}
      <div className="bg-gradient-to-b from-black via-zinc-950 to-black py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              What's on the Buffet
            </h2>
            <p className="text-white/50">Fresh selections, continuously replenished</p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {cat === 'all' ? 'All Items' : cat}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.name}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center group overflow-hidden"
                >
                  {/* Popular badge */}
                  {item.popular && (
                    <div className="absolute top-2 right-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                  )}

                  {/* Veg badge */}
                  {item.veg && (
                    <div className="absolute top-2 left-2">
                      <div className="w-4 h-4 border-2 border-green-500 rounded-sm flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                    </div>
                  )}

                  <motion.span
                    className="text-4xl block mb-3"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                  >
                    {item.icon}
                  </motion.span>
                  <h3 className="font-semibold text-white text-sm">{item.name}</h3>
                  <p className="text-white/40 text-xs mt-1">{item.category}</p>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* And more indicator */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-white/40 mt-8 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            Plus many more dishes, rotated daily
            <Sparkles className="w-4 h-4 text-orange-400" />
          </motion.p>
        </div>
      </div>

      {/* Why Choose Our Buffet */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
              Why Our Buffet?
            </h2>

            <div className="space-y-4">
              {[
                'Authentic recipes passed down through generations',
                'Fresh ingredients prepared daily',
                'Vegetarian and non-vegetarian options',
                'Freshly baked naan straight from the tandoor',
                'Complimentary chai and mango lassi',
                'Perfect for quick lunch or group gatherings',
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-white/80 font-medium">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Feast?
          </h2>
          <p className="text-white/60 mb-8">
            No reservations needed. Walk in during buffet hours and enjoy!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="tel:3036658530"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg shadow-lg"
            >
              <Phone className="w-5 h-5" />
              Call Us
            </motion.a>

            <motion.a
              href="https://www.google.com/maps/search/?api=1&query=199+W+South+Boulder+Rd+Lafayette+CO+80026"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg"
            >
              <MapPin className="w-5 h-5" />
              Get Directions
            </motion.a>
          </div>

          {/* Address */}
          <div className="mt-10 p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-white/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-400" />
                <span>199 W. South Boulder Rd, Lafayette, CO</span>
              </div>
              <div className="hidden md:block w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                <span>Mon-Fri 11:00 AM - 2:30 PM</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-24 left-0 right-0 px-4 md:hidden z-40">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <a
            href="tel:3036658530"
            className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-orange-500/30"
          >
            {isBuffetOpen ? (
              <>
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                We're Open! Call Now
              </>
            ) : (
              <>
                <Phone className="w-5 h-5" />
                Call to Learn More
              </>
            )}
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
