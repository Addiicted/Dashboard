// components/InvestimentosTab.js
'use client';

import React, { useState, useMemo } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { formatCurrency } from '@/utils/formatters';
import CustomSelect from '@/components/CustomSelect';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

const ASSET_COLORS = {
  'Renda Fixa': 'bg-emerald-500',
  'Ações': 'bg-indigo-500',
  'FIIs': 'bg-amber-400',
  'Cripto': 'bg-purple-500',
  'Internacional': 'bg-sky-400',
};

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

function InvestimentosTab() {
  const { 
    entityType, 
    theme, 
    hideValues, 
    investments, 
    addInvestment, 
    updateInvestment, 
    deleteInvestment 
  } = useFinancial();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

  const [formData, setFormData] = useState({
    name: '',
    type: 'Renda Fixa',
    investedAmount: '',
    currentAmount: ''
  });

  const totals = useMemo(() => {
    const totalInvested = investments.reduce((acc, i) => acc + Number(i.investedAmount || 0), 0);
    const totalCurrent = investments.reduce((acc, i) => acc + Number(i.currentAmount || 0), 0);
    const profitR$ = totalCurrent - totalInvested;
    const profitPercent = totalInvested > 0 ? (profitR$ / totalInvested) * 100 : 0;

    return { totalInvested, totalCurrent, profitR$, profitPercent };
  }, [investments]);

  const classAllocation = useMemo(() => {
    const map = {};
    investments.forEach(i => {
      map[i.type] = (map[i.type] || 0) + Number(i.currentAmount || 0);
    });

    return Object.entries(map).map(([type, amount]) => ({
      type,
      amount,
      percentage: totals.totalCurrent > 0 ? (amount / totals.totalCurrent) * 100 : 0,
      color: ASSET_COLORS[type] || 'bg-slate-500'
    })).sort((a, b) => b.amount - a.amount);
  }, [investments, totals.totalCurrent]);

  const handleOpenModal = (inv = null) => {
    if (inv) {
      setEditingId(inv.id);
      setFormData({
        name: inv.name,
        type: inv.type,
        investedAmount: String(inv.investedAmount),
        currentAmount: String(inv.currentAmount)
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        type: 'Renda Fixa',
        investedAmount: '',
        currentAmount: ''
      });
    }
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.investedAmount || !formData.currentAmount) return;

    const payload = {
      name: formData.name,
      type: formData.type,
      investedAmount: parseFloat(formData.investedAmount) || 0,
      currentAmount: parseFloat(formData.currentAmount) || 0
    };

    if (editingId) {
      updateInvestment(editingId, payload);
    } else {
      addInvestment(payload);
    }

    setModalOpen(false);
  };

  const assetTypeOptions = [
    { value: 'Renda Fixa', label: 'Renda Fixa (Tesouro, CDB, LCI)' },
    { value: 'Ações', label: 'Ações (Bolsa de Valores)' },
    { value: 'FIIs', label: 'Fundos Imobiliários (FIIs)' },
    { value: 'Cripto', label: 'Criptomoedas (Bitcoin, ETH)' },
    { value: 'Internacional', label: 'Internacional (ETFs, BDRs)' }
  ];

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

      {/* TOPO DA CARTEIRA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp size={22} className="text-emerald-400" />
            Carteira de Investimentos ({entityType === 'PF' ? 'Patrimônio Pessoal' : 'Reservas PJ'})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhe o rendimento real dos seus ativos, aportes e distribuição patrimonial.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition"
        >
          <Plus size={16} /> Novo Ativo / Aporte
        </motion.button>
      </div>

      {/* 4 CARDS DE KPIS COM SPOTLIGHT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpotlightCard className="p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-2">
          <span className="text-xs text-slate-400 font-medium">Patrimônio Atual</span>
          <div className="text-2xl font-bold text-white font-mono tracking-tight tabular-nums">
            {hideValues ? '••••••••' : formatCurrency(totals.totalCurrent)}
          </div>
          <span className="text-[11px] text-slate-500 block">Valor de mercado atual</span>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-2">
          <span className="text-xs text-slate-400 font-medium">Total de Aportes</span>
          <div className="text-2xl font-bold text-slate-300 font-mono tracking-tight tabular-nums">
            {hideValues ? '••••••••' : formatCurrency(totals.totalInvested)}
          </div>
          <span className="text-[11px] text-slate-500 block">Custo original de compra</span>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-2">
          <span className="text-xs text-slate-400 font-medium">Rentabilidade (R$)</span>
          <div className={`text-2xl font-bold font-mono tracking-tight tabular-nums flex items-center gap-1 ${
            totals.profitR$ >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {totals.profitR$ >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
            {hideValues ? '••••••' : `${totals.profitR$ >= 0 ? '+' : ''}${formatCurrency(totals.profitR$)}`}
          </div>
          <span className="text-[11px] text-slate-500 block">Lucro / Rendimento absoluto</span>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-2">
          <span className="text-xs text-slate-400 font-medium">Retorno da Carteira (%)</span>
          <div className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
            totals.profitPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {totals.profitPercent >= 0 ? '+' : ''}{totals.profitPercent.toFixed(2)}%
          </div>
          <span className="text-[11px] text-slate-500 block">Rentabilidade percentual total</span>
        </SpotlightCard>
      </div>

      {/* BARRA DE ALOCAÇÃO APPLE WALLET */}
      <SpotlightCard className="p-7 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieChart size={18} className="text-indigo-400" /> Alocação de Ativos (Apple Wallet Style)
          </h3>
          <span className="text-xs text-slate-400">{investments.length} ativos cadastrados</span>
        </div>

        <div className="w-full h-4 rounded-full overflow-hidden flex gap-1 p-0.5 bg-slate-950 border border-white/[0.08] shadow-inner">
          {classAllocation.map(c => (
            <motion.div
              key={c.type}
              initial={{ width: 0 }}
              animate={{ width: `${c.percentage}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-full ${c.color} shadow-sm`}
              title={`${c.type}: ${c.percentage.toFixed(1)}%`}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-4 pt-1">
          {classAllocation.map(c => (
            <div key={c.type} className="flex items-center gap-2 text-xs">
              <span className={`w-3 h-3 rounded-full ${c.color} shadow-sm`} />
              <span className="text-slate-300 font-medium">{c.type}</span>
              <span className="text-slate-500 font-mono">({c.percentage.toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </SpotlightCard>

      {/* LISTA DE ATIVOS */}
      <div className="p-7 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-4">
        <h3 className="text-base font-bold text-white">Seus Ativos em Carteira</h3>

        <div className="divide-y divide-white/[0.06]">
          {investments.map(inv => {
            const profit = Number(inv.currentAmount) - Number(inv.investedAmount);
            const profitPct = Number(inv.investedAmount) > 0 ? (profit / Number(inv.investedAmount)) * 100 : 0;

            return (
              <div key={inv.id} className="py-4 flex items-center justify-between hover:bg-white/[0.02] px-3 rounded-2xl transition">
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-slate-200">{inv.name}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-800/80 border border-white/[0.08] text-[10px] font-bold text-slate-300">
                      {inv.type}
                    </span>
                    <span>•</span>
                    <span>Aporte original: {formatCurrency(inv.investedAmount)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <div className="font-bold text-sm text-white font-mono tabular-nums">
                      {hideValues ? '••••' : formatCurrency(inv.currentAmount)}
                    </div>
                    <div className={`text-[11px] font-mono font-bold tabular-nums ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {profit >= 0 ? '+' : ''}{formatCurrency(profit)} ({profitPct.toFixed(1)}%)
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => handleOpenModal(inv)}
                      className="p-1.5 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-white transition"
                    >
                      <Edit3 size={14} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => setDeleteConfirm({ open: true, id: inv.id, name: inv.name })}
                      className="p-1.5 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL ATIVO (COM CUSTOMSELECT E SETAS ELEGANTES) */}
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
                <TrendingUp size={18} className="text-emerald-400" />
                {editingId ? 'Atualizar Ativo' : 'Novo Ativo na Carteira'}
              </h3>

              <form onSubmit={handleSave} className="space-y-3.5">
                <input 
                  type="text" 
                  required 
                  placeholder="Nome do Ativo (ex: Tesouro Selic 2029, HGLG11...)"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />

                <CustomSelect
                  options={assetTypeOptions}
                  value={formData.type}
                  onChange={(val) => setFormData({ ...formData, type: val })}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      placeholder="Valor Aportado (R$)"
                      value={formData.investedAmount}
                      onChange={e => setFormData({ ...formData, investedAmount: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-3.5 pr-8 py-2.5 text-sm text-white focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col">
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, investedAmount: (parseFloat(formData.investedAmount || 0) + 100).toFixed(2) })}
                        className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition"
                      >
                        <ChevronUp size={11} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, investedAmount: Math.max(0, parseFloat(formData.investedAmount || 0) - 100).toFixed(2) })}
                        className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition"
                      >
                        <ChevronDown size={11} />
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      placeholder="Valor Atual (R$)"
                      value={formData.currentAmount}
                      onChange={e => setFormData({ ...formData, currentAmount: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-3.5 pr-8 py-2.5 text-sm text-white focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col">
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, currentAmount: (parseFloat(formData.currentAmount || 0) + 100).toFixed(2) })}
                        className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition"
                      >
                        <ChevronUp size={11} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, currentAmount: Math.max(0, parseFloat(formData.currentAmount || 0) - 100).toFixed(2) })}
                        className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition"
                      >
                        <ChevronDown size={11} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
                  <button type="submit" className="px-5 py-2 rounded-2xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700">Salvar Ativo</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL EXCLUSÃO */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Trash2 size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Excluir "{deleteConfirm.name}"?</h3>
                <p className="text-xs text-slate-400">O ativo será removido permanentemente da sua carteira.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <button type="button" onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
              <button type="button" onClick={() => {
                deleteInvestment(deleteConfirm.id);
                setDeleteConfirm({ open: false, id: null, name: '' });
              }} className="px-5 py-2 rounded-2xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700">Excluir</button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}

export default InvestimentosTab;