import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    const result = await login(username, password);
    
    if (result.success) {
      toast.success('Login successful!');
      
      const userRoles = result.user?.roles || [];
      const isAdmin = Array.isArray(userRoles) && 
                     (userRoles.includes('administrator') || userRoles.includes('shop_manager'));
      
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/my-account');
      }
    } else {
      toast.error(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-5xl font-semibold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-3 tracking-tight">
            iMasala
          </h2>
          <p className="text-white/40 font-medium">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            {/* Username Field */}
            <div className="relative border-b border-white/10">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="w-5 h-5 text-white/30" strokeWidth={1.5} />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm font-medium"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5 text-white/30" strokeWidth={1.5} />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm font-medium"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 backdrop-blur-xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white rounded-2xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}