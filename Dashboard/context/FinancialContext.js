// context/FinancialContext.js
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const FinancialContext = createContext();

export function FinancialProvider({ children }) {
  const [entityType, setEntityType] = useState('PF');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hideValues, setHideValues] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filtro que o Dashboard envia para o Extrato
  const [extratoFilterType, setExtratoFilterType] = useState('ALL'); // 'ALL' | 'income' | 'expense' | 'transfer'

  const initialAccounts = [
    { id: 'acc_1', name: 'Nubank Principal', bank: 'Nubank', initialBalance: 3500.00, entity: 'PF', color: 'bg-purple-600' },
    { id: 'acc_2', name: 'Inter Investimentos', bank: 'Banco Inter', initialBalance: 12000.00, entity: 'PF', color: 'bg-orange-500' },
    { id: 'acc_3', name: 'Itaú Empresas', bank: 'Itaú', initialBalance: 28400.00, entity: 'PJ', color: 'bg-blue-600' },
  ];

  const initialCards = [
    {
      id: 'card_1',
      name: 'Nubank Ultravioleta',
      lastDigits: '4892',
      limitTotal: 10000.00,
      closingDay: 22,
      dueDay: 1,
      payingAccountId: 'acc_1',
      entity: 'PF'
    },
    {
      id: 'card_2',
      name: 'Itaú Corporate Black',
      lastDigits: '1029',
      limitTotal: 30000.00,
      closingDay: 28,
      dueDay: 10,
      payingAccountId: 'acc_3',
      entity: 'PJ'
    }
  ];

  const initialCategories = [
    { id: 'cat_1', name: 'Moradia', type: 'expense', entity: 'PF', subcategories: ['Aluguel / Condomínio', 'Energia Elétrica', 'Água & Gás', 'Internet'] },
    { id: 'cat_2', name: 'Alimentação', type: 'expense', entity: 'PF', subcategories: ['Supermercado', 'Restaurantes', 'Delivery'] },
    { id: 'cat_3', name: 'Receitas Pessoais', type: 'income', entity: 'PF', subcategories: ['Pró-labore', 'Dividendos', 'Rendimentos'] },
    { id: 'cat_4', name: 'Custos Operacionais', type: 'expense', entity: 'PJ', subcategories: ['Servidores & Nuvem', 'Softwares & SaaS', 'Contabilidade', 'Equipe'] },
    { id: 'cat_5', name: 'Vendas & Receitas PJ', type: 'income', entity: 'PJ', subcategories: ['Contratos Recorrentes', 'Projetos Avulsos', 'Consultoria'] },
    { id: 'cat_transf', name: 'Transferência Interna', type: 'transfer', entity: 'AMBOS', subcategories: ['Entre Contas Próprias'] },
    { id: 'cat_ponte', name: 'Retirada / Pró-labore', type: 'bridge', entity: 'AMBOS', subcategories: ['Pró-labore Sócios', 'Distribuição de Lucros'] }
  ];

  const initialCardExpenses = [
    { id: 'ce_1', cardId: 'card_1', entity: 'PF', desc: 'Monitor Dell 4K', amount: 250.00, installment: '3 de 10', category: 'Moradia', subcategory: 'Internet', date: '2026-10-28', invoiceMonthYear: '2026-11' },
    { id: 'ce_2', cardId: 'card_1', entity: 'PF', desc: 'Supermercado Pão de Açúcar', amount: 380.50, installment: 'À vista', category: 'Alimentação', subcategory: 'Supermercado', date: '2026-11-03', invoiceMonthYear: '2026-11' },
    { id: 'ce_3', cardId: 'card_2', entity: 'PJ', desc: 'Servidor AWS Nuvem', amount: 1450.00, installment: 'À vista', category: 'Custos Operacionais', subcategory: 'Servidores & Nuvem', date: '2026-11-02', invoiceMonthYear: '2026-11' }
  ];

  const initialTransactions = [
    { id: 'tx_1', entity: 'PF', desc: 'Pró-labore Recebido (Ponte)', amount: 8000.00, type: 'income', accountId: 'acc_1', category: 'Receitas Pessoais', subcategory: 'Pró-labore', status: 'paid', date: '2026-11-01', notes: 'Entrada mensal' },
    { id: 'tx_2', entity: 'PF', desc: 'Aluguel Apartamento', amount: 2500.00, type: 'expense', accountId: 'acc_1', category: 'Moradia', subcategory: 'Aluguel / Condomínio', status: 'pending', date: '2026-11-10', notes: 'Vencimento dia 10' },
    { id: 'tx_3', entity: 'PJ', desc: 'Contrato Alpha Tech', amount: 18500.00, type: 'income', accountId: 'acc_3', category: 'Vendas & Receitas PJ', subcategory: 'Contratos Recorrentes', status: 'paid', date: '2026-11-04', notes: 'NF emitida #204' },
    { id: 'tx_4', entity: 'PJ', desc: 'Pagamento Pró-labore Sócio (Ponte)', amount: 8000.00, type: 'expense', accountId: 'acc_3', category: 'Retirada / Pró-labore', subcategory: 'Pró-labore Sócios', status: 'paid', date: '2026-11-01', notes: 'Repasse empresarial para PF' }
  ];

  const initialBudgets = [
    { id: 'b_1', entity: 'PF', categoryName: 'Alimentação', limitAmount: 1500.00 },
    { id: 'b_2', entity: 'PF', categoryName: 'Moradia', limitAmount: 3500.00 },
    { id: 'b_3', entity: 'PJ', categoryName: 'Custos Operacionais', limitAmount: 5000.00 }
  ];

  const initialInvestments = [
    { id: 'inv_1', entity: 'PF', name: 'Tesouro Selic 2029', type: 'Renda Fixa', investedAmount: 10000.00, currentAmount: 10850.00 },
    { id: 'inv_2', entity: 'PF', name: 'Fundo Imobiliário HGLG11', type: 'FIIs', investedAmount: 5000.00, currentAmount: 5240.00 },
    { id: 'inv_3', entity: 'PJ', name: 'CDB Liquidez Diária (Reserva PJ)', type: 'Renda Fixa', investedAmount: 20000.00, currentAmount: 20620.00 }
  ];

  const [accounts, setAccounts] = useState(initialAccounts);
  const [cards, setCards] = useState(initialCards);
  const [closedInvoices, setClosedInvoices] = useState({});
  const [categories, setCategories] = useState(initialCategories);
  const [cardExpenses, setCardExpenses] = useState(initialCardExpenses);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [budgets, setBudgets] = useState(initialBudgets);
  const [investments, setInvestments] = useState(initialInvestments);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedAccounts = localStorage.getItem('finpulse_accounts');
        const savedCards = localStorage.getItem('finpulse_cards');
        const savedClosedInvoices = localStorage.getItem('finpulse_closed_invoices');
        const savedCategories = localStorage.getItem('finpulse_categories');
        const savedCardExpenses = localStorage.getItem('finpulse_card_expenses');
        const savedTransactions = localStorage.getItem('finpulse_transactions');
        const savedBudgets = localStorage.getItem('finpulse_budgets');
        const savedInvestments = localStorage.getItem('finpulse_investments');

        if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
        if (savedCards) setCards(JSON.parse(savedCards));
        if (savedClosedInvoices) setClosedInvoices(JSON.parse(savedClosedInvoices));
        if (savedCategories) setCategories(JSON.parse(savedCategories));
        if (savedCardExpenses) setCardExpenses(JSON.parse(savedCardExpenses));
        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
        if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
        if (savedInvestments) setInvestments(JSON.parse(savedInvestments));
      } catch (err) {
        console.error('Erro ao restaurar dados:', err);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('finpulse_accounts', JSON.stringify(accounts));
      localStorage.setItem('finpulse_cards', JSON.stringify(cards));
      localStorage.setItem('finpulse_closed_invoices', JSON.stringify(closedInvoices));
      localStorage.setItem('finpulse_categories', JSON.stringify(categories));
      localStorage.setItem('finpulse_card_expenses', JSON.stringify(cardExpenses));
      localStorage.setItem('finpulse_transactions', JSON.stringify(transactions));
      localStorage.setItem('finpulse_budgets', JSON.stringify(budgets));
      localStorage.setItem('finpulse_investments', JSON.stringify(investments));
    }
  }, [isLoaded, accounts, cards, closedInvoices, categories, cardExpenses, transactions, budgets, investments]);

  // CÁLCULO DE SALDO INDIVIDUAL EM TEMPO REAL DE CADA CONTA BANCÁRIA
  const getAccountBalance = (accountId) => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return 0;
    const initial = Number(acc.initialBalance || 0);

    const paidIncomes = transactions
      .filter(t => t.accountId === accountId && t.type === 'income' && t.status === 'paid')
      .reduce((accSum, curr) => accSum + Number(curr.amount || 0), 0);

    const paidExpenses = transactions
      .filter(t => t.accountId === accountId && t.type === 'expense' && t.status === 'paid')
      .reduce((accSum, curr) => accSum + Number(curr.amount || 0), 0);

    return initial + paidIncomes - paidExpenses;
  };

  const addAccount = (acc) => setAccounts(prev => [...prev, { ...acc, id: 'acc_' + Date.now(), entity: entityType, color: acc.color || 'bg-purple-600' }]);
  const updateAccount = (id, data) => setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  const deleteAccount = (id) => setAccounts(prev => prev.filter(a => a.id !== id));

  const addCard = (card) => setCards(prev => [...prev, { ...card, id: 'card_' + Date.now(), entity: entityType }]);
  const updateCard = (id, data) => setCards(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  const deleteCard = (id) => setCards(prev => prev.filter(c => c.id !== id));

  const getInvoiceData = (cardId, invoiceMonthYear) => {
    const rawSum = cardExpenses
      .filter(e => e.cardId === cardId && e.invoiceMonthYear === invoiceMonthYear)
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const invoiceKey = `${cardId}_${invoiceMonthYear}`;
    const linkedTx = transactions.find(t => t.isInvoicePayment && t.cardId === cardId && t.invoiceMonthYear === invoiceMonthYear);

    if (linkedTx) {
      return {
        status: linkedTx.status === 'paid' ? 'paga' : 'fechada',
        rawSum,
        finalAmount: linkedTx.amount,
        payingAccountId: linkedTx.accountId,
        paidDate: linkedTx.date,
        linkedTxId: linkedTx.id
      };
    }

    const closedAmount = closedInvoices[invoiceKey];
    if (closedAmount !== undefined) {
      return {
        status: 'fechada',
        rawSum,
        finalAmount: closedAmount,
        payingAccountId: null,
        paidDate: null,
        linkedTxId: null
      };
    }

    return {
      status: 'aberta',
      rawSum,
      finalAmount: rawSum,
      payingAccountId: null,
      paidDate: null,
      linkedTxId: null
    };
  };

  const closeInvoice = ({ cardId, invoiceMonthYear, finalAmount }) => {
    const invoiceKey = `${cardId}_${invoiceMonthYear}`;
    setClosedInvoices(prev => ({
      ...prev,
      [invoiceKey]: parseFloat(finalAmount) || 0
    }));
  };

  const reopenInvoice = (cardId, invoiceMonthYear) => {
    const invoiceKey = `${cardId}_${invoiceMonthYear}`;
    setClosedInvoices(prev => {
      const copy = { ...prev };
      delete copy[invoiceKey];
      return copy;
    });
    setTransactions(prev => prev.filter(t => !(t.isInvoicePayment && t.cardId === cardId && t.invoiceMonthYear === invoiceMonthYear)));
  };

  const payInvoice = ({ cardId, invoiceMonthYear, payingAccountId, date, finalAmount }) => {
    const card = cards.find(c => c.id === cardId);
    const amount = parseFloat(finalAmount) || 0;
    const txId = `tx_inv_${cardId}_${invoiceMonthYear}`;

    const newTx = {
      id: txId,
      isInvoicePayment: true,
      cardId,
      invoiceMonthYear,
      entity: card?.entity || entityType,
      desc: `Pagamento Fatura ${card?.name || 'Cartão'} (${invoiceMonthYear})`,
      amount,
      type: 'expense',
      accountId: payingAccountId,
      category: 'Cartão de Crédito',
      subcategory: 'Fatura Mensal',
      status: 'paid',
      date,
      notes: 'Débito automático de liquidação de fatura'
    };

    setTransactions(prev => {
      const filtered = prev.filter(t => t.id !== txId);
      return [newTx, ...filtered];
    });
  };

  const revertInvoicePayment = (cardId, invoiceMonthYear) => {
    const txId = `tx_inv_${cardId}_${invoiceMonthYear}`;
    setTransactions(prev => prev.map(t => {
      if (t.id === txId || (t.isInvoicePayment && t.cardId === cardId && t.invoiceMonthYear === invoiceMonthYear)) {
        return { ...t, status: 'pending' };
      }
      return t;
    }));
  };

  const addCategory = (cat) => setCategories(prev => [...prev, { ...cat, id: 'cat_' + Date.now(), entity: entityType, subcategories: cat.subcategories || [] }]);
  const updateCategory = (id, data) => setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  const deleteCategory = (id) => setCategories(prev => prev.filter(c => c.id !== id));
  
  const addSubcategory = (catId, subName) => {
    setCategories(prev => prev.map(c => {
      if (c.id === catId && !c.subcategories.includes(subName)) {
        return { ...c, subcategories: [...c.subcategories, subName] };
      }
      return c;
    }));
  };

  const removeSubcategory = (catId, subName) => {
    setCategories(prev => prev.map(c => {
      if (c.id === catId) {
        return { ...c, subcategories: c.subcategories.filter(s => s !== subName) };
      }
      return c;
    }));
  };

  const addCardExpense = (expense) => {
    setCardExpenses(prev => [{ ...expense, id: 'ce_' + Date.now(), entity: entityType }, ...prev]);
  };
  const updateCardExpense = (id, data) => setCardExpenses(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  const deleteCardExpense = (id) => setCardExpenses(prev => prev.filter(e => e.id !== id));

  const addTransaction = (tx) => {
    setTransactions(prev => [{ ...tx, id: 'tx_' + Date.now(), entity: entityType }, ...prev]);
  };
  const updateTransaction = (id, data) => setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  const deleteTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id));
  
  const toggleTransactionStatus = (id) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'paid' ? 'pending' : 'paid' };
      }
      return t;
    }));
  };

  const addTransfer = ({ fromAccountId, toAccountId, amount, date, desc }) => {
    const fromAcc = accounts.find(a => a.id === fromAccountId);
    const toAcc = accounts.find(a => a.id === toAccountId);

    const txDebit = {
      id: 'tx_tr_out_' + Date.now(),
      entity: entityType,
      desc: desc || `Transf. para ${toAcc?.name || 'Conta Externa'}`,
      amount: parseFloat(amount),
      type: 'transfer',
      accountId: fromAccountId,
      category: 'Transferência Interna',
      subcategory: 'Entre Contas Próprias',
      status: 'paid',
      date,
      notes: `Transferência de saída para ${toAcc?.name}`
    };

    const txCredit = {
      id: 'tx_tr_in_' + (Date.now() + 1),
      entity: entityType,
      desc: desc || `Transf. de ${fromAcc?.name || 'Conta Externa'}`,
      amount: parseFloat(amount),
      type: 'transfer',
      accountId: toAccountId,
      category: 'Transferência Interna',
      subcategory: 'Entre Contas Próprias',
      status: 'paid',
      date,
      notes: `Transferência recebida de ${fromAcc?.name}`
    };

    setTransactions(prev => [txDebit, txCredit, ...prev]);
  };

  const addBridgeTransfer = ({ amount, desc, pjAccountId, pfAccountId, date }) => {
    const val = parseFloat(amount);
    const pjTx = {
      id: 'bridge_pj_' + Date.now(),
      entity: 'PJ',
      desc: desc || 'Retirada de Pró-labore / Dividendos (Para PF)',
      amount: val,
      type: 'expense',
      accountId: pjAccountId,
      category: 'Retirada / Pró-labore',
      subcategory: 'Pró-labore Sócios',
      status: 'paid',
      date,
      notes: 'Repasse empresarial para pessoa física'
    };

    const pfTx = {
      id: 'bridge_pf_' + (Date.now() + 1),
      entity: 'PF',
      desc: desc || 'Recebimento de Pró-labore / Lucros da Empresa',
      amount: val,
      type: 'income',
      accountId: pfAccountId,
      category: 'Receitas Pessoais',
      subcategory: 'Pró-labore',
      status: 'paid',
      date,
      notes: 'Recebimento via repasse de lucro/pró-labore'
    };

    setTransactions(prev => [pjTx, pfTx, ...prev]);
  };

  const saveBudget = (budget) => {
    setBudgets(prev => {
      const exists = prev.find(b => b.categoryName === budget.categoryName && b.entity === entityType);
      if (exists) {
        return prev.map(b => b.id === exists.id ? { ...b, limitAmount: parseFloat(budget.limitAmount) } : b);
      }
      return [...prev, { ...budget, id: 'b_' + Date.now(), entity: entityType, limitAmount: parseFloat(budget.limitAmount) }];
    });
  };

  const addInvestment = (inv) => setInvestments(prev => [...prev, { ...inv, id: 'inv_' + Date.now(), entity: entityType }]);
  const updateInvestment = (id, data) => setInvestments(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteInvestment = (id) => setInvestments(prev => prev.filter(i => i.id !== id));

  const metrics = useMemo(() => {
    const currentEntityAccounts = accounts.filter(a => a.entity === entityType);
    const currentEntityCards = cards.filter(c => c.entity === entityType);
    const currentEntityTxs = transactions.filter(t => t.entity === entityType);

    const initialSum = currentEntityAccounts.reduce((acc, a) => acc + Number(a.initialBalance || 0), 0);
    
    const paidIncomes = currentEntityTxs
      .filter(t => t.type === 'income' && t.status === 'paid')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    const paidExpenses = currentEntityTxs
      .filter(t => t.type === 'expense' && t.status === 'paid')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    const realBalance = initialSum + paidIncomes - paidExpenses;

    const pendingExpenses = currentEntityTxs
      .filter(t => t.type === 'expense' && t.status === 'pending')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    const pendingIncomes = currentEntityTxs
      .filter(t => t.type === 'income' && t.status === 'pending')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    let unlinkedOpenInvoices = 0;
    let usedLimitTotal = 0;

    currentEntityCards.forEach(card => {
      const months = Array.from(new Set(
        cardExpenses.filter(e => e.cardId === card.id).map(e => e.invoiceMonthYear)
      ));

      months.forEach(mKey => {
        const invData = getInvoiceData(card.id, mKey);
        
        if (invData.status !== 'paga') {
          usedLimitTotal += Number(invData.rawSum);

          const hasLinkedTx = currentEntityTxs.some(t => t.isInvoicePayment && t.cardId === card.id && t.invoiceMonthYear === mKey);
          if (!hasLinkedTx) {
            unlinkedOpenInvoices += Number(invData.finalAmount);
          }
        }
      });
    });

    const projectedBalance = realBalance + pendingIncomes - pendingExpenses - unlinkedOpenInvoices;
    const totalLimit = currentEntityCards.reduce((acc, c) => acc + Number(c.limitTotal || 0), 0);
    const availableLimit = Math.max(0, totalLimit - usedLimitTotal);

    return {
      realBalance,
      projectedBalance,
      paidIncomes,
      paidExpenses,
      pendingExpenses,
      pendingIncomes,
      totalOpenInvoices: unlinkedOpenInvoices || 0,
      totalPendingBills: pendingExpenses + unlinkedOpenInvoices,
      totalLimit,
      usedLimit: usedLimitTotal,
      availableLimit
    };
  }, [accounts, cards, transactions, cardExpenses, closedInvoices, entityType]);

  const theme = entityType === 'PF' 
    ? {
        name: 'Pessoal',
        primary: 'text-indigo-400',
        bgPrimary: 'bg-indigo-600',
        bgHover: 'hover:bg-indigo-700',
        badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        border: 'border-indigo-500/30',
        shadow: 'shadow-indigo-600/20',
      }
    : {
        name: 'Empresa',
        primary: 'text-emerald-400',
        bgPrimary: 'bg-emerald-600',
        bgHover: 'hover:bg-emerald-700',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        border: 'border-emerald-500/30',
        shadow: 'shadow-emerald-600/20',
      };

  return (
    <FinancialContext.Provider value={{
      entityType,
      setEntityType,
      activeTab,
      setActiveTab,
      hideValues,
      setHideValues,
      theme,
      accounts: accounts.filter(a => a.entity === entityType),
      rawAccounts: accounts,
      getAccountBalance,
      addAccount,
      updateAccount,
      deleteAccount,
      cards: cards.filter(c => c.entity === entityType),
      rawCards: cards,
      addCard,
      updateCard,
      deleteCard,
      getInvoiceData,
      closeInvoice,
      reopenInvoice,
      payInvoice,
      revertInvoicePayment,
      categories: categories.filter(c => c.entity === entityType || c.entity === 'AMBOS'),
      addCategory,
      updateCategory,
      deleteCategory,
      addSubcategory,
      removeSubcategory,
      cardExpenses: cardExpenses.filter(e => e.entity === entityType),
      addCardExpense,
      updateCardExpense,
      deleteCardExpense,
      transactions: transactions.filter(t => t.entity === entityType),
      addTransaction,
      updateTransaction,
      deleteTransaction,
      toggleTransactionStatus,
      addTransfer,
      addBridgeTransfer,
      budgets: budgets.filter(b => b.entity === entityType),
      saveBudget,
      investments: investments.filter(i => i.entity === entityType),
      addInvestment,
      updateInvestment,
      deleteInvestment,
      metrics,
      extratoFilterType,
      setExtratoFilterType
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  return useContext(FinancialContext);
}