// components/ExtratoTab.js
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import CustomSelect from '@/components/CustomSelect';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeftRight, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  CreditCard, 
  AlertCircle, 
  X, 
  Calendar, 
  Layers, 
  Tag, 
  FileText, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

function SpotlightCard({ children, className = "", onClick = null }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-[1.01]' : ''} ${className}`}
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

function ExtratoTab() {
  const { 
    entityType, 
    theme, 
    hideValues,
    accounts, 
    categories, 
    cards, 
    transactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction, 
    toggleTransactionStatus, 
    addTransfer, 
    getInvoiceData, 
    payInvoice,
    extratoFilterType,
    setExtratoFilterType
  } = useFinancial();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('11');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [filterAccount, setFilterAccount] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    if (extratoFilterType) {
      setFilterType(extratoFilterType);
    }
  }, [extratoFilterType]);

  const [modalTx, setModalTx] = useState({ open: false, data: null });
  const [modalTransferOpen, setModalTransferOpen] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [selectedTxDetail, setSelectedTxDetail] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, title: '', desc: '', onConfirm: null });

  const [transferData, setTransferData] = useState({
    fromAccountId: accounts[0]?.id || '',
    toAccountId: accounts[1]?.id || '',
    amount: '',
    date: '2026-11-06',
    desc: 'Transferência entre contas'
  });

  const unifiedList = useMemo(() => {
    const monthKey = `${selectedYear}-${selectedMonth}`;

    const baseList = transactions.filter(t => {
      const txDate = t.date || '';
      const [year, month] = txDate.split('-');
      return year === selectedYear && month === selectedMonth;
    });

    const synthesizedInvoices = [];
    cards.forEach(card => {
      const hasLinkedTx = baseList.some(t => t.isInvoicePayment && t.cardId === card.id && t.invoiceMonthYear === monthKey);
      
      if (!hasLinkedTx) {
        const invData = getInvoiceData(card.id, monthKey);
        if (invData.finalAmount > 0) {
          synthesizedInvoices.push({
            id: `dyn_inv_${card.id}_${monthKey}`,
            isInvoicePayment: true,
            isSynthesized: true,
            cardId: card.id,
            invoiceMonthYear: monthKey,
            desc: `Fatura ${card.name} (${invData.status === 'fechada' ? 'Fechada' : 'Aberta'})`,
            amount: invData.finalAmount,
            type: 'expense',
            accountId: card.payingAccountId || accounts[0]?.id,
            category: 'Cartão de Crédito',
            subcategory: 'Fatura Mensal',
            status: 'pending',
            date: `${selectedYear}-${selectedMonth}-${String(card.dueDay).padStart(2, '0')}`,
            notes: 'Fatura prevista calculada dinamicamente'
          });
        }
      }
    });

    return [...synthesizedInvoices, ...baseList].filter(item => {
      if (searchQuery && !item.desc.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterType !== 'ALL' && item.type !== filterType) return false;
      if (filterAccount !== 'ALL' && item.accountId !== filterAccount) return false;
      if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
      return true;
    });
  }, [transactions, cards, selectedYear, selectedMonth, searchQuery, filterType, filterAccount, filterCategory, filterStatus, getInvoiceData, accounts]);

  const totals = useMemo(() => {
    const paidIncomes = unifiedList
      .filter(t => t.type === 'income' && t.status === 'paid')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    const paidExpenses = unifiedList
      .filter(t => t.type === 'expense' && t.status === 'paid')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    const pendingExpenses = unifiedList
      .filter(t => t.type === 'expense' && t.status === 'pending')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    return {
      paidIncomes,
      paidExpenses,
      clearedBalance: paidIncomes - paidExpenses,
      totalPendingToPay: pendingExpenses
    };
  }, [unifiedList]);

  const handleOpenNewModal = (type = 'expense') => {
    const defaultCat = categories.find(c => c.type === type) || categories[0];
    setModalTx({
      open: true,
      data: {
        desc: '',
        amount: '',
        type,
        accountId: accounts[0]?.id || '',
        category: defaultCat?.name || 'Geral',
        subcategory: defaultCat?.subcategories?.[0] || 'Outros',
        status: 'paid',
        date: '2026-11-06',
        notes: ''
      }
    });
  };

  const handleSaveTransaction = (e) => {
    e.preventDefault();
    if (!modalTx.data.desc || !modalTx.data.amount) return;

    const payload = {
      ...modalTx.data,
      amount: parseFloat(modalTx.data.amount) || 0
    };

    if (modalTx.data.id) {
      updateTransaction(modalTx.data.id, payload);
    } else {
      addTransaction(payload);
    }

    setModalTx({ open: false, data: null });
  };

  const handleSaveTransfer = (e) => {
    e.preventDefault();
    if (!transferData.amount || transferData.fromAccountId === transferData.toAccountId) {
      setTransferError('Selecione contas de origem e destino diferentes.');
      return;
    }

    setTransferError('');
    addTransfer(transferData);
    setModalTransferOpen(false);
    setTransferData({
      fromAccountId: accounts[0]?.id || '',
      toAccountId: accounts[1]?.id || '',
      amount: '',
      date: '2026-11-06',
      desc: 'Transferência entre contas'
    });
  };

  const glowGradient = entityType === 'PF'
    ? 'from-indigo-600/15 via-purple-600/5 to-transparent'
    : 'from-emerald-600/15 via-teal-600/5 to-transparent';

  // Opções para os novos CustomSelects de filtro
  const monthOptions = [
    { value: '01', label: 'Janeiro' }, { value: '02', label: 'Fevereiro' }, { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' }, { value: '05', label: 'Maio' }, { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' }, { value: '08', label: 'Agosto' }, { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' }, { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' }
  ];

  const yearOptions = [
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
    { value: '2027', label: '2027' }
  ];

  const accountFilterOptions = [
    { value: 'ALL', label: 'Todas as Contas' },
    ...accounts.map(a => ({ value: a.id, label: a.name, color: a.color }))
  ];

  const categoryFilterOptions = [
    { value: 'ALL', label: 'Todas Categorias' },
    ...categories.map(c => ({ value: c.name, label: c.name }))
  ];

  const statusFilterOptions = [
    { value: 'ALL', label: 'Todos os Status' },
    { value: 'paid', label: 'Somente Pagos' },
    { value: 'pending', label: 'Somente Pendentes' }
  ];

  const accountModalOptions = accounts.map(a => ({
    value: a.id,
    label: `${a.name} (${a.bank})`,
    color: a.color
  }));

  const categoryModalOptions = categories.map(c => ({
    value: c.name,
    label: c.name
  }));

  const subcategoryModalOptions = (
    categories.find(c => c.name === modalTx.data?.category)?.subcategories || ['Geral']
  ).map(sub => ({ value: sub, label: sub }));

  const statusModalOptions = [
    { value: 'paid', label: 'Efetivado (Pago)' },
    { value: 'pending', label: 'Pendente (Agendado)' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-7 relative"
    >
      <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-4/5 h-64 bg-gradient-to-b ${glowGradient} blur-3xl pointer-events-none -z-10 transition-all duration-700`} />

      {/* TOPO: AÇÕES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Extrato & Lançamentos ({entityType === 'PF' ? 'Pessoal' : 'Empresa'})</h2>
          <p className="text-xs text-slate-400 mt-0.5">Controle de receitas, despesas, transferências e notas.</p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => {
              setTransferError('');
              setModalTransferOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition"
          >
            <ArrowLeftRight size={14} className="text-indigo-400" /> Transferência Neutra
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => handleOpenNewModal('income')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition shadow-sm"
          >
            <Plus size={14} /> Nova Receita
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => handleOpenNewModal('expense')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition"
          >
            <Plus size={14} /> Nova Despesa
          </motion.button>
        </div>
      </div>

      {/* 4 CARDS RESUMO COM SPOTLIGHT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpotlightCard className="p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>Receitas Efetivadas</span>
            <ArrowUpRight size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tracking-tight tabular-nums">
            {hideValues ? '••••••' : `+ ${formatCurrency(totals.paidIncomes)}`}
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>Despesas Pagas</span>
            <ArrowDownRight size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono tracking-tight tabular-nums">
            {hideValues ? '••••••' : `- ${formatCurrency(totals.paidExpenses)}`}
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>Resultado do Período</span>
          </div>
          <div className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${totals.clearedBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {hideValues ? '••••••' : formatCurrency(totals.clearedBalance)}
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-500/20 shadow-[inset_0_1px_0_0_rgba(245,158,11,0.12)] backdrop-blur-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-amber-400 font-semibold">
            <span>Total a Pagar (Pendente)</span>
            <Clock size={15} />
          </div>
          <div className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${totals.totalPendingToPay > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {hideValues ? '••••••' : totals.totalPendingToPay > 0 ? `- ${formatCurrency(totals.totalPendingToPay)}` : 'R$ 0,00'}
          </div>
        </SpotlightCard>
      </div>

      {/* TOOLBAR COM CUSTOMSELECT (Adeus pop-up cinza nativo!) */}
      <SpotlightCard className="p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-3.5">
        
        {/* PÍLULAS DE FILTRO POR TIPO */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex bg-slate-950/90 p-1 rounded-2xl border border-white/[0.08]">
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'income', label: 'Receitas' },
              { id: 'expense', label: 'Despesas' },
              { id: 'transfer', label: 'Transferências' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilterType(tab.id);
                  setExtratoFilterType(tab.id);
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterType === tab.id
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-mono">
            {unifiedList.length} lançamentos encontrados
          </div>
        </div>

        {/* FILTROS USANDO O NOVO CUSTOMSELECT FLUTUANTE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="lg:col-span-2 relative">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por descrição..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/90 border border-white/[0.08] rounded-2xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
            />
          </div>

          <CustomSelect
            options={monthOptions}
            value={selectedMonth}
            onChange={(val) => setSelectedMonth(val)}
          />

          <CustomSelect
            options={yearOptions}
            value={selectedYear}
            onChange={(val) => setSelectedYear(val)}
          />

          <CustomSelect
            options={accountFilterOptions}
            value={filterAccount}
            onChange={(val) => setFilterAccount(val)}
          />

          <CustomSelect
            options={categoryFilterOptions}
            value={filterCategory}
            onChange={(val) => setFilterCategory(val)}
          />
        </div>
      </SpotlightCard>

      {/* TABELA COM GAVETA DESLIZANTE */}
      <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/90 text-slate-400 text-[10px] uppercase tracking-widest border-b border-white/[0.06]">
              <tr>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Data</th>
                <th className="py-4 px-5">Descrição</th>
                <th className="py-4 px-5">Conta</th>
                <th className="py-4 px-5">Categoria / Sub</th>
                <th className="py-4 px-5 text-right">Valor</th>
                <th className="py-4 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {unifiedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-500 text-xs">Nenhum lançamento encontrado.</td>
                </tr>
              ) : (
                unifiedList.map(t => {
                  const acc = accounts.find(a => a.id === t.accountId);
                  const isTransfer = t.type === 'transfer';
                  const isIncome = t.type === 'income';

                  return (
                    <tr 
                      key={t.id} 
                      onClick={() => setSelectedTxDetail(t)}
                      className={`cursor-pointer transition duration-150 group ${t.isInvoicePayment ? 'bg-amber-400/[0.03] hover:bg-amber-400/[0.07]' : 'hover:bg-white/[0.02]'}`}
                    >
                      <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          type="button"
                          onClick={() => {
                            if (t.isSynthesized) {
                              payInvoice({
                                cardId: t.cardId,
                                invoiceMonthYear: t.invoiceMonthYear,
                                payingAccountId: t.accountId,
                                date: t.date,
                                finalAmount: t.amount
                              });
                            } else {
                              toggleTransactionStatus(t.id);
                            }
                          }}
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl transition shadow-sm ${
                            t.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800/80 text-slate-400 border border-white/[0.08]'
                          }`}
                        >
                          {t.status === 'paid' ? (
                            <span className="inline-flex items-center gap-1.5">
                              <CheckCircle2 size={13} />
                              <span>Pago</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock size={13} />
                              <span>Pendente</span>
                            </span>
                          )}
                        </motion.button>
                      </td>

                      <td className="py-4 px-5 text-slate-400 font-mono text-xs tabular-nums">{formatDate(t.date)}</td>

                      <td className="py-4 px-5 font-semibold text-slate-200">
                        <div className="flex items-center gap-2">
                          {isTransfer && <ArrowLeftRight size={14} className="text-indigo-400 flex-shrink-0" />}
                          {t.isInvoicePayment && <CreditCard size={14} className="text-amber-400 flex-shrink-0" />}
                          <span>{t.desc}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-slate-300 text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${acc?.color || 'bg-slate-600'} flex-shrink-0 shadow-sm ring-2 ring-slate-900`} />
                          <span>{acc?.name || 'Conta Externa'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-slate-400 text-xs">
                        <span className="font-medium text-slate-300">{t.category}</span>
                        {t.subcategory && <span className="text-slate-500"> • {t.subcategory}</span>}
                      </td>

                      <td className={`py-4 px-5 text-right font-bold font-mono text-sm tabular-nums ${
                        isTransfer ? 'text-slate-400' : isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {hideValues ? '••••••' : `${isIncome ? '+' : isTransfer ? '' : '-'} ${formatCurrency(t.amount)}`}
                      </td>

                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                          {!t.isSynthesized && (
                            <>
                              <button
                                type="button"
                                onClick={() => setModalTx({ open: true, data: t })}
                                className="p-1.5 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-white"
                                title="Editar"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteConfirm({
                                    open: true,
                                    title: `Excluir "${t.desc}"?`,
                                    desc: 'Esta transação será removida permanentemente do extrato.',
                                    onConfirm: () => {
                                      deleteTransaction(t.id);
                                      setDeleteConfirm({ open: false });
                                    }
                                  });
                                }}
                                className="p-1.5 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-rose-400"
                                title="Excluir"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GAVETA LATERAL DESLIZANTE */}
      <AnimatePresence>
        {selectedTxDetail && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTxDetail(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-screen max-w-md bg-slate-900 border-l border-white/[0.08] shadow-2xl backdrop-blur-2xl p-7 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-white/[0.06]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Detalhes da Transação</span>
                    <button 
                      type="button" 
                      onClick={() => setSelectedTxDetail(null)}
                      className="p-1.5 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 font-medium">Valor Movimentado</span>
                    <div className={`text-3xl font-extrabold font-mono tracking-tight tabular-nums ${
                      selectedTxDetail.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {selectedTxDetail.type === 'income' ? '+' : '-'} {formatCurrency(selectedTxDetail.amount)}
                    </div>
                    <div className="text-lg font-bold text-white pt-1">{selectedTxDetail.desc}</div>
                  </div>

                  <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-white/[0.08] text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5"><Calendar size={13} /> Data:</span>
                      <span className="font-mono text-white font-bold">{formatDate(selectedTxDetail.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5"><Tag size={13} /> Categoria:</span>
                      <span className="text-white font-medium">{selectedTxDetail.category} ({selectedTxDetail.subcategory || 'Geral'})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5"><Layers size={13} /> Status:</span>
                      <span className={`font-bold ${selectedTxDetail.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {selectedTxDetail.status === 'paid' ? 'Efetivado (Pago)' : 'Pendente (Agendado)'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] space-y-1">
                      <span className="text-slate-400 flex items-center gap-1.5"><FileText size={13} /> Observações:</span>
                      <p className="text-slate-300 italic text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-white/[0.04]">
                        {selectedTxDetail.notes || 'Nenhuma observação informada.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setSelectedTxDetail(null)}
                    className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
                  >
                    Fechar Detalhes
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL TRANSAÇÃO (COM CUSTOMSELECT E SETAS ELEGANTES) */}
      {modalTx.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {modalTx.data.id ? 'Editar Lançamento' : modalTx.data.type === 'income' ? 'Nova Receita' : 'Nova Despesa'}
            </h3>
            <form onSubmit={handleSaveTransaction} className="space-y-3.5">
              <input 
                type="text" 
                required 
                placeholder="Descrição"
                value={modalTx.data.desc}
                onChange={e => setModalTx({ ...modalTx, data: { ...modalTx.data, desc: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="Valor (R$)"
                    value={modalTx.data.amount}
                    onChange={e => setModalTx({ ...modalTx, data: { ...modalTx.data, amount: e.target.value } })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-3.5 pr-8 py-2.5 text-sm text-white focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col">
                    <button 
                      type="button" 
                      onClick={() => setModalTx({ ...modalTx, data: { ...modalTx.data, amount: (parseFloat(modalTx.data.amount || 0) + 1).toFixed(2) } })}
                      className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition"
                    >
                      <ChevronUp size={11} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setModalTx({ ...modalTx, data: { ...modalTx.data, amount: Math.max(0, parseFloat(modalTx.data.amount || 0) - 1).toFixed(2) } })}
                      className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition"
                    >
                      <ChevronDown size={11} />
                    </button>
                  </div>
                </div>

                <CustomSelect
                  options={statusModalOptions}
                  value={modalTx.data.status}
                  onChange={(val) => setModalTx({ ...modalTx, data: { ...modalTx.data, status: val } })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  options={accountModalOptions}
                  value={modalTx.data.accountId}
                  onChange={(val) => setModalTx({ ...modalTx, data: { ...modalTx.data, accountId: val } })}
                />

                <input 
                  type="date" 
                  required 
                  value={modalTx.data.date}
                  onChange={e => setModalTx({ ...modalTx, data: { ...modalTx.data, date: e.target.value } })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  options={categoryModalOptions}
                  value={modalTx.data.category}
                  onChange={(val) => {
                    const cat = categories.find(c => c.name === val);
                    setModalTx({
                      ...modalTx,
                      data: {
                        ...modalTx.data,
                        category: val,
                        subcategory: cat?.subcategories?.[0] || 'Geral'
                      }
                    });
                  }}
                />

                <CustomSelect
                  options={subcategoryModalOptions}
                  value={modalTx.data.subcategory}
                  onChange={(val) => setModalTx({ ...modalTx, data: { ...modalTx.data, subcategory: val } })}
                />
              </div>

              <div>
                <input 
                  type="text" 
                  placeholder="Observações / Notas (opcional)"
                  value={modalTx.data.notes || ''}
                  onChange={e => setModalTx({ ...modalTx, data: { ...modalTx.data, notes: e.target.value } })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button type="button" onClick={() => setModalTx({ open: false, data: null })} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
                <button type="submit" className={`px-5 py-2 rounded-2xl text-xs font-semibold text-white ${theme.bgPrimary}`}>Salvar Transação</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TRANSFERÊNCIA (COM CUSTOMSELECT) */}
      {modalTransferOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ArrowLeftRight size={18} className="text-indigo-400" /> Transferência entre Contas
            </h3>
            {transferError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle size={15} /> <span>{transferError}</span>
              </div>
            )}
            <form onSubmit={handleSaveTransfer} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Conta de Origem</label>
                <CustomSelect
                  options={accountModalOptions}
                  value={transferData.fromAccountId}
                  onChange={(val) => setTransferData({ ...transferData, fromAccountId: val })}
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Conta de Destino</label>
                <CustomSelect
                  options={accountModalOptions}
                  value={transferData.toAccountId}
                  onChange={(val) => setTransferData({ ...transferData, toAccountId: val })}
                />
              </div>

              <div className="relative">
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  placeholder="Valor (R$)"
                  value={transferData.amount}
                  onChange={e => setTransferData({ ...transferData, amount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-3.5 pr-8 py-2.5 text-sm text-white focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col">
                  <button 
                    type="button" 
                    onClick={() => setTransferData({ ...transferData, amount: (parseFloat(transferData.amount || 0) + 1).toFixed(2) })}
                    className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition"
                  >
                    <ChevronUp size={11} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setTransferData({ ...transferData, amount: Math.max(0, parseFloat(transferData.amount || 0) - 1).toFixed(2) })}
                    className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition"
                  >
                    <ChevronDown size={11} />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button type="button" onClick={() => setModalTransferOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-2xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700">Efetivar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EXCLUSÃO */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Trash2 size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{deleteConfirm.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{deleteConfirm.desc}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <button type="button" onClick={() => setDeleteConfirm({ open: false })} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
              <button type="button" onClick={deleteConfirm.onConfirm} className="px-5 py-2 rounded-2xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700">Excluir</button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}

export default ExtratoTab;