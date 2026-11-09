// components/Header.js
'use client';

import React from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { motion } from 'framer-motion';
import { Layers, User, Building2, Eye, EyeOff } from 'lucide-react';

function Header() {
  const { entityType, setEntityType, hideValues, setHideValues, theme } = useFinancial();

  return (
    <header className="border-b border-white/[0.08] bg-slate-950/75 backdrop-blur-2xl px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-7">
        
        {/* Novo Nome: Finanças Singular com Micro-Física */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2.5 font-bold text-lg tracking-tight cursor-pointer"
        >
          <div className={`p-2 rounded-2xl ${theme.bgPrimary} text-white shadow-lg shadow-indigo-600/20 transition-colors duration-500`}>
            <Layers size={19} />
          </div>
          <span className="text-white text-base font-extrabold tracking-tight">
            Finanças <span className={`${theme.primary} transition-colors duration-500`}>Singular</span>
          </span>
        </motion.div>

        {/* Pílula Deslizante Física entre PF e PJ (Shared Layout Morph) */}
        <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl relative">
          
          {/* Botão Pessoal */}
          <button
            type="button"
            onClick={() => setEntityType('PF')}
            className={`relative flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-200 ${
              entityType === 'PF' ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {entityType === 'PF' && (
              <motion.div
                layoutId="activeEntityPill"
                className="absolute inset-0 rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/30"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <User size={13} /> Pessoal (PF)
            </span>
          </button>
          
          {/* Botão Empresa */}
          <button
            type="button"
            onClick={() => setEntityType('PJ')}
            className={`relative flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-200 ${
              entityType === 'PJ' ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {entityType === 'PJ' && (
              <motion.div
                layoutId="activeEntityPill"
                className="absolute inset-0 rounded-xl bg-emerald-600 shadow-md shadow-emerald-600/30"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Building2 size={13} /> Empresa (PJ)
            </span>
          </button>

        </div>
      </div>

      {/* Ações Direitas: Olho com Recuo Tátil e Avatar */}
      <div className="flex items-center gap-3">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setHideValues(!hideValues)}
          className="p-2.5 rounded-2xl border border-white/[0.08] bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition shadow-sm backdrop-blur-md"
          title={hideValues ? 'Mostrar Valores' : 'Ocultar Valores'}
        >
          {hideValues ? <EyeOff size={16} /> : <Eye size={16} />}
        </motion.button>

        <div className="h-5 w-[1px] bg-white/[0.08]" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-white/[0.12] shadow-md flex items-center justify-center font-bold text-xs text-white">
            P
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;