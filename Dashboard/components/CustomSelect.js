// components/CustomSelect.js
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Selecione uma opção...',
  className = '',
  icon: Icon = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      
      {/* Botão Gatilho Estilo Vidro Escuro */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl bg-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-white/20 text-xs text-white transition-all duration-200 focus:outline-none"
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={14} className="text-slate-400 flex-shrink-0" />}
          {selectedOption?.color && (
            <span className={`w-2.5 h-2.5 rounded-full ${selectedOption.color} flex-shrink-0`} />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 flex-shrink-0"
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      {/* Caixa Flutuante com as Opções (Acaba com o menu cinza do Windows!) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 z-50 p-1.5 rounded-2xl bg-slate-900/95 border border-white/[0.1] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_20px_40px_-10px_rgba(0,0,0,0.85)] backdrop-blur-2xl max-h-60 overflow-y-auto space-y-0.5"
          >
            {options.map(option => {
              const isSelected = String(option.value) === String(value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-150 ${
                    isSelected 
                      ? 'bg-white/[0.08] text-white font-bold' 
                      : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.color && (
                      <span className={`w-2.5 h-2.5 rounded-full ${option.color} flex-shrink-0`} />
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>

                  {isSelected && <Check size={13} className="text-indigo-400 flex-shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}