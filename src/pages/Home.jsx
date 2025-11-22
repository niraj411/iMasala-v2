// src/pages/Home.jsx - Landing Page
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Star, Clock, MapPin, Phone, Utensils, 
  Sparkles, Award, Heart, Flame, ChevronRight, Package,
  Users, Calendar, Shield, Zap, Check
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Utensils,
      title: 'Authentic Flavors',
      description: 'Traditional Indian & Himalayan recipes passed down through generations'
    },
    {
      icon: Flame,
      title: 'Fresh Ingredients',
      description: 'We use only the finest, freshest ingredients in every dish'
    },
    {
      icon: Award,
      title: 'Award Winning',
      description: 'Recognized for excellence in authentic Indian cuisine'
    },
    {
      icon: Users,
      title: 'Catering Services',
      description: 'Perfect for events, parties, and corporate gatherings'
    }
  ];

  const menuCategories = [
    { name: 'Appetizers', image: '🥟', color: 'from-orange-500/20 to-red-500/20' },
    { name: 'Curries', image: '🍛', color: 'from-amber-500/20 to-orange-500/20' },
    { name: 'Tandoori', image: '🍗', color: 'from-red-500/20 to-pink-500/20' },
    { name: 'Biryani', image: '🍚', color: 'from-yellow-500/20 to-amber-500/20' },
    { name: 'Breads', image: '🫓', color: 'from-orange-500/20 to-amber-500/20' },
    { name: 'Desserts', image: '🍮', color: 'from-pink-500/20 to-purple-500/20' }
  ];

  const reviews = [
    {
      name: 'Sarah M.',
      rating: 5,
      text: 'The best Indian food in Colorado! The butter chicken is absolutely divine.',
      date: '2 weeks ago'
    },
    {
      name: 'James K.',
      rating: 5,
      text: 'Amazing catering service for our corporate event. Everyone loved the food!',
      date: '1 month ago'
    },
    {
      name: 'Priya S.',
      rating: 5,
      text: 'Authentic taste that reminds me of home. The samosas are perfect!',
      date: '3 weeks ago'
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-amber-400" strokeWidth={2} />
              <span className="text-sm font-semibold text-white/80">Authentic Indian & Himalayan Cuisine</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-7xl md:text-8xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                iMasala
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 mb-4 font-medium">
              by Tandoori Kitchen
            </p>
            <p className="text-lg md:text-xl text-white/40 mb-12 max-w-2xl mx-auto font-medium">
              Experience the rich flavors of India with our authentic recipes, crafted with passion and served with love in Lafayette, Colorado.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/shop')}
                className="group px-8 py-4 backdrop-blur-xl bg-white hover:bg-white/90 text-black rounded-2xl font-bold transition-all flex items-center gap-2 shadow-2xl"
              >
                Order Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
              </button>
              <a
                href="#menu"
                className="px-8 py-4 backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-2xl font-semibold transition-all"
              >
                View Menu
              </a>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">5.0</div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="text-sm text-white/40 font-medium">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">15+</div>
                <div className="text-sm text-white/40 font-medium">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">1000+</div>
                <div className="text-sm text-white/40 font-medium">Happy Customers</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Why Choose iMasala?
            </h2>
            <p className="text-white/40 text-lg font-medium">
              We bring authentic Indian flavors to your table
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-orange-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 font-medium text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section id="menu" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Explore Our Menu
            </h2>
            <p className="text-white/40 text-lg font-medium">
              From traditional curries to tandoori specialties
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {menuCategories.map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate('/shop')}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
              >
                <div className={`text-5xl mb-3 group-hover:scale-110 transition-transform`}>
                  {category.image}
                </div>
                <h3 className="font-semibold text-white group-hover:text-white/80 transition-colors">
                  {category.name}
                </h3>
              </motion.button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/shop')}
              className="group inline-flex items-center gap-2 px-8 py-4 backdrop-blur-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-2xl font-semibold transition-all"
            >
              View Full Menu
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>

      {/* Catering CTA */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-3xl p-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-orange-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Planning an Event?
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto font-medium">
              Let us cater your next event! From corporate gatherings to family celebrations, we bring authentic Indian cuisine to your table.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2 text-white/80">
                <Check className="w-5 h-5 text-green-400" strokeWidth={2} />
                <span className="font-medium">$250 minimum</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Check className="w-5 h-5 text-green-400" strokeWidth={2} />
                <span className="font-medium">Free setup assistance</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Check className="w-5 h-5 text-green-400" strokeWidth={2} />
                <span className="font-medium">Customizable menu</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/shop')}
              className="mt-8 px-8 py-4 backdrop-blur-xl bg-white hover:bg-white/90 text-black rounded-2xl font-bold transition-all inline-flex items-center gap-2"
            >
              Order Catering
              <ArrowRight className="w-5 h-5" strokeWidth={2} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              What People Say
            </h2>
            <p className="text-white/40 text-lg font-medium">
              Loved by our community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/80 mb-4 font-medium">
                  "{review.text}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{review.name}</span>
                  <span className="text-xs text-white/40 font-medium">{review.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Location */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white/60" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Visit Us</h3>
              </div>
              
              <div className="space-y-4">
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=199+W+South+Boulder+Rd+Lafayette+CO+80026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-white/80 hover:text-white transition-colors group"
                >
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-orange-400" strokeWidth={1.5} />
                  <div>
                    <p className="font-medium">199 W. South Boulder Rd.</p>
                    <p className="text-white/60">Lafayette, CO 80026</p>
                  </div>
                </a>
                
                <a 
                  href="tel:3036658530"
                  className="flex items-start gap-3 text-white/80 hover:text-white transition-colors group"
                >
                  <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 text-orange-400" strokeWidth={1.5} />
                  <div>
                    <p className="font-medium">(303) 665-8530</p>
                    <p className="text-white/60 text-sm">Call for reservations</p>
                  </div>
                </a>
              </div>

              <button
                onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=199+W+South+Boulder+Rd+Lafayette+CO+80026', '_blank')}
                className="mt-6 w-full px-6 py-3 backdrop-blur-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                Get Directions
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </motion.div>

            {/* Hours */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white/60" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Hours</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start pb-4 border-b border-white/10">
                  <div>
                    <p className="font-semibold text-white mb-1">Monday - Thursday</p>
                    <div className="text-sm text-white/60 space-y-0.5">
                      <p>Lunch: 11:00 AM - 2:30 PM</p>
                      <p>Dinner: 4:30 PM - 9:00 PM</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-start pb-4 border-b border-white/10">
                  <div>
                    <p className="font-semibold text-white mb-1">Friday - Saturday</p>
                    <div className="text-sm text-white/60 space-y-0.5">
                      <p>Lunch: 11:00 AM - 2:30 PM</p>
                      <p>Dinner: 4:30 PM - 9:30 PM</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white mb-1">Sunday</p>
                    <div className="text-sm text-white/60 space-y-0.5">
                      <p>Lunch: 11:00 AM - 2:30 PM</p>
                      <p>Dinner: 4:30 PM - 9:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to Experience<br />Authentic Indian Cuisine?
            </h2>
            <p className="text-white/60 text-lg mb-8 font-medium">
              Order online for pickup or catering today
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="px-10 py-5 backdrop-blur-xl bg-white hover:bg-white/90 text-black rounded-2xl font-bold transition-all inline-flex items-center gap-2 text-lg shadow-2xl"
            >
              Start Your Order
              <ArrowRight className="w-6 h-6" strokeWidth={2} />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}