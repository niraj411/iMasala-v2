import React from 'react';
import { ShoppingCart } from 'lucide-react';

export default function Cart() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6 inline-block p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
          <ShoppingCart className="w-16 h-16 text-white/40" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-semibold text-white mb-3 tracking-tight">
          Shopping Cart
        </h1>
        <p className="text-white/40 font-medium">
          Cart functionality coming soon...
        </p>
      </div>
    </div>
  );
}