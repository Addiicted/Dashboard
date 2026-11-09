// components/Sidebar.js
'use client';

import React from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  CreditCard, 
  Target, 
  TrendingUp, 
  RefreshCw, 
  Settings 
} from 'lucide-react';

function Sidebar() {
  const { activeTab, setActiveTab, entityType, theme } = useFinancial();

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'extrato', label: 'Extrato & Lançamentos', icon: ArrowLeftRight },
    { id: 'cartoes', label: 'Cartões de Crédito', icon: CreditCard },
    { id: 'metas', label: 'Metas & Orçamento', icon: Target },
    { id: 'investimentos', label: 'Investimentos', icon: TrendingUp },
    { id: 'ponte', label: 'A Ponte (PF ↔ PJ)', icon: RefreshCw },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/[0.08] bg-slate-950/40 backdrop-blur-2xl p-4 flex flex-col justify-between min-h-[calc(100vh-65px)]">
      <nav className="space-y-1 relative">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">
          Menu {entityType === 'PF' ? 'Pessoal' : 'Empresarial'}
        </div>

        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium text-xs relative transition-colors duration-200 ${
                isActive ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Cápsula de Luz que Desliza Suavemente de uma aba para outra */}
              {isActive && (
                <motion.div
                  layoutId="activeSidebarPill"
                  className={`absolute inset-0 rounded-2xl ${theme.badge} border shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]`}
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}

              <Icon size={17} className={`relative z-10 ${isActive ? theme.primary : 'text-slate-400'}`} />
              <span className="relative z-10">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Card da Ponte com Micro-Pulso */}
      <div className="p-4 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status da Ponte</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          {entityType === 'PJ' 
            ? 'Monitore os repasses e pró-labore enviados para a pessoa física.' 
            : 'Controle o que entra da sua empresa sem misturar os patrimônios.'}
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;