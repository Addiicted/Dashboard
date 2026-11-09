// components/CartoesTab.js
'use client';

import React, { useState, useMemo } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import CustomSelect from '@/components/CustomSelect';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  RotateCcw, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronUp
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

function CircularLimitRing({ percentage }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, percentage) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} className="stroke-slate-900" strokeWidth="8" fill="transparent" />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          className={percentage > 85 ? 'stroke-rose-500' : percentage > 50 ? 'stroke-amber-400' : 'stroke-indigo-500'}
          strokeWidth="8"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-base font-extrabold text-white font-mono">{percentage.toFixed(0)}%</span>
        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Usado</span>
      </div>
    </div>
  );
}

function CartoesTab() {
  const { 
    entityType,
    theme, 
    hideValues,
    cards, 
    accounts, 
    categories, 
    cardExpenses, 
    addCardExpense, 
    deleteCardExpense,
    getInvoiceData,
    closeInvoice,
    reopenInvoice,
    payInvoice,
    revertInvoicePayment
  } = useFinancial();

  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id || '');
  const activeCard = cards.find(c => c.id === selectedCardId) || cards[0];

  const currentYear = 2026;
  const [currentMonth, setCurrentMonth] = useState(11);

  const formatMonthYear = (y, m) => `${y}-${String(m).padStart(2, '0')}`;
  const selectedInvoiceKey = formatMonthYear(currentYear, currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => prev === 1 ? 12 : prev - 1);
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => prev === 12 ? 1 : prev + 1);
  };

  const invoiceExpenses = useMemo(() => {
    if (!activeCard) return [];
    return cardExpenses.filter(e => e.cardId === activeCard.id && e.invoiceMonthYear === selectedInvoiceKey);
  }, [cardExpenses, activeCard, selectedInvoiceKey]);

  const currentInvoice = useMemo(() => {
    if (!activeCard) return null;
    return getInvoiceData(activeCard.id, selectedInvoiceKey);
  }, [getInvoiceData, activeCard, selectedInvoiceKey]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    desc: '',
    confirmText: '',
    confirmColor: '',
    onConfirm: null
  });

  const [formData, setFormData] = useState({
    desc: '',
    totalAmount: '',
    installmentsCount: 1,
    categoryId: categories[0]?.id || '',
    subcategory: categories[0]?.subcategories?.[0] || 'Geral',
    date: '2026-11-06'
  });

  const [closeAdjustmentAmount, setCloseAdjustmentAmount] = useState(0);

  const [payFormData, setPayFormData] = useState({
    payingAccountId: activeCard?.payingAccountId || accounts[0]?.id || '',
    date: '2026-11-06'
  });

  const handleOpenCloseModal = () => {
    setCloseAdjustmentAmount(currentInvoice?.rawSum || 0);
    setShowCloseModal(true);
  };

  const handleOpenPayModal = () => {
    setPayFormData({
      payingAccountId: currentInvoice?.payingAccountId || activeCard?.payingAccountId || accounts[0]?.id || '',
      date: '2026-11-06'
    });
    setShowPayModal(true);
  };

  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!formData.desc || !formData.totalAmount || !activeCard) return;

    const totalVal = parseFloat(formData.totalAmount);
    const installments = parseInt(formData.installmentsCount) || 1;
    const valuePerParcel = totalVal / installments;
    const selectedCategory = categories.find(c => c.id === formData.categoryId);

    if (installments === 1) {
      addCardExpense({
        cardId: activeCard.id,
        desc: formData.desc,
        amount: totalVal,
        installment: 'À vista',
        category: selectedCategory?.name || 'Outros',
        subcategory: formData.subcategory,
        date: formData.date,
        invoiceMonthYear: selectedInvoiceKey
      });
    } else {
      let startYear = currentYear;
      let startMonth = currentMonth;

      for (let i = 1; i <= installments; i++) {
        const parcelInvoiceKey = formatMonthYear(startYear, startMonth);
        addCardExpense({
          cardId: activeCard.id,
          desc: formData.desc,
          amount: valuePerParcel,
          installment: `${i} de ${installments}`,
          category: selectedCategory?.name || 'Outros',
          subcategory: formData.subcategory,
          date: formData.date,
          invoiceMonthYear: parcelInvoiceKey
        });

        startMonth++;
        if (startMonth > 12) {
          startMonth = 1;
          startYear++;
        }
      }
    }

    setShowAddModal(false);
    setFormData({
      desc: '',
      totalAmount: '',
      installmentsCount: 1,
      categoryId: categories[0]?.id || '',
      subcategory: categories[0]?.subcategories?.[0] || 'Geral',
      date: '2026-11-06'
    });
  };

  const handleConfirmClose = (e) => {
    e.preventDefault();
    closeInvoice({
      cardId: activeCard.id,
      invoiceMonthYear: selectedInvoiceKey,
      finalAmount: closeAdjustmentAmount
    });
    setShowCloseModal(false);
  };

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    payInvoice({
      cardId: activeCard.id,
      invoiceMonthYear: selectedInvoiceKey,
      payingAccountId: payFormData.payingAccountId,
      date: payFormData.date,
      finalAmount: currentInvoice.finalAmount
    });
    setShowPayModal(false);
  };

  const currentInvoiceVal = currentInvoice?.status !== 'paga' ? currentInvoice?.finalAmount || 0 : 0;
  const usedPercentage = Math.min(100, (currentInvoiceVal / Number(activeCard?.limitTotal || 1)) * 100);

  const glowGradient = entityType === 'PF'
    ? 'from-indigo-600/15 via-purple-600/5 to-transparent'
    : 'from-emerald-600/15 via-teal-600/5 to-transparent';

  const cardSelectOptions = cards.map(c => ({
    value: c.id,
    label: `${c.name} (•••• ${c.lastDigits})`
  }));

  const accountPayModalOptions = accounts.map(a => ({
    value: a.id,
    label: `${a.name} (${a.bank})`,
    color: a.color
  }));

  const categoryModalOptions = categories.map(c => ({
    value: c.id,
    label: c.name
  }));

  const selectedCategoryObj = categories.find(c => c.id === formData.categoryId);
  const subcategoryModalOptions = (
    selectedCategoryObj?.subcategories || ['Geral']
  ).map(sub => ({ value: sub, label: sub }));

  const installmentsOptions = [
    { value: 1, label: 'À vista (1x)' },
    ...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map(n => ({ value: n, label: `${n}x` }))
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-7 relative"
    >
      <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-4/5 h-64 bg-gradient-to-b ${glowGradient} blur-3xl pointer-events-none -z-10`} />

      {/* SELETOR COMPACTO NO TOPO */}
      {cards.length > 1 && (
        <div className="w-72">
          <CustomSelect
            options={cardSelectOptions}
            value={selectedCardId}
            onChange={(val) => setSelectedCardId(val)}
            icon={CreditCard}
          />
        </div>
      )}

      {/* CARTÃO & MÉTRICAS COM SPOTLIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <SpotlightCard className="lg:col-span-5 p-7 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 border border-white/[0.12] shadow-2xl backdrop-blur-2xl flex flex-col justify-between min-h-[235px]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">{activeCard.name}</h3>
            </div>
            <div className={`p-2.5 rounded-2xl ${theme.badge} border shadow-inner`}>
              <CreditCard size={22} className={theme.primary} />
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 border border-amber-300/60 shadow-inner flex items-center justify-center p-0.5">
              <div className="w-full h-full border border-amber-600/40 rounded-[2px] grid grid-cols-2 gap-0.5 opacity-60">
                <div className="border-r border-b border-amber-700/40" /><div className="border-b border-amber-700/40" /><div className="border-r border-amber-700/40" /><div />
              </div>
            </div>

            <div className="text-slate-400 rotate-90 scale-90">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M8.5 16.5a5 5 0 0 1 0-9" /><path d="M12 19a8.5 8.5 0 0 0 0-14" /><path d="M15.5 21.5a12 12 0 0 0 0-19" />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <div className="font-mono text-slate-200 text-sm tracking-[0.25em] font-bold">
              •••• •••• •••• {activeCard.lastDigits || '0000'}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider pt-2 border-t border-white/[0.08]">
              <span>Fecha: Dia {activeCard.closingDay}</span>
              <span className="text-white">Vence: Dia {activeCard.dueDay}</span>
            </div>
          </div>
        </SpotlightCard>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SpotlightCard className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total da Fatura</span>
                <span className="text-[10px] font-mono text-slate-500">Ciclo {selectedInvoiceKey}</span>
              </div>
              <div className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums mt-1">
                {hideValues ? '••••••••' : formatCurrency(currentInvoice?.finalAmount || 0)}
              </div>
            </div>
            <div className="pt-2 border-t border-white/[0.06] text-xs">
              {currentInvoice?.status === 'paga' ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1.5"><CheckCircle2 size={14} /> Fatura quitada</span>
              ) : (
                <span className="text-amber-400 font-medium flex items-center gap-1.5"><Clock size={14} /> Aguardando quitação</span>
              )}
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl flex flex-col justify-between space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status Atual</span>
            <div>
              {currentInvoice?.status === 'paga' && (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> PAGA
                </span>
              )}
              {currentInvoice?.status === 'fechada' && (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
                  <Lock size={13} /> FECHADA
                </span>
              )}
              {currentInvoice?.status === 'aberta' && (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm">
                  <Clock size={13} /> ABERTA
                </span>
              )}
            </div>
            <div className="pt-2 border-t border-white/[0.06] text-xs text-slate-400">
              Limite: <b className="text-white font-mono">{formatCurrency(activeCard.limitTotal)}</b>
            </div>
          </SpotlightCard>

          <SpotlightCard className="sm:col-span-2 p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl flex items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-300">Limite Consumido no Ciclo</span>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {formatCurrency(currentInvoiceVal)} <span className="text-xs text-slate-500 font-normal">de {formatCurrency(activeCard.limitTotal)}</span>
              </div>
              <span className="text-emerald-400 text-xs font-medium font-mono block pt-1">
                Disponível: {formatCurrency(Math.max(0, Number(activeCard.limitTotal) - currentInvoiceVal))}
              </span>
            </div>

            <CircularLimitRing percentage={usedPercentage} />
          </SpotlightCard>
        </div>
      </div>

      {/* CARROSSEL DE FATURAS */}
      <SpotlightCard className="p-7 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.92 }} type="button" onClick={handlePrevMonth} className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-white/[0.06] text-slate-300 transition">
              <ChevronLeft size={16} />
            </motion.button>
            <div className="text-center px-4">
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Ciclo da Fatura</div>
              <div className="text-lg font-bold text-white capitalize mt-0.5">
                {new Date(currentYear, currentMonth - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.92 }} type="button" onClick={handleNextMonth} className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-white/[0.06] text-slate-300 transition">
              <ChevronRight size={16} />
            </motion.button>
          </div>

          <div className="flex items-center gap-3">
            {currentInvoice?.status === 'aberta' && (
              <>
                <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-white border border-white/[0.08]">
                  <Plus size={15} /> Adicionar Compra
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={handleOpenCloseModal} disabled={currentInvoice.rawSum <= 0} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white ${currentInvoice.rawSum > 0 ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-800 text-slate-500'}`}>
                  <Lock size={15} /> Fechar Fatura
                </motion.button>
              </>
            )}

            {currentInvoice?.status === 'fechada' && (
              <>
                <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => reopenInvoice(activeCard.id, selectedInvoiceKey)} className="px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-slate-800/80 text-slate-300 border border-white/[0.08]">
                  <Unlock size={14} className="inline mr-1" /> Reabrir
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={handleOpenPayModal} className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 size={15} /> Pagar Fatura ({formatCurrency(currentInvoice.finalAmount)})
                </motion.button>
              </>
            )}

            {currentInvoice?.status === 'paga' && (
              <>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 size={15} /> Paga em {formatDate(currentInvoice.paidDate)}
                </div>
                <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => {
                  setConfirmModal({
                    open: true,
                    title: 'Desfazer Pagamento da Fatura?',
                    desc: 'A fatura voltará a ficar como pendente no extrato bancário.',
                    confirmText: 'Sim, Desfazer',
                    confirmColor: 'bg-amber-600 hover:bg-amber-700',
                    onConfirm: () => {
                      revertInvoicePayment(activeCard.id, selectedInvoiceKey);
                      setConfirmModal({ open: false });
                    }
                  });
                }} className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold bg-slate-800/80 text-slate-300 border border-white/[0.08]">
                  <RotateCcw size={13} /> Desfazer Pagamento
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* LISTA DE COMPRAS */}
        <div className="space-y-2">
          {invoiceExpenses.length === 0 ? (
            <div className="py-14 text-center text-slate-500 text-xs">Nenhuma compra nesta fatura.</div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {invoiceExpenses.map(item => (
                <div key={item.id} className="py-3.5 flex items-center justify-between hover:bg-white/[0.02] px-3 rounded-2xl transition">
                  <div className="space-y-1">
                    <div className="font-semibold text-sm text-slate-200">{item.desc}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{formatDate(item.date)}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800/90 border border-white/[0.08] text-[11px] font-medium text-slate-300">
                        {item.installment}
                      </span>
                      <span>•</span>
                      <span>{item.category} ({item.subcategory})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-sm text-white font-mono tabular-nums">{formatCurrency(item.amount)}</span>
                    {currentInvoice?.status !== 'paga' && (
                      <button type="button" onClick={() => {
                        setConfirmModal({
                          open: true,
                          title: `Excluir "${item.desc}"?`,
                          desc: 'A compra será removida desta fatura e o limite liberado.',
                          confirmText: 'Excluir Compra',
                          confirmColor: 'bg-rose-600',
                          onConfirm: () => {
                            deleteCardExpense(item.id);
                            setConfirmModal({ open: false });
                          }
                        });
                      }} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SpotlightCard>

      {/* MODAL FECHAR */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock size={18} className="text-amber-400" /> Fechar Fatura ({selectedInvoiceKey})
            </h3>
            <p className="text-xs text-slate-400">Total somado: <b>{formatCurrency(currentInvoice.rawSum)}</b>. Ajuste se necessário:</p>
            <form onSubmit={handleConfirmClose} className="space-y-3.5">
              <div className="relative">
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  value={closeAdjustmentAmount}
                  onChange={e => setCloseAdjustmentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-3.5 pr-8 py-2.5 text-base font-bold text-white focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                  <button type="button" onClick={() => setCloseAdjustmentAmount(prev => (parseFloat(prev || 0) + 1).toFixed(2))} className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"><ChevronUp size={12} /></button>
                  <button type="button" onClick={() => setCloseAdjustmentAmount(prev => Math.max(0, parseFloat(prev || 0) - 1).toFixed(2))} className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"><ChevronDown size={12} /></button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button type="button" onClick={() => setShowCloseModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Voltar</button>
                <button type="submit" className="px-5 py-2 rounded-2xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700">Confirmar Fechamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PAGAR (COM CUSTOMSELECT) */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" /> Pagar Fatura - {formatCurrency(currentInvoice.finalAmount)}
            </h3>
            <form onSubmit={handleConfirmPayment} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Conta Bancária Pagadora</label>
                <CustomSelect
                  options={accountPayModalOptions}
                  value={payFormData.payingAccountId}
                  onChange={(val) => setPayFormData({ ...payFormData, payingAccountId: val })}
                />
              </div>

              <input 
                type="date" 
                required 
                value={payFormData.date}
                onChange={e => setPayFormData({ ...payFormData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button type="button" onClick={() => setShowPayModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-2xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md">Confirmar Pagamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVA COMPRA (COM CUSTOMSELECT) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Lançar Compra no Cartão ({activeCard.name})</h3>
            <form onSubmit={handleSaveExpense} className="space-y-3.5">
              <input 
                type="text" 
                required 
                placeholder="Descrição (ex: Jantar, Monitor...)"
                value={formData.desc}
                onChange={e => setFormData({ ...formData, desc: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="Valor Total (R$)"
                    value={formData.totalAmount}
                    onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-3.5 pr-8 py-2.5 text-sm text-white focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col">
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, totalAmount: (parseFloat(prev.totalAmount || 0) + 1).toFixed(2) }))} className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"><ChevronUp size={11} /></button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, totalAmount: Math.max(0, parseFloat(prev.totalAmount || 0) - 1).toFixed(2) }))} className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"><ChevronDown size={11} /></button>
                  </div>
                </div>

                <CustomSelect
                  options={installmentsOptions}
                  value={formData.installmentsCount}
                  onChange={(val) => setFormData({ ...formData, installmentsCount: parseInt(val) || 1 })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  options={categoryModalOptions}
                  value={formData.categoryId}
                  onChange={(val) => {
                    const cat = categories.find(c => c.id === val);
                    setFormData({ 
                      ...formData, 
                      categoryId: val,
                      subcategory: cat?.subcategories?.[0] || 'Geral'
                    });
                  }}
                />

                <CustomSelect
                  options={subcategoryModalOptions}
                  value={formData.subcategory}
                  onChange={(val) => setFormData({ ...formData, subcategory: val })}
                />
              </div>

              <div>
                <input 
                  type="date" 
                  required 
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
                <button type="submit" className={`px-5 py-2 rounded-2xl text-xs font-semibold text-white ${theme.bgPrimary}`}>Salvar Compra</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAÇÃO (TODAS AS TAGS FECHADAS COM PERFEIÇÃO) */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400"><AlertCircle size={22} /></div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{confirmModal.title}</h3>
                <p className="text-xs text-slate-400">{confirmModal.desc}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <button type="button" onClick={() => setConfirmModal({ open: false })} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
              <button type="button" onClick={confirmModal.onConfirm} className={`px-5 py-2 rounded-xl text-xs font-semibold text-white ${confirmModal.confirmColor || 'bg-amber-600'}`}>{confirmModal.confirmText}</button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}

export default CartoesTab;