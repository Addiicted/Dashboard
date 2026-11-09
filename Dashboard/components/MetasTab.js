// components/MetasTab.js
'use client';

import React, { useState, useMemo } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { formatCurrency } from '@/utils/formatters';
import CustomSelect from '@/components/CustomSelect';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronUp,
  ChevronDown
} from 'lucide-react';

function SpotlightCard({ children, className = "" }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.08), transparent 80%)`
          }}
        />
      )}
      {children}
    </div>
  );
}

function BudgetRing({ percentage }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, percentage) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={radius} className="stroke-slate-900" strokeWidth="10" fill="transparent" />
        <motion.circle
          cx="55"
          cy="55"
          r={radius}
          className={percentage > 100 ? 'stroke-rose-500' : percentage > 75 ? 'stroke-amber-400' : 'stroke-emerald-400'}
          strokeWidth="10"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-extrabold text-white font-mono">{percentage.toFixed(0)}%</span>
        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Do Teto</span>
      </div>
    </div>
  );
}

function MetasTab() {
  const { 
    entityType, 
    theme, 
    hideValues, 
    categories, 
    transactions, 
    budgets, 
    saveBudget 
  } = useFinancial();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: categories.find(c => c.type === 'expense')?.name || '',
    limitAmount: ''
  });

  const categoryBudgetData = useMemo(() => {
    const expenseCategories = categories.filter(c => c.type === 'expense');
    const expensesTxs = transactions.filter(t => t.type === 'expense');

    return expenseCategories.map(cat => {
      const budgetObj = budgets.find(b => b.categoryName === cat.name);
      const limit = budgetObj ? Number(budgetObj.limitAmount) : 0;

      const spent = expensesTxs
        .filter(t => t.category === cat.name)
        .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      const remaining = limit - spent;

      return {
        categoryName: cat.name,
        limit,
        spent,
        percentage,
        remaining,
        hasBudget: limit > 0
      };
    });
  }, [categories, transactions, budgets]);

  const totals = useMemo(() => {
    const totalBudget = categoryBudgetData
      .filter(c => c.hasBudget)
      .reduce((acc, c) => acc + c.limit, 0);

    const totalSpent = categoryBudgetData
      .filter(c => c.hasBudget)
      .reduce((acc, c) => acc + c.spent, 0);

    const remaining = totalBudget - totalSpent;
    const globalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return { totalBudget, totalSpent, remaining, globalPercentage };
  }, [categoryBudgetData]);

  const handleOpenModal = (catName = '', currentLimit = '') => {
    setFormData({
      categoryName: catName || categories.find(c => c.type === 'expense')?.name || '',
      limitAmount: currentLimit ? String(currentLimit) : ''
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.categoryName || !formData.limitAmount) return;

    saveBudget({
      categoryName: formData.categoryName,
      limitAmount: formData.limitAmount
    });

    setModalOpen(false);
  };

  const categorySelectOptions = categories
    .filter(c => c.type === 'expense')
    .map(c => ({ value: c.name, label: c.name }));

  const glowGradient = entityType === 'PF'
    ? 'from-indigo-600/15 via-purple-600/5 to-transparent'
    : 'from-emerald-600/15 via-teal-600/5 to-transparent';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-7 relative"
    >
      <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-4/5 h-64 bg-gradient-to-b ${glowGradient} blur-3xl pointer-events-none -z-10`} />

      {/* TOPO DA TELA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target size={22} className={theme.primary} />
            Metas & Tetos de Gastos ({entityType === 'PF' ? 'Pessoal' : 'Empresa'})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Defina limites para suas categorias e visualize o consumo em tempo real.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => handleOpenModal()}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white shadow-lg transition ${theme.bgPrimary} ${theme.bgHover}`}
        >
          <Plus size={16} /> Estipular Nova Meta
        </motion.button>
      </div>

      {/* PAINEL HERO COM ANEL COCKPIT & SPOTLIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <SpotlightCard className="lg:col-span-8 p-7 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Consumo Geral do Orçamento</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {hideValues ? '••••••••' : formatCurrency(totals.totalSpent)}
              <span className="text-sm font-normal text-slate-500 block sm:inline sm:ml-2">
                de {formatCurrency(totals.totalBudget)} orçados
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {totals.remaining >= 0 ? (
                <>Margem restante: <b className="text-emerald-400 font-mono">{formatCurrency(totals.remaining)}</b></>
              ) : (
                <>Teto ultrapassado em: <b className="text-rose-400 font-mono">{formatCurrency(Math.abs(totals.remaining))}</b></>
              )}
            </p>
          </div>

          <BudgetRing percentage={totals.globalPercentage} />
        </SpotlightCard>

        <SpotlightCard className="lg:col-span-4 p-7 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status de Disciplina</span>
            <div className="flex items-center gap-2 pt-1">
              {totals.globalPercentage > 100 ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
                  <AlertTriangle size={14} /> Teto Estourado
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  <CheckCircle2 size={14} /> Orçamento Saudável
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {totals.globalPercentage > 100 
                ? 'Algumas categorias ultrapassaram o teto estipulado para o ciclo atual.'
                : 'Você está gastando dentro dos limites planejados para o mês.'}
            </p>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-white/[0.06]">
            {categoryBudgetData.filter(c => c.hasBudget).length} categorias com teto configurado
          </div>
        </SpotlightCard>
      </div>

      {/* BARRAS DE CATEGORIAS COM SPOTLIGHT */}
      <div className="p-7 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-5">
        <h3 className="text-base font-bold text-white">Progresso Individual por Categoria</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryBudgetData.map(item => {
            const isOverBudget = item.percentage > 100;
            const isWarning = item.percentage >= 75 && !isOverBudget;

            return (
              <SpotlightCard 
                key={item.categoryName}
                className="p-5 rounded-2xl bg-slate-950/70 border border-white/[0.08] space-y-3 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-white">{item.categoryName}</h4>
                    <span className="text-xs text-slate-400">
                      {item.hasBudget ? (
                        <>Teto: <b className="text-slate-300 font-mono">{formatCurrency(item.limit)}</b></>
                      ) : (
                        <span className="text-slate-500 italic">Sem teto configurado</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.hasBudget && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        isOverBudget 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                          : isWarning 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {item.percentage.toFixed(0)}%
                      </span>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => handleOpenModal(item.categoryName, item.limit)}
                      className="p-1.5 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-white transition"
                    >
                      <Edit3 size={14} />
                    </motion.button>
                  </div>
                </div>

                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/[0.06] p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, item.percentage)}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full ${
                      !item.hasBudget ? 'bg-slate-700' : isOverBudget ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : theme.bgPrimary
                    }`} 
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-400 font-mono pt-0.5">
                  <span>Gasto: <b className="text-slate-200">{formatCurrency(item.spent)}</b></span>
                  {item.hasBudget && (
                    <span className={isOverBudget ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                      {isOverBudget ? `Estourou ${formatCurrency(Math.abs(item.remaining))}` : `Resta ${formatCurrency(item.remaining)}`}
                    </span>
                  )}
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>

      {/* MODAL CONFIGURAR META (COM CUSTOMSELECT E SETAS ELEGANTES) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl"
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target size={18} className={theme.primary} /> Configurar Teto da Categoria
              </h3>

              <form onSubmit={handleSave} className="space-y-3.5">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Categoria de Despesa</label>
                  <CustomSelect
                    options={categorySelectOptions}
                    value={formData.categoryName}
                    onChange={(val) => setFormData({ ...formData, categoryName: val })}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Teto Máximo Mensal (R$)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      placeholder="Ex: 1500,00"
                      value={formData.limitAmount}
                      onChange={e => setFormData({ ...formData, limitAmount: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-3.5 pr-8 py-2.5 text-sm text-white focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col">
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, limitAmount: (parseFloat(formData.limitAmount || 0) + 100).toFixed(2) })}
                        className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition"
                      >
                        <ChevronUp size={11} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, limitAmount: Math.max(0, parseFloat(formData.limitAmount || 0) - 100).toFixed(2) })}
                        className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition"
                      >
                        <ChevronDown size={11} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
                  <button type="submit" className={`px-5 py-2 rounded-2xl text-xs font-semibold text-white ${theme.bgPrimary}`}>Salvar Meta</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

export default MetasTab;