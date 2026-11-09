// components/ConfiguracoesTab.js
'use client';

import React, { useState } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { formatCurrency } from '@/utils/formatters';
import CustomSelect from '@/components/CustomSelect';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Landmark, 
  CreditCard, 
  Tag, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  CornerDownRight, 
  Check, 
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  // 16 Ícones Modernos do Estúdio
  Home,
  Utensils,
  Car,
  Briefcase,
  HeartPulse,
  GraduationCap,
  Plane,
  Zap,
  ShoppingBag,
  Laptop,
  TrendingUp,
  DollarSign,
  Gift,
  Shield,
  Phone,
  Layers
} from 'lucide-react';

// Dicionário de Ícones
const ICON_MAP = {
  Home, Utensils, Car, Briefcase, HeartPulse, GraduationCap, Plane,
  Zap, ShoppingBag, Laptop, TrendingUp, DollarSign, Gift, Shield, Phone, Layers
};

const AVAILABLE_ICONS = [
  { name: 'Home', label: 'Moradia' },
  { name: 'Utensils', label: 'Alimentação' },
  { name: 'Car', label: 'Transporte' },
  { name: 'Briefcase', label: 'Trabalho' },
  { name: 'HeartPulse', label: 'Saúde' },
  { name: 'GraduationCap', label: 'Educação' },
  { name: 'Plane', label: 'Viagem' },
  { name: 'Zap', label: 'Serviços' },
  { name: 'ShoppingBag', label: 'Compras' },
  { name: 'Laptop', label: 'Tecnologia' },
  { name: 'TrendingUp', label: 'Investimentos' },
  { name: 'DollarSign', label: 'Renda' },
  { name: 'Gift', label: 'Presentes' },
  { name: 'Shield', label: 'Seguros' },
  { name: 'Phone', label: 'Comunicação' },
  { name: 'Layers', label: 'Geral' },
];

// Paleta de 10 Cores para os Ícones com Brilho Suave
const ICON_COLORS = [
  { name: 'indigo', label: 'Índigo', text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', circle: 'bg-indigo-500' },
  { name: 'emerald', label: 'Esmeralda', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', circle: 'bg-emerald-500' },
  { name: 'rose', label: 'Vermelho', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', circle: 'bg-rose-500' },
  { name: 'amber', label: 'Âmbar', text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', circle: 'bg-amber-400' },
  { name: 'purple', label: 'Roxo', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', circle: 'bg-purple-500' },
  { name: 'sky', label: 'Azul Céu', text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30', circle: 'bg-sky-400' },
  { name: 'pink', label: 'Pink', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', circle: 'bg-pink-500' },
  { name: 'teal', label: 'Verde Água', text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30', circle: 'bg-teal-500' },
  { name: 'orange', label: 'Laranja', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', circle: 'bg-orange-500' },
  { name: 'slate', label: 'Neutro', text: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/30', circle: 'bg-slate-400' },
];

const ACCOUNT_COLORS = [
  { label: 'Roxo (Nubank)', value: 'bg-purple-600' },
  { label: 'Laranja (Inter)', value: 'bg-orange-500' },
  { label: 'Azul (Itaú / Caixa)', value: 'bg-blue-600' },
  { label: 'Vermelho (Santander / Bradesco)', value: 'bg-rose-600' },
  { label: 'Amarelo (Banco do Brasil)', value: 'bg-amber-400' },
  { label: 'Verde (Sicredi / Sicoob)', value: 'bg-emerald-600' },
  { label: 'Azul Claro (C6 / Mercado Pago)', value: 'bg-sky-500' },
  { label: 'Rosa', value: 'bg-pink-600' },
  { label: 'Cinza / Neutro', value: 'bg-slate-600' },
  { label: 'Verde Água', value: 'bg-teal-500' },
];

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

function ConfiguracoesTab() {
  const { 
    entityType, 
    theme, 
    accounts, addAccount, updateAccount, deleteAccount,
    cards, addCard, updateCard, deleteCard,
    categories, addCategory, updateCategory, deleteCategory, addSubcategory, removeSubcategory,
    hideValues
  } = useFinancial();

  const [activeSubTab, setActiveSubTab] = useState('contas');

  const [modalAccount, setModalAccount] = useState({ open: false, data: null });
  const [modalCard, setModalCard] = useState({ open: false, data: null });

  // Modal Categoria com dados completos de Ícone, Cor e Subcategorias
  const [modalCategory, setModalCategory] = useState({ 
    open: false, 
    data: null, 
    subcatInput: '' 
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, title: '', desc: '', onConfirm: null });
  const [newSubcatInput, setNewSubcatInput] = useState({ catId: null, text: '' });

  const glowGradient = entityType === 'PF'
    ? 'from-indigo-600/15 via-purple-600/5 to-transparent'
    : 'from-emerald-600/15 via-teal-600/5 to-transparent';

  const accountSelectOptions = accounts.map(a => ({
    value: a.id,
    label: `${a.name} (${a.bank})`,
    color: a.color
  }));

  // Renderiza a Insígnia do Ícone Personalizado
  const renderIconBadge = (iconName, colorName, size = 18) => {
    const IconComp = ICON_MAP[iconName] || Tag;
    const colorObj = ICON_COLORS.find(c => c.name === colorName) || ICON_COLORS[0];

    return (
      <div className={`p-2.5 rounded-2xl ${colorObj.bg} ${colorObj.border} border shadow-sm ${colorObj.text} flex items-center justify-center flex-shrink-0`}>
        <IconComp size={size} />
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-7 relative"
    >
      <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-4/5 h-64 bg-gradient-to-b ${glowGradient} blur-3xl pointer-events-none -z-10`} />

      {/* TOPO: SELETOR DE SUB-ABAS COM PÍLULA MAC OS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Central de Configurações ({entityType === 'PF' ? 'Pessoal' : 'Empresa'})</h2>
          <p className="text-xs text-slate-400 mt-0.5">Gerencie contas bancárias, cores, cartões e o estúdio de categorias.</p>
        </div>

        <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl relative">
          {[
            { id: 'contas', label: `Contas (${accounts.length})`, icon: Landmark },
            { id: 'cartoes', label: `Cartões (${cards.length})`, icon: CreditCard },
            { id: 'categorias', label: `Categorias (${categories.length})`, icon: Tag }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 ${
                  isSelected ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeConfigSubTab"
                    className={`absolute inset-0 rounded-xl ${theme.bgPrimary} shadow-md`}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon size={14} className="relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 1. SUB-ABA: CONTAS ──────────────────────────────────── */}
      {activeSubTab === 'contas' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Contas bancárias ativas no contexto</span>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setModalAccount({ open: true, data: { name: '', bank: '', initialBalance: 0, color: 'bg-purple-600' } })}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-2xl text-white shadow-lg transition ${theme.bgPrimary} ${theme.bgHover}`}
            >
              <Plus size={15} /> Nova Conta Bancária
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.map(account => (
              <SpotlightCard 
                key={account.id} 
                className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${account.color || 'bg-slate-600'} shadow-md ring-2 ring-slate-900`} />
                    <div>
                      <h4 className="font-bold text-sm text-white">{account.name}</h4>
                      <span className="text-[11px] text-slate-400">{account.bank}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={() => setModalAccount({ open: true, data: { ...account, color: account.color || 'bg-purple-600' } })}
                      className="p-1.5 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-white"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDeleteConfirm({
                        open: true,
                        title: `Excluir conta "${account.name}"?`,
                        desc: 'O saldo e histórico desta conta serão removidos.',
                        onConfirm: () => {
                          deleteAccount(account.id);
                          setDeleteConfirm({ open: false });
                        }
                      })}
                      className="p-1.5 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Saldo Inicial Registrado</span>
                  <div className="text-lg font-bold text-white mt-0.5 font-mono tabular-nums">
                    {hideValues ? '••••••' : formatCurrency(account.initialBalance)}
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      )}

      {/* ── 2. SUB-ABA: CARTÕES ─────────────────────────────────── */}
      {activeSubTab === 'cartoes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Cartões de crédito com ciclo de fechamento</span>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setModalCard({ open: true, data: { name: '', lastDigits: '', limitTotal: 5000, closingDay: 20, dueDay: 1, payingAccountId: accounts[0]?.id || '' } })}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-2xl text-white shadow-lg transition ${theme.bgPrimary} ${theme.bgHover}`}
            >
              <Plus size={15} /> Novo Cartão de Crédito
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map(card => {
              const payingAcc = accounts.find(a => a.id === card.payingAccountId);
              return (
                <SpotlightCard 
                  key={card.id} 
                  className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final •••• {card.lastDigits || '0000'}</span>
                      <h4 className="font-bold text-base text-white">{card.name}</h4>
                      <span className="text-xs text-slate-400">Paga pela conta: <b className="text-slate-300">{payingAcc?.name || 'Não vinculada'}</b></span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button 
                        type="button"
                        onClick={() => setModalCard({ open: true, data: card })}
                        className="p-1.5 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-white"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setDeleteConfirm({
                          open: true,
                          title: `Excluir cartão "${card.name}"?`,
                          desc: 'O cartão será removido do sistema.',
                          onConfirm: () => {
                            deleteCard(card.id);
                            setDeleteConfirm({ open: false });
                          }
                        })}
                        className="p-1.5 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/70 border border-white/[0.06] text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">LIMITE TOTAL</span>
                      <span className="font-bold text-white font-mono tabular-nums">
                        {hideValues ? '••••' : formatCurrency(card.limitTotal)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">FECHAMENTO</span>
                      <span className="font-semibold text-slate-300">Dia {card.closingDay}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">VENCIMENTO</span>
                      <span className="font-semibold text-slate-300">Dia {card.dueDay}</span>
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. SUB-ABA: CATEGORIAS COM O NOVO ESTÚDIO VISUAL ─────── */}
      {activeSubTab === 'categorias' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Categorias principais, ícones personalizados e subcategorias</span>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setModalCategory({ 
                open: true, 
                data: { 
                  name: '', 
                  type: 'expense', 
                  icon: 'ShoppingBag', 
                  iconColor: 'indigo', 
                  subcategories: [] 
                }, 
                subcatInput: '' 
              })}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-2xl text-white shadow-lg transition ${theme.bgPrimary} ${theme.bgHover}`}
            >
              <Plus size={15} /> Nova Categoria no Estúdio
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(category => (
              <SpotlightCard key={category.id} className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-4">
                
                {/* Topo do Card com Ícone Personalizado & Tag */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {renderIconBadge(category.icon || 'Tag', category.iconColor || 'indigo', 20)}
                    <div>
                      <h4 className="font-bold text-base text-white">{category.name}</h4>
                      <span className="text-xs text-slate-500">{category.subcategories?.length || 0} subcategorias</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase border flex items-center gap-1 ${
                      category.type === 'income' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {category.type === 'income' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {category.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>

                    <button 
                      type="button"
                      onClick={() => setModalCategory({ 
                        open: true, 
                        data: { 
                          ...category, 
                          icon: category.icon || 'Tag', 
                          iconColor: category.iconColor || 'indigo', 
                          subcategories: [...(category.subcategories || [])] 
                        }, 
                        subcatInput: '' 
                      })}
                      className="p-1.5 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-white"
                      title="Editar Categoria"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDeleteConfirm({
                        open: true,
                        title: `Excluir categoria "${category.name}"?`,
                        desc: 'Todas as subcategorias vinculadas serão removidas.',
                        onConfirm: () => {
                          deleteCategory(category.id);
                          setDeleteConfirm({ open: false });
                        }
                      })}
                      className="p-1.5 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-rose-400"
                      title="Excluir Categoria"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Subcategorias em chips arredondados */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <div className="text-[11px] text-slate-400 font-medium">Subcategorias Vinculadas:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {category.subcategories?.map(sub => (
                      <span key={sub} className="inline-flex items-center gap-1.5 bg-slate-950/80 border border-white/[0.08] text-slate-300 text-xs px-2.5 py-1 rounded-xl shadow-sm">
                        <CornerDownRight size={11} className="text-slate-500" />
                        {sub}
                        <button 
                          type="button"
                          onClick={() => removeSubcategory(category.id, sub)}
                          className="text-slate-500 hover:text-rose-400 ml-0.5"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <input 
                      type="text" 
                      placeholder="+ Nova subcategoria..."
                      value={newSubcatInput.catId === category.id ? newSubcatInput.text : ''}
                      onChange={e => setNewSubcatInput({ catId: category.id, text: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newSubcatInput.text.trim()) {
                          addSubcategory(category.id, newSubcatInput.text.trim());
                          setNewSubcatInput({ catId: null, text: '' });
                        }
                      }}
                      className="bg-slate-950/90 border border-white/[0.08] rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 flex-1 shadow-inner"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (newSubcatInput.catId === category.id && newSubcatInput.text.trim()) {
                          addSubcategory(category.id, newSubcatInput.text.trim());
                          setNewSubcatInput({ catId: null, text: '' });
                        }
                      }}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-2xl font-medium transition"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

              </SpotlightCard>
            ))}
          </div>
        </div>
      )}

      {/* MODAL CONTA BANCÁRIA */}
      <AnimatePresence>
        {modalAccount.open && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full ${modalAccount.data?.color || 'bg-purple-600'} shadow-md`} />
                <h3 className="text-base font-bold text-white">
                  {modalAccount.data?.id ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
                </h3>
              </div>

              <form onSubmit={e => {
                e.preventDefault();
                if (modalAccount.data.id) {
                  updateAccount(modalAccount.data.id, modalAccount.data);
                } else {
                  addAccount(modalAccount.data);
                }
                setModalAccount({ open: false, data: null });
              }} className="space-y-3.5">
                
                <input 
                  type="text" 
                  required
                  placeholder="Nome da Conta (ex: Nubank Reserva)"
                  value={modalAccount.data.name}
                  onChange={e => setModalAccount({ ...modalAccount, data: { ...modalAccount.data, name: e.target.value } })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />

                <div>
                  <label className="text-xs text-slate-400 block mb-2">Cor da Conta</label>
                  <div className="flex flex-wrap gap-2.5 p-3 rounded-2xl bg-slate-950 border border-white/[0.08]">
                    {ACCOUNT_COLORS.map(c => {
                      const isSelected = modalAccount.data?.color === c.value;
                      return (
                        <button
                          type="button"
                          key={c.value}
                          onClick={() => setModalAccount({ ...modalAccount, data: { ...modalAccount.data, color: c.value } })}
                          className={`w-7 h-7 rounded-full ${c.value} transition-all flex items-center justify-center shadow-md ${
                            isSelected ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'
                          }`}
                          title={c.label}
                        >
                          {isSelected && <Check size={14} className="text-white drop-shadow" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <input 
                  type="text" 
                  required
                  placeholder="Instituição (Nubank, Itaú...)"
                  value={modalAccount.data.bank}
                  onChange={e => setModalAccount({ ...modalAccount, data: { ...modalAccount.data, bank: e.target.value } })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />

                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="Saldo Inicial (R$)"
                    value={modalAccount.data.initialBalance}
                    onChange={e => setModalAccount({ ...modalAccount, data: { ...modalAccount.data, initialBalance: parseFloat(e.target.value) || 0 } })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-3.5 pr-8 py-2.5 text-sm text-white focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col">
                    <button type="button" onClick={() => setModalAccount({ ...modalAccount, data: { ...modalAccount.data, initialBalance: (parseFloat(modalAccount.data.initialBalance || 0) + 100).toFixed(2) } })} className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"><ChevronUp size={11} /></button>
                    <button type="button" onClick={() => setModalAccount({ ...modalAccount, data: { ...modalAccount.data, initialBalance: Math.max(0, parseFloat(modalAccount.data.initialBalance || 0) - 100).toFixed(2) } })} className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"><ChevronDown size={11} /></button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                  <button type="button" onClick={() => setModalAccount({ open: false, data: null })} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
                  <button type="submit" className={`px-5 py-2 rounded-2xl text-xs font-semibold text-white ${theme.bgPrimary}`}>Salvar Conta</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CARTÃO */}
      <AnimatePresence>
        {modalCard.open && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl"
            >
              <h3 className="text-base font-bold text-white">
                {modalCard.data?.id ? 'Editar Cartão de Crédito' : 'Novo Cartão de Crédito'}
              </h3>
              <form onSubmit={e => {
                e.preventDefault();
                if (modalCard.data.id) {
                  updateCard(modalCard.data.id, modalCard.data);
                } else {
                  addCard(modalCard.data);
                }
                setModalCard({ open: false, data: null });
              }} className="space-y-3.5">
                <input 
                  type="text" 
                  required 
                  placeholder="Nome do Cartão"
                  value={modalCard.data.name}
                  onChange={e => setModalCard({ ...modalCard, data: { ...modalCard.data, name: e.target.value } })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    maxLength={4} 
                    placeholder="Últimos 4 dígitos"
                    value={modalCard.data.lastDigits}
                    onChange={e => setModalCard({ ...modalCard, data: { ...modalCard.data, lastDigits: e.target.value } })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />

                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      placeholder="Limite Total (R$)"
                      value={modalCard.data.limitTotal}
                      onChange={e => setModalCard({ ...modalCard, data: { ...modalCard.data, limitTotal: parseFloat(e.target.value) || 0 } })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-3.5 pr-8 py-2.5 text-sm text-white focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col">
                      <button type="button" onClick={() => setModalCard({ ...modalCard, data: { ...modalCard.data, limitTotal: (parseFloat(modalCard.data.limitTotal || 0) + 500).toFixed(2) } })} className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"><ChevronUp size={11} /></button>
                      <button type="button" onClick={() => setModalCard({ ...modalCard, data: { ...modalCard.data, limitTotal: Math.max(0, parseFloat(modalCard.data.limitTotal || 0) - 500).toFixed(2) } })} className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"><ChevronDown size={11} /></button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input 
                      type="number" 
                      min={1} 
                      max={31} 
                      placeholder="Dia Fechamento"
                      value={modalCard.data.closingDay}
                      onChange={e => setModalCard({ ...modalCard, data: { ...modalCard.data, closingDay: parseInt(e.target.value) || 1 } })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-3.5 pr-8 py-2.5 text-sm text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col">
                      <button type="button" onClick={() => setModalCard({ ...modalCard, data: { ...modalCard.data, closingDay: Math.min(31, (parseInt(modalCard.data.closingDay || 1) + 1)) } })} className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"><ChevronUp size={11} /></button>
                      <button type="button" onClick={() => setModalCard({ ...modalCard, data: { ...modalCard.data, closingDay: Math.max(1, (parseInt(modalCard.data.closingDay || 1) - 1)) } })} className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"><ChevronDown size={11} /></button>
                    </div>
                  </div>

                  <div className="relative">
                    <input 
                      type="number" 
                      min={1} 
                      max={31} 
                      placeholder="Dia Vencimento"
                      value={modalCard.data.dueDay}
                      onChange={e => setModalCard({ ...modalCard, data: { ...modalCard.data, dueDay: parseInt(e.target.value) || 1 } })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-3.5 pr-8 py-2.5 text-sm text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col">
                      <button type="button" onClick={() => setModalCard({ ...modalCard, data: { ...modalCard.data, dueDay: Math.min(31, (parseInt(modalCard.data.dueDay || 1) + 1)) } })} className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"><ChevronUp size={11} /></button>
                      <button type="button" onClick={() => setModalCard({ ...modalCard, data: { ...modalCard.data, dueDay: Math.max(1, (parseInt(modalCard.data.dueDay || 1) - 1)) } })} className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"><ChevronDown size={11} /></button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Conta Bancária Pagadora</label>
                  <CustomSelect
                    options={accountSelectOptions}
                    value={modalCard.data.payingAccountId}
                    onChange={(val) => setModalCard({ ...modalCard, data: { ...modalCard.data, payingAccountId: val } })}
                    placeholder="Selecione conta pagadora..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                  <button type="button" onClick={() => setModalCard({ open: false, data: null })} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
                  <button type="submit" className={`px-5 py-2 rounded-2xl text-xs font-semibold text-white ${theme.bgPrimary}`}>Salvar Cartão</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: O NOVO ESTÚDIO DE CATEGORIAS (ÍCONE + COR + SUBCATEGORIAS) ── */}
      <AnimatePresence>
        {modalCategory.open && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl my-6"
            >
              
              {/* Topo com Pré-visualização Ao Vivo */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  {renderIconBadge(modalCategory.data?.icon || 'ShoppingBag', modalCategory.data?.iconColor || 'indigo', 22)}
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {modalCategory.data?.id ? 'Editar no Estúdio' : 'Novo Estúdio de Categoria'}
                    </h3>
                    <span className="text-xs text-slate-400">Prévia ao vivo da insígnia</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase border ${
                  modalCategory.data?.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {modalCategory.data?.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
              </div>

              <form onSubmit={e => {
                e.preventDefault();
                if (modalCategory.data.id) {
                  updateCategory(modalCategory.data.id, modalCategory.data);
                } else {
                  addCategory(modalCategory.data);
                }
                setModalCategory({ open: false, data: null, subcatInput: '' });
              }} className="space-y-4">
                
                {/* 1. Tipo: Receita ou Despesa */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Tipo de Movimentação</label>
                  <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/[0.08] gap-1">
                    <button
                      type="button"
                      onClick={() => setModalCategory({ ...modalCategory, data: { ...modalCategory.data, type: 'expense' } })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        modalCategory.data.type === 'expense'
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ArrowDownRight size={14} /> Despesa (Saída)
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalCategory({ ...modalCategory, data: { ...modalCategory.data, type: 'income' } })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        modalCategory.data.type === 'income'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ArrowUpRight size={14} /> Receita (Entrada)
                    </button>
                  </div>
                </div>

                {/* 2. Nome da Categoria Livre */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nome da Categoria (Livre)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: Transporte, Alimentação, Assinaturas, Vendas..."
                    value={modalCategory.data.name}
                    onChange={e => setModalCategory({ ...modalCategory, data: { ...modalCategory.data, name: e.target.value } })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>

                {/* 3. Seletor de Ícones (16 opções) */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Escolha o Ícone</label>
                  <div className="grid grid-cols-8 gap-2 p-3 rounded-2xl bg-slate-950 border border-white/[0.08] max-h-36 overflow-y-auto">
                    {AVAILABLE_ICONS.map(item => {
                      const IconComp = ICON_MAP[item.name] || Tag;
                      const isSelected = modalCategory.data?.icon === item.name;

                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setModalCategory({ ...modalCategory, data: { ...modalCategory.data, icon: item.name } })}
                          className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-indigo-600 text-white shadow-lg scale-110' 
                              : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                          }`}
                          title={item.label}
                        >
                          <IconComp size={18} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Seletor de Cor do Ícone (10 cores) */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Escolha a Cor do Ícone</label>
                  <div className="flex flex-wrap gap-2.5 p-3 rounded-2xl bg-slate-950 border border-white/[0.08]">
                    {ICON_COLORS.map(colorObj => {
                      const isSelected = modalCategory.data?.iconColor === colorObj.name;

                      return (
                        <button
                          key={colorObj.name}
                          type="button"
                          onClick={() => setModalCategory({ ...modalCategory, data: { ...modalCategory.data, iconColor: colorObj.name } })}
                          className={`w-7 h-7 rounded-full ${colorObj.circle} transition-all flex items-center justify-center shadow-md ${
                            isSelected ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 hover:opacity-100 hover:scale-105'
                          }`}
                          title={colorObj.label}
                        >
                          {isSelected && <Check size={14} className="text-white drop-shadow" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Subcategorias Criadas Direto no Modal */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <label className="text-xs text-slate-400 block">Subcategorias desta Categoria</label>
                  
                  <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-2xl bg-slate-950 border border-white/[0.06]">
                    {modalCategory.data?.subcategories?.length === 0 ? (
                      <span className="text-xs text-slate-500 italic p-1">Nenhuma subcategoria adicionada ainda.</span>
                    ) : (
                      modalCategory.data?.subcategories?.map(sub => (
                        <span key={sub} className="inline-flex items-center gap-1.5 bg-slate-900 border border-white/[0.08] text-slate-200 text-xs px-2.5 py-1 rounded-xl shadow-sm">
                          {sub}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = modalCategory.data.subcategories.filter(s => s !== sub);
                              setModalCategory({ ...modalCategory, data: { ...modalCategory.data, subcategories: updated } });
                            }}
                            className="text-slate-500 hover:text-rose-400 ml-0.5"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Digite uma subcategoria e aperte Enter..."
                      value={modalCategory.subcatInput || ''}
                      onChange={e => setModalCategory({ ...modalCategory, subcatInput: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && modalCategory.subcatInput?.trim()) {
                          e.preventDefault();
                          const val = modalCategory.subcatInput.trim();
                          const currentSubs = modalCategory.data?.subcategories || [];
                          if (!currentSubs.includes(val)) {
                            setModalCategory({
                              ...modalCategory,
                              subcatInput: '',
                              data: { ...modalCategory.data, subcategories: [...currentSubs, val] }
                            });
                          }
                        }
                      }}
                      className="bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none flex-1"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (modalCategory.subcatInput?.trim()) {
                          const val = modalCategory.subcatInput.trim();
                          const currentSubs = modalCategory.data?.subcategories || [];
                          if (!currentSubs.includes(val)) {
                            setModalCategory({
                              ...modalCategory,
                              subcatInput: '',
                              data: { ...modalCategory.data, subcategories: [...currentSubs, val] }
                            });
                          }
                        }
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-2xl font-semibold transition"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                  <button type="button" onClick={() => setModalCategory({ open: false, data: null, subcatInput: '' })} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
                  <button type="submit" className={`px-5 py-2.5 rounded-2xl text-xs font-semibold text-white shadow-lg ${theme.bgPrimary}`}>Salvar Categoria no Estúdio</button>
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
                <AlertCircle size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{deleteConfirm.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{deleteConfirm.desc}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <button type="button" onClick={() => setDeleteConfirm({ open: false })} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
              <button type="button" onClick={deleteConfirm.onConfirm} className="px-5 py-2 rounded-2xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700">Confirmar Exclusão</button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}

export default ConfiguracoesTab;