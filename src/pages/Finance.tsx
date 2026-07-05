import React, { useState } from 'react';
import { useDashboard, type Transaction } from '../context/DashboardContext';
import { getAccentColor, type AccentColor } from '../utils/theme';
import { showToast } from '../components/ui/Toast';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingDown
} from 'lucide-react';

export const Finance: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction, settings, initialBalance, updateInitialBalance } = useDashboard();
  const accent = settings.accentColor as AccentColor;

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState<Transaction['category']>('Food');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Initial balance inline editor state
  const [isEditingInitial, setIsEditingInitial] = useState(false);
  const [initialInput, setInitialInput] = useState('');

  // Handle transaction submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a description of what you spent on.', 'error');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Please enter a valid amount greater than 0.', 'error');
      return;
    }

    const txCategory = type === 'income' ? 'Income' : category;
    addTransaction(title, parsedAmount, type, txCategory, date);
    
    // Reset fields
    setTitle('');
    setAmount('');
    showToast(`${type === 'income' ? 'Funds added' : 'Expense recorded'} successfully!`, 'success');
  };

  // Calculations
  const totalBalance = initialBalance + transactions.reduce((acc, tx) => {
    return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
  }, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const spentToday = transactions
    .filter(tx => tx.date === todayStr && tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const currentMonthStr = todayStr.substring(0, 7); // "YYYY-MM"
  const spentThisMonth = transactions
    .filter(tx => tx.date.startsWith(currentMonthStr) && tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  // Group transactions by date
  const groupedTransactions = transactions.reduce<{ [date: string]: Transaction[] }>((acc, tx) => {
    if (!acc[tx.date]) {
      acc[tx.date] = [];
    }
    acc[tx.date].push(tx);
    return acc;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  // Get category details (emoji, styling)
  const getCategoryMeta = (cat: Transaction['category']) => {
    switch (cat) {
      case 'Food':
        return { emoji: '🍏', label: 'Food', bg: 'bg-emerald-500/10 text-emerald-600' };
      case 'Dessert':
        return { emoji: '🍰', label: 'Dessert', bg: 'bg-pink-500/10 text-pink-600' };
      case 'Snacks':
        return { emoji: '🍿', label: 'Snacks', bg: 'bg-amber-500/10 text-amber-600' };
      case 'Fees':
        return { emoji: '🎓', label: 'Fees', bg: 'bg-indigo-500/10 text-indigo-600' };
      case 'Gifts':
        return { emoji: '🎁', label: 'Gifts & Presents', bg: 'bg-rose-500/10 text-rose-600' };
      case 'Essentials':
        return { emoji: '🛍️', label: 'Essentials', bg: 'bg-sky-500/10 text-sky-600' };
      case 'Income':
        return { emoji: '💰', label: 'Funds Added', bg: 'bg-green-500/10 text-green-600' };
      default:
        return { emoji: '💼', label: 'Other', bg: 'bg-zinc-500/10 text-zinc-600' };
    }
  };

  // Format Date for Group Header (e.g. "Friday, July 3")
  const formatGroupDate = (dateStr: string) => {
    const d = new Date(dateStr);
    // Adjust timezone offsets so it displays correctly
    const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <Wallet className={getAccentColor(accent, 'text')} size={24} />
          <span>Finance & Expenses</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Log what you spend and deposit funds to track your day-wise manual wallet balance.
        </p>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Wallet Balance</span>
            <h3 className={`text-2xl font-bold mt-1 ${totalBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-455'}`}>
              {totalBalance >= 0 ? '+' : ''}₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            
            {isEditingInitial ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = parseFloat(initialInput);
                  if (!isNaN(val)) {
                    updateInitialBalance(val);
                    showToast('Initial balance updated!', 'success');
                  }
                  setIsEditingInitial(false);
                }}
                className="flex items-center gap-1.5 mt-1"
              >
                <input
                  type="number"
                  step="0.01"
                  value={initialInput}
                  onChange={(e) => setInitialInput(e.target.value)}
                  className="w-20 px-1.5 py-0.5 text-[10px] rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  autoFocus
                />
                <button type="submit" className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-850 text-white dark:bg-zinc-200 dark:text-zinc-900 font-bold hover:opacity-90">Save</button>
                <button type="button" onClick={() => setIsEditingInitial(false)} className="text-[9px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">Cancel</button>
              </form>
            ) : (
              <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-400">
                <span>Initial starting cash: ₹{initialBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <button 
                  type="button" 
                  onClick={() => {
                    setInitialInput(initialBalance.toString());
                    setIsEditingInitial(true);
                  }} 
                  className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline font-semibold transition-colors"
                >
                  (edit)
                </button>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-2xl ${totalBalance >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455'}`}>
            {totalBalance >= 0 ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
          </div>
        </div>

        {/* Today's Spend */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Spent Today</span>
            <h3 className="text-2xl font-bold mt-1 text-zinc-800 dark:text-zinc-100">
              ₹{spentToday.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1">Expenses logged for today</p>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            <TrendingDown size={22} />
          </div>
        </div>

        {/* Monthly Spend */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Spent This Month</span>
            <h3 className="text-2xl font-bold mt-1 text-zinc-800 dark:text-zinc-100">
              ₹{spentThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1">Total monthly expenses</p>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            <Calendar size={22} />
          </div>
        </div>
      </div>

      {/* 3. Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Form: Add Transaction (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4 flex flex-col bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Log Transaction</h3>

          <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Description / Title</label>
              <input
                type="text"
                placeholder="What did you buy or receive?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border placeholder-zinc-500 focus:outline-none focus:border-zinc-700 bg-zinc-100/50 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/40 dark:focus:border-zinc-700"
              />
            </div>

            {/* Amount & Type Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3.5 py-2 text-sm rounded-xl border placeholder-zinc-500 focus:outline-none focus:border-zinc-700 bg-zinc-100/50 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/40 dark:focus:border-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Transaction Type</label>
                <div className="flex bg-zinc-100/80 dark:bg-zinc-950/50 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 text-xs font-bold select-none h-[38px] items-center">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-1 rounded-lg text-center transition-all ${type === 'expense' ? 'bg-white dark:bg-zinc-800 text-rose-500 dark:text-rose-400 shadow-sm' : 'text-zinc-500'}`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-1 rounded-lg text-center transition-all ${type === 'income' ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-455' : 'text-zinc-500'}`}
                  >
                    Income
                  </button>
                </div>
              </div>
            </div>

            {/* Category Dropdown (Only visible if Expense) */}
            {type === 'expense' && (
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Transaction['category'])}
                  className="w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100/50 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/40 dark:focus:border-zinc-700"
                >
                  <option value="Food">🍏 Food (Meals, Groceries)</option>
                  <option value="Dessert">🍰 Dessert (Chocolate, Biscuits)</option>
                  <option value="Snacks">🍿 Snacks (Lays, Chips)</option>
                  <option value="Fees">🎓 Fees (College, Exam)</option>
                  <option value="Gifts">🎁 Gifts & Presents (Bday)</option>
                  <option value="Essentials">🛍️ Essentials (Stationery, Needs)</option>
                  <option value="Other">💼 Other (Miscellaneous)</option>
                </select>
              </div>
            )}

            {/* Date Selection */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Transaction Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:border-zinc-700 bg-zinc-100/50 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/40 dark:focus:border-zinc-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 px-4 rounded-xl text-zinc-950 font-bold transition-all hover:scale-[1.02] shadow-md ${getAccentColor(accent, 'bg')} flex items-center justify-center gap-2`}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Log Transaction</span>
            </button>
          </form>
        </div>

        {/* Right timeline: Day-Wise Balance (3 cols) */}
        <div className="lg:col-span-3 glass-panel p-6 rounded-2xl space-y-4 flex flex-col bg-white border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Day-Wise Balance Timeline</h3>
            <span className="text-[10px] text-zinc-500 font-medium">Grouped chronologically</span>
          </div>

          {sortedDates.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="p-3 rounded-2xl border text-zinc-500 mb-3 bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                <Wallet size={28} />
              </div>
              <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No transactions recorded</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Log your first expense or fund addition on the left panel to see your timeline.
              </p>
            </div>
          ) : (
            <div className="space-y-6 flex-1 max-h-[460px] overflow-y-auto pr-1 select-none">
              {sortedDates.map(dateStr => {
                const dayTransactions = groupedTransactions[dateStr];
                
                // Calculate net change for this day
                const dayNetChange = dayTransactions.reduce((acc, tx) => {
                  return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
                }, 0);

                return (
                  <div key={dateStr} className="space-y-2">
                    {/* Day Group Header */}
                    <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-1">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {formatGroupDate(dateStr)}
                      </span>
                      <span className={`text-xs font-bold ${dayNetChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-450'}`}>
                        {dayNetChange >= 0 ? '+' : ''}₹{dayNetChange.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Day Transaction List */}
                    <div className="space-y-1.5 pl-1">
                      {dayTransactions.map(tx => {
                        const meta = getCategoryMeta(tx.category);
                        return (
                          <div 
                            key={tx.id} 
                            className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl border border-zinc-200/40 bg-zinc-50/40 dark:border-zinc-850/50 dark:bg-zinc-950/20 group hover:border-zinc-200 dark:hover:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-base" role="img" aria-label={meta.label}>
                                {meta.emoji}
                              </span>
                              <div className="flex flex-col">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-250">{tx.title}</span>
                                <span className="text-[9px] text-zinc-550 leading-none">{meta.label}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-450'}`}>
                                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              
                              <button
                                onClick={() => {
                                  deleteTransaction(tx.id);
                                  showToast('Transaction deleted.', 'error');
                                }}
                                className="text-zinc-400 hover:text-rose-500 transition-colors opacity-80 md:opacity-0 group-hover:opacity-100 p-0.5"
                                title="Delete Log"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
