// src/pages/Login.jsx - Premium Authentication Page (Working Version)
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, Phone, Eye, EyeOff, LogIn, UserPlus,
  ArrowRight, Shield, Utensils, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from state or default to /shop
  const from = location.state?.from?.pathname || '/shop';
  
  // Auth mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Form states - using username for login (matching your auth system)
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // If already logged in, redirect
  if (user) {
    const userRoles = user?.roles || [];
    const isAdmin = Array.isArray(userRoles) && 
                   (userRoles.includes('administrator') || userRoles.includes('shop_manager'));
    
    if (isAdmin) {
      navigate('/admin', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
    return null;
  }

  const validateLogin = () => {
    const newErrors = {};
    if (!loginForm.username.trim()) {
      newErrors.username = 'Username or email is required';
    }
    if (!loginForm.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!registerForm.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!registerForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!registerForm.password) {
      newErrors.password = 'Password is required';
    } else if (registerForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const result = await login(loginForm.username, loginForm.password);
      
      if (result.success) {
        toast.success('Welcome back!');
        
        // Check user roles for redirect
        const userRoles = result.user?.roles || [];
        const isAdmin = Array.isArray(userRoles) && 
                       (userRoles.includes('administrator') || userRoles.includes('shop_manager'));
        
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate(from);
        }
      } else {
        toast.error(result.error || 'Invalid username or password');
        setErrors({ general: result.error || 'Invalid username or password' });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      // Check if register function exists
      if (typeof register !== 'function') {
        toast.error('Registration is not available. Please contact us to create an account.');
        setLoading(false);
        return;
      }
      
      const result = await register({
        email: registerForm.email,
        password: registerForm.password,
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        phone: registerForm.phone
      });
      
      if (result.success) {
        toast.success('Account created successfully!');
        navigate(from);
      } else {
        toast.error(result.error || 'Failed to create account');
        setErrors({ general: result.error || 'Failed to create account' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-4 shadow-lg shadow-orange-500/25"
          >
            <Utensils className="w-8 h-8 text-white" strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-white/40 mt-2 font-medium">
            {authMode === 'login' 
              ? 'Sign in to your Tandoori Kitchen account' 
              : 'Join us for exclusive offers & faster checkout'}
          </p>
        </div>

        {/* Auth Card */}
        <motion.div
          layout
          className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8 shadow-2xl"
        >
          {/* Tab Switcher */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                authMode === 'login'
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                authMode === 'register'
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* General Error */}
          <AnimatePresence>
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-300 font-medium">{errors.general}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {authMode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                {/* Username/Email */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" strokeWidth={1.5} />
                    <input
                      type="text"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="your_username"
                      autoComplete="username"
                      className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all font-medium ${
                        errors.username 
                          ? 'border-red-500/50 focus:ring-red-500/20' 
                          : 'border-white/10 focus:ring-white/20 focus:border-white/20'
                      }`}
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.username}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" strokeWidth={1.5} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={`w-full pl-12 pr-12 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all font-medium ${
                        errors.password 
                          ? 'border-red-500/50 focus:ring-red-500/20' 
                          : 'border-white/10 focus:ring-white/20 focus:border-white/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.password}</p>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-white/40 hover:text-white transition-colors font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-white hover:bg-white/90 text-black rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" strokeWidth={2} />
                      Sign In
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={registerForm.firstName}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                      className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all font-medium ${
                        errors.firstName 
                          ? 'border-red-500/50 focus:ring-red-500/20' 
                          : 'border-white/10 focus:ring-white/20 focus:border-white/20'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" strokeWidth={1.5} />
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="you@example.com"
                      className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all font-medium ${
                        errors.email 
                          ? 'border-red-500/50 focus:ring-red-500/20' 
                          : 'border-white/10 focus:ring-white/20 focus:border-white/20'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" strokeWidth={1.5} />
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(303) 555-1234"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" strokeWidth={1.5} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="At least 6 characters"
                      className={`w-full pl-12 pr-12 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all font-medium ${
                        errors.password 
                          ? 'border-red-500/50 focus:ring-red-500/20' 
                          : 'border-white/10 focus:ring-white/20 focus:border-white/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" strokeWidth={1.5} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm your password"
                      className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all font-medium ${
                        errors.confirmPassword 
                          ? 'border-red-500/50 focus:ring-red-500/20' 
                          : 'border-white/10 focus:ring-white/20 focus:border-white/20'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-white hover:bg-white/90 text-black rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" strokeWidth={2} />
                      Create Account
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/30 font-medium">
                or continue as guest
              </span>
            </div>
          </div>

          {/* Guest Checkout */}
          <Link
            to="/shop"
            className="w-full py-3 border border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all font-semibold flex items-center justify-center gap-2"
          >
            Continue to Menu
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Trust signals */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/30">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" strokeWidth={1.5} />
            <span className="font-medium">Secure & encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
            <span className="font-medium">No spam, ever</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}