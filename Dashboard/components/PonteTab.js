// components/PonteTab.js
'use client';

import React, { useState, useMemo } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import CustomSelect from '@/components/CustomSelect';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  ArrowRight, 
  Plus, 
  Building2, 
  User, 
  CheckCircle2, 
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  AlertCircle
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

function PonteTab() {
  const { 
    entityType, 
    theme, 
    hideValues, 
    rawAccounts, 
    transactions, 
    addBridgeTransfer 
  } = useFinancial();

  const pjAccounts = useMemo(() => rawAccounts.filter(a => a.entity === 'PJ'), [rawAccounts]);
  const pfAccounts = useMemo(() => rawAccounts.filter(a => a.entity === 'PF'), [rawAccounts]);

  const [modalOpen, setModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    desc: 'Retirada de Pró-labore',
    pjAccountId: pjAccounts[0]?.id || '',
    pfAccountId: pfAccounts[0]?.id || '',
    date: '2026-11-06'
  });

  const bridgeTransactions = useMemo(() => {
    return transactions.filter(t => t.category === 'Retirada / Pró-labore' || t.desc.toLowerCase().includes('pró-labore') || t.desc.toLowerCase().includes('ponte'));
  }, [transactions]);

  const totalBridgeMonth = useMemo(() => {
    return bridgeTransactions
      .filter(t => t.type === 'expense' && t.entity === 'PJ')
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [bridgeTransactions]);

  const handleSaveBridge = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.pjAccountId || !formData.pfAccountId) {
      setErrorMessage('Selecione as contas da PJ e da PF para transferir.');
      return;
    }

    setErrorMessage('');
    addBridgeTransfer({
      amount: formData.amount,
      desc: formData.desc,
      pjAccountId: formData.pjAccountId,
      pfAccountId: formData.pfAccountId,
      date: formData.date
    });

    setModalOpen(false);
    setFormData({
      amount: '',
      desc: 'Retirada de Pró-labore',
      pjAccountId: pjAccounts[0]?.id || '',
      pfAccountId: pfAccounts[0]?.id || '',
      date: '2026-11-06'
    });
  };

  const pjSelectOptions = pjAccounts.map(a => ({
    value: a.id,
    label: `${a.name} (${a.bank})`,
    color: a.color
  }));

  const pfSelectOptions = pfAccounts.map(a => ({
    value: a.id,
    label: `${a.name} (${a.bank})`,
    color: a.color
  }));

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

      {/* TOPO DA PONTE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <RefreshCw size={22} className="text-emerald-400" />
            A Ponte: Conexão Inteligente (Empresa PJ ↔ Pessoal PF)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transfira pró-labore e dividendos da sua empresa para a pessoa física em 1 clique sem duplicidade.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => {
            setErrorMessage('');
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition"
        >
          <Plus size={16} /> Nova Transferência da Ponte
        </motion.button>
      </div>

      {/* INFOGRÁFICO DE ENERGIA VIVA COM SPOTLIGHT */}
      <SpotlightCard className="p-7 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-slate-950/80 border border-white/[0.08] relative overflow-hidden">
          
          {/* Lado Empresa PJ */}
          <div className="flex items-center gap-3.5 z-10">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-md">
              <Building2 size={26} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Origem (Saída PJ)</span>
              <div className="font-bold text-white text-base">Empresa / Faturamento</div>
              <div className="text-xs text-slate-500">Registrado como Despesa Operacional</div>
            </div>
          </div>

          {/* Fluxo Central com Pulso Animado */}
          <div className="flex flex-col items-center z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Total Repassado no Mês</span>
            <div className="px-5 py-2 rounded-2xl bg-slate-900 border border-white/10 font-mono font-extrabold text-white text-base shadow-xl tabular-nums">
              {hideValues ? '••••••' : formatCurrency(totalBridgeMonth)}
            </div>

            <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-2 relative overflow-hidden hidden md:block">
              <motion.div 
                className="w-8 h-full bg-gradient-to-r from-emerald-400 to-indigo-400 rounded-full"
                animate={{ x: [-32, 128] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>

          {/* Lado Pessoa Física PF */}
          <div className="flex items-center gap-3.5 z-10">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-md">
              <User size={26} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Destino (Entrada PF)</span>
              <div className="font-bold text-white text-base">Pessoa Física / Seu Bolso</div>
              <div className="text-xs text-slate-500">Registrado como Receita de Pró-labore</div>
            </div>
          </div>

        </div>

        {/* Diagnóstico de Separação Patrimonial */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.06] flex items-start gap-3">
          <ShieldCheck size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-white">Separação Patrimonial 100% Blindada</div>
            <p className="text-slate-400 leading-relaxed">
              Ao usar a Ponte, o sistema mantém os lançamentos vinculados e perfeitamente rastreados. Você nunca mistura gastos de supermercado no extrato da empresa e mantém sua contabilidade limpa para impostos.
            </p>
          </div>
        </div>

      </SpotlightCard>

      {/* HISTÓRICO DE REPASSES */}
      <div className="p-7 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-4">
        <h3 className="text-base font-bold text-white">Histórico de Repasses (Pró-labore e Lucros)</h3>

        {bridgeTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Nenhuma transferência registrada pela Ponte ainda.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {bridgeTransactions.map(t => (
              <div key={t.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-white/[0.02] px-3 rounded-2xl transition">
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-slate-200">{t.desc}</div>
                  <div className="text-slate-500 flex items-center gap-2">
                    <span>{formatDate(t.date)}</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      t.entity === 'PJ' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {t.entity === 'PJ' ? 'Saída Empresa' : 'Entrada Pessoal'}
                    </span>
                  </div>
                </div>

                <div className={`font-bold font-mono text-sm tabular-nums ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {hideValues ? '••••••' : `${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DA PONTE (COM CUSTOMSELECT E SETAS ELEGANTES) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl"
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RefreshCw size={18} className="text-emerald-400" />
                Transferência Espelho (Ponte PJ ↔ PF)
              </h3>
              
              <p className="text-xs text-slate-400">
                O valor digitado sairá automaticamente da conta da <b>Empresa</b> e entrará na conta da <b>Pessoa Física</b>.
              </p>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle size={15} /> <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveBridge} className="space-y-3.5">
                <input 
                  type="text" 
                  required
                  placeholder="Descrição (ex: Pró-labore Mês 11, Dividendos...)"
                  value={formData.desc}
                  onChange={e => setFormData({ ...formData, desc: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />

                {/* Valor com Setas Elegantes */}
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="Valor do Repasse (R$)"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-3.5 pr-8 py-2.5 text-sm text-white focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col">
                    <button 
                      type="button" 
                      onClick={() => setFormData({ ...formData, amount: (parseFloat(formData.amount || 0) + 100).toFixed(2) })}
                      className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition"
                    >
                      <ChevronUp size={11} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormData({ ...formData, amount: Math.max(0, parseFloat(formData.amount || 0) - 100).toFixed(2) })}
                      className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition"
                    >
                      <ChevronDown size={11} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Conta de Origem (Empresa PJ)</label>
                  <CustomSelect
                    options={pjSelectOptions}
                    value={formData.pjAccountId}
                    onChange={(val) => setFormData({ ...formData, pjAccountId: val })}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Conta de Destino (Pessoa Física PF)</label>
                  <CustomSelect
                    options={pfSelectOptions}
                    value={formData.pfAccountId}
                    onChange={(val) => setFormData({ ...formData, pfAccountId: val })}
                  />
                </div>

                <input 
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />

                <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                  <button 
                    type="button" 
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 rounded-2xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md"
                  >
                    Efetivar na PJ e no PF
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

export default PonteTab;