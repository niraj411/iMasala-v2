// src/components/admin/ModifierManager.jsx
// Admin interface for viewing and managing product modifiers

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Plus, Trash2, ChevronDown, ChevronRight, Edit2,
  Check, X, Layers, Tag, DollarSign, Flame, Leaf,
  GripVertical, Copy, AlertCircle, Save, RotateCcw
} from 'lucide-react';
import { modifierGroups, categoryModifiers } from '../../config/modifiers';
import { useMenu } from '../../contexts/MenuContext';

export default function ModifierManager() {
  const { categories = [] } = useMenu() || {};
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedRules, setExpandedRules] = useState({});
  const [editingRule, setEditingRule] = useState(null);

  // Convert categoryModifiers to a more visual rules format
  const rules = useMemo(() => {
    const rulesByModifier = {};

    Object.entries(categoryModifiers).forEach(([categorySlug, modifierIds]) => {
      const key = modifierIds.sort().join('+');
      if (!rulesByModifier[key]) {
        rulesByModifier[key] = {
          id: key,
          modifiers: modifierIds,
          categories: [],
          logic: 'OR'
        };
      }
      rulesByModifier[key].categories.push(categorySlug);
    });

    return Object.values(rulesByModifier);
  }, []);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const toggleRule = (ruleId) => {
    setExpandedRules(prev => ({
      ...prev,
      [ruleId]: !prev[ruleId]
    }));
  };

  // Get category name from slug
  const getCategoryName = (slug) => {
    const cat = categories.find(c => c.slug === slug);
    return cat?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-400" />
            Modifier Rules
          </h2>
          <p className="text-sm text-white/40 mt-1">
            View and manage product modifier configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            {Object.keys(modifierGroups).length} modifier groups
          </span>
          <span className="text-xs text-white/30 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            {Object.keys(categoryModifiers).length} category rules
          </span>
        </div>
      </div>

      {/* Modifier Groups Section */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Available Modifier Groups
          </h3>
          <p className="text-xs text-white/40 mt-1">
            These are the modifier options customers can choose from
          </p>
        </div>

        <div className="divide-y divide-white/5">
          {Object.values(modifierGroups).map((group) => (
            <div key={group.id} className="group">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    group.type === 'single'
                      ? 'bg-blue-500/10 border border-blue-500/20'
                      : 'bg-purple-500/10 border border-purple-500/20'
                  }`}>
                    {group.type === 'single' ? (
                      <div className="w-3 h-3 rounded-full border-2 border-blue-400" />
                    ) : (
                      <Check className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">{group.name}</p>
                    <p className="text-xs text-white/40">
                      {group.type === 'single' ? 'Single selection' : 'Multiple selection'}
                      {group.required && ' • Required'}
                      {' • '}{group.options.length} options
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded-lg font-mono">
                    {group.id}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-white/40 transition-transform ${
                      expandedGroups[group.id] ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Group Options */}
              <AnimatePresence>
                {expandedGroups[group.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/5">
                              <th className="text-left p-3 text-white/40 font-medium">Option</th>
                              <th className="text-left p-3 text-white/40 font-medium">ID</th>
                              <th className="text-right p-3 text-white/40 font-medium">Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {group.options.map((option) => (
                              <tr key={option.id} className="hover:bg-white/[0.02]">
                                <td className="p-3 text-white">
                                  <span className="flex items-center gap-2">
                                    {option.icon && <span>{option.icon}</span>}
                                    {option.name}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="text-xs text-white/40 font-mono bg-white/5 px-2 py-0.5 rounded">
                                    {option.id}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  {option.price > 0 ? (
                                    <span className="text-green-400 font-medium">
                                      +${option.price.toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="text-white/30">$0.00</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Category Rules Section */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-orange-400" />
            Category → Modifier Rules
          </h3>
          <p className="text-xs text-white/40 mt-1">
            Rules that determine which modifiers appear for each product category
          </p>
        </div>

        <div className="p-4 space-y-4">
          {rules.map((rule, ruleIndex) => (
            <div
              key={rule.id}
              className="bg-black/20 rounded-xl border border-white/10 overflow-hidden"
            >
              {/* Rule Header */}
              <button
                onClick={() => toggleRule(rule.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                    {ruleIndex + 1}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">
                      {rule.modifiers.map(id => modifierGroups[id]?.name || id).join(' + ')}
                    </p>
                    <p className="text-xs text-white/40">
                      Applies to {rule.categories.length} {rule.categories.length === 1 ? 'category' : 'categories'}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-white/40 transition-transform ${
                    expandedRules[rule.id] ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Rule Details */}
              <AnimatePresence>
                {expandedRules[rule.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4">
                      {/* Logic Selector */}
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-sm text-white/60">Rules logic:</span>
                        <div className="flex items-center gap-2">
                          <button className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium border border-orange-500/30">
                            OR
                          </button>
                          <span className="text-xs text-white/40">(At least one category must match)</span>
                        </div>
                      </div>

                      {/* Modifiers Applied */}
                      <div>
                        <p className="text-xs text-white/40 font-medium mb-2">MODIFIERS APPLIED:</p>
                        <div className="flex flex-wrap gap-2">
                          {rule.modifiers.map(modId => (
                            <span
                              key={modId}
                              className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium border border-blue-500/20 flex items-center gap-2"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              {modifierGroups[modId]?.name || modId}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Category Rules */}
                      <div>
                        <p className="text-xs text-white/40 font-medium mb-2">WHEN PRODUCT CATEGORY:</p>
                        <div className="space-y-2">
                          {rule.categories.map((catSlug, catIndex) => (
                            <div key={catSlug} className="flex items-center gap-2">
                              {catIndex > 0 && (
                                <span className="text-xs text-orange-400 font-medium px-2 py-0.5 bg-orange-500/10 rounded border border-orange-500/20">
                                  OR
                                </span>
                              )}
                              <div className="flex-1 flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                <span className="text-sm text-white/60">Product Category</span>
                                <span className="text-sm text-white/40">is equal to</span>
                                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-sm font-medium border border-green-500/20">
                                  {getCategoryName(catSlug)}
                                </span>
                                <span className="text-xs text-white/30 font-mono ml-auto">
                                  {catSlug}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            Quick Reference
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-black/20 rounded-xl border border-white/5">
              <h4 className="font-medium text-white mb-2">Full Modifiers (Protein + Spice + Rice)</h4>
              <div className="flex flex-wrap gap-1">
                {['traditional-entrees', 'curry', 'curries', 'rice-bowls', 'bowls'].map(cat => (
                  <span key={cat} className="text-xs px-2 py-0.5 bg-white/5 text-white/60 rounded">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 bg-black/20 rounded-xl border border-white/5">
              <h4 className="font-medium text-white mb-2">Kebob Modifiers (Kebob Protein + Spice)</h4>
              <div className="flex flex-wrap gap-1">
                {['tandoori-kitchen-kebobs', 'kebobs', 'kebabs'].map(cat => (
                  <span key={cat} className="text-xs px-2 py-0.5 bg-white/5 text-white/60 rounded">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 bg-black/20 rounded-xl border border-white/5">
              <h4 className="font-medium text-white mb-2">Biryani Modifiers (Biryani Protein + Spice)</h4>
              <div className="flex flex-wrap gap-1">
                {['biryani', 'biryanis'].map(cat => (
                  <span key={cat} className="text-xs px-2 py-0.5 bg-white/5 text-white/60 rounded">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 bg-black/20 rounded-xl border border-white/5">
              <h4 className="font-medium text-white mb-2">Spice Level Only</h4>
              <div className="flex flex-wrap gap-1">
                {['tandoori', 'vegetarian-entrees', 'vegetarian', 'specialties'].map(cat => (
                  <span key={cat} className="text-xs px-2 py-0.5 bg-white/5 text-white/60 rounded">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-xs text-yellow-400">
              <strong>Note:</strong> To modify these rules, edit the file: <code className="bg-black/30 px-1.5 py-0.5 rounded">src/config/modifiers.js</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
