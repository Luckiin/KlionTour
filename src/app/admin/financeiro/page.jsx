"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Plus, Trash2, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import {
  getRevenues, createRevenue, deleteRevenue,
  getExpenses, createExpense, deleteExpense,
} from "@/lib/services/financial";
import { EXPENSE_CATEGORIES, REVENUE_CATEGORIES } from "@/lib/constants";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend,
} from "recharts";

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MONEY  = (v) => `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

function getMonthlyData(revenues, expenses) {
  const data = MONTHS.map(m => ({ month: m, receitas: 0, despesas: 0 }));
  revenues.forEach(r => { data[new Date(r.date).getUTCMonth()].receitas += Number(r.amount); });
  expenses.forEach(e => { data[new Date(e.date).getUTCMonth()].despesas += Number(e.amount); });
  return data.filter(d => d.receitas > 0 || d.despesas > 0);
}

function getExpensePie(expenses) {
  const map = {};
  expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + Number(e.amount); });
  return Object.entries(map).map(([key, value]) => ({
    name:  EXPENSE_CATEGORIES[key]?.label ?? key,
    value,
    color: EXPENSE_CATEGORIES[key]?.color ?? "#6b7280",
  }));
}

export default function FinanceiroPage() {
  const [revenues,    setRevenues]    = useState([]);
  const [expenses,    setExpenses]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState("overview");
  const [showAddRev,  setShowAddRev]  = useState(false);
  const [showAddExp,  setShowAddExp]  = useState(false);
  const [savingRev,   setSavingRev]   = useState(false);
  const [savingExp,   setSavingExp]   = useState(false);
  const [newRev, setNewRev] = useState({ description: "", amount: "", date: "", category: "viagem" });
  const [newExp, setNewExp] = useState({ description: "", amount: "", date: "", category: "combustivel" });

  useEffect(() => {
    Promise.all([getRevenues(), getExpenses()])
      .then(([r, e]) => { setRevenues(r); setExpenses(e); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRev  = revenues.reduce((a, r) => a + Number(r.amount), 0);
  const totalExp  = expenses.reduce((a, e) => a + Number(e.amount), 0);
  const netProfit = totalRev - totalExp;
  const margin    = totalRev > 0 ? ((netProfit / totalRev) * 100).toFixed(1) : 0;

  const addRevenue = async () => {
    if (!newRev.description || !newRev.amount || !newRev.date) return;
    setSavingRev(true);
    try {
      const entry = await createRevenue({ ...newRev, amount: parseFloat(newRev.amount) });
      setRevenues(prev => [entry, ...prev]);
      setNewRev({ description: "", amount: "", date: "", category: "viagem" });
      setShowAddRev(false);
    } catch (err) { alert(err.message); }
    finally { setSavingRev(false); }
  };

  const addExpense = async () => {
    if (!newExp.description || !newExp.amount || !newExp.date) return;
    setSavingExp(true);
    try {
      const entry = await createExpense({ ...newExp, amount: parseFloat(newExp.amount) });
      setExpenses(prev => [entry, ...prev]);
      setNewExp({ description: "", amount: "", date: "", category: "combustivel" });
      setShowAddExp(false);
    } catch (err) { alert(err.message); }
    finally { setSavingExp(false); }
  };

  const removeRev = async (id) => {
    try { await deleteRevenue(id); setRevenues(prev => prev.filter(r => r.id !== id)); }
    catch (err) { alert(err.message); }
  };
  const removeExp = async (id) => {
    try { await deleteExpense(id); setExpenses(prev => prev.filter(e => e.id !== id)); }
    catch (err) { alert(err.message); }
  };

  const monthlyData = getMonthlyData(revenues, expenses);
  const expPie      = getExpensePie(expenses);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={36} className="animate-spin text-brand-500" />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-100">Financeiro</h1>
        <p className="text-ink-300 text-sm mt-1">Controle de entradas e saídas da KlionTour</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Receita Total",   value: MONEY(totalRev),  icon: <ArrowUpRight size={20} />,   color: "text-emerald-400", bg: "bg-emerald-900/30" },
          { label: "Despesas Total",  value: MONEY(totalExp),  icon: <ArrowDownRight size={20} />, color: "text-red-400",     bg: "bg-red-900/30"     },
          { label: "Lucro Líquido",   value: MONEY(netProfit), icon: <DollarSign size={20} />,     color: netProfit >= 0 ? "text-brand-400" : "text-red-400", bg: netProfit >= 0 ? "bg-brand-900/30" : "bg-red-900/30" },
          { label: "Margem de Lucro", value: `${margin}%`,     icon: <TrendingUp size={20} />,     color: "text-purple-400",  bg: "bg-purple-900/30"  },
        ].map((k, i) => (
          <div key={i} className="card p-5 flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${k.bg} ${k.color}`}>{k.icon}</div>
            <div>
              <div className="text-xs text-ink-300">{k.label}</div>
              <div className={`text-xl font-extrabold ${k.color}`}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-400 rounded-xl p-1 w-fit mb-6">
        {[["overview","Visão Geral"],["receitas","Receitas"],["despesas","Despesas"]].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tab === val ? "bg-dark-200 shadow text-ink-100" : "text-ink-300 hover:text-ink-200"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <h2 className="font-bold text-ink-100 mb-5">Receitas vs Despesas por Mês</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d4437" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ebfaa" }} />
                <YAxis tick={{ fontSize: 12, fill: "#9ebfaa" }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => `R$ ${Number(v).toLocaleString("pt-BR")}`}
                  contentStyle={{ background: "#1a2b20", border: "1px solid #2d4437", borderRadius: 8 }}
                  labelStyle={{ color: "#e4f0ea" }}
                />
                <Legend wrapperStyle={{ color: "#9ebfaa" }} />
                <Bar dataKey="receitas" name="Receitas" fill="#30b27f" radius={[4,4,0,0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-ink-100 mb-5">Despesas por Categoria</h2>
            {expPie.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie data={expPie} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                      {expPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `R$ ${Number(v).toLocaleString("pt-BR")}`} contentStyle={{ background: "#1a2b20", border: "1px solid #2d4437", borderRadius: 8 }} />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {expPie.map((e, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: e.color }} />
                        <span className="text-ink-300">{e.name}</span>
                      </div>
                      <span className="font-medium text-ink-100">{MONEY(e.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-ink-400 text-sm text-center pt-10">Nenhuma despesa registrada</p>
            )}
          </div>
        </div>
      )}

      {/* Receitas */}
      {tab === "receitas" && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-ink-100">Entradas / Receitas</h2>
              <p className="text-sm text-ink-300">Total: <span className="font-semibold text-emerald-400">{MONEY(totalRev)}</span></p>
            </div>
            <button onClick={() => setShowAddRev(true)} className="btn-primary text-sm py-2">
              <Plus size={16} /> Adicionar
            </button>
          </div>

          {showAddRev && (
            <div className="bg-dark-300 border border-dark-50 rounded-xl p-4 mb-5 grid grid-cols-1 md:grid-cols-4 gap-3">
              <input value={newRev.description} onChange={e => setNewRev(p => ({...p, description: e.target.value}))}
                className="input-field text-sm md:col-span-2" placeholder="Descrição" />
              <input type="number" value={newRev.amount} onChange={e => setNewRev(p => ({...p, amount: e.target.value}))}
                className="input-field text-sm" placeholder="Valor (R$)" />
              <input type="date" value={newRev.date} onChange={e => setNewRev(p => ({...p, date: e.target.value}))}
                className="input-field text-sm" />
              <select value={newRev.category} onChange={e => setNewRev(p => ({...p, category: e.target.value}))}
                className="input-field text-sm">
                {Object.entries(REVENUE_CATEGORIES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <div className="flex gap-2 md:col-span-3">
                <button onClick={addRevenue} disabled={savingRev} className="btn-primary text-sm py-2 flex-1">
                  {savingRev ? "Salvando..." : "Salvar"}
                </button>
                <button onClick={() => setShowAddRev(false)} className="btn-outline text-sm py-2">Cancelar</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {revenues.sort((a,b) => new Date(b.date) - new Date(a.date)).map(r => (
              <div key={r.id} className="flex items-center justify-between py-3 border-b border-dark-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-ink-100">{r.description}</p>
                  <p className="text-xs text-ink-400">
                    {new Date(r.date + "T12:00:00").toLocaleDateString("pt-BR")} · {REVENUE_CATEGORIES[r.category]?.label ?? r.category}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-emerald-400">+ {MONEY(r.amount)}</span>
                  <button onClick={() => removeRev(r.id)} className="text-ink-400 hover:text-red-400 transition">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Despesas */}
      {tab === "despesas" && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-ink-100">Saídas / Despesas</h2>
              <p className="text-sm text-ink-300">Total: <span className="font-semibold text-red-400">{MONEY(totalExp)}</span></p>
            </div>
            <button onClick={() => setShowAddExp(true)} className="btn-primary text-sm py-2">
              <Plus size={16} /> Adicionar
            </button>
          </div>

          {showAddExp && (
            <div className="bg-dark-300 border border-dark-50 rounded-xl p-4 mb-5 grid grid-cols-1 md:grid-cols-4 gap-3">
              <input value={newExp.description} onChange={e => setNewExp(p => ({...p, description: e.target.value}))}
                className="input-field text-sm md:col-span-2" placeholder="Descrição" />
              <input type="number" value={newExp.amount} onChange={e => setNewExp(p => ({...p, amount: e.target.value}))}
                className="input-field text-sm" placeholder="Valor (R$)" />
              <input type="date" value={newExp.date} onChange={e => setNewExp(p => ({...p, date: e.target.value}))}
                className="input-field text-sm" />
              <select value={newExp.category} onChange={e => setNewExp(p => ({...p, category: e.target.value}))}
                className="input-field text-sm">
                {Object.entries(EXPENSE_CATEGORIES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <div className="flex gap-2 md:col-span-3">
                <button onClick={addExpense} disabled={savingExp} className="btn-primary text-sm py-2 flex-1">
                  {savingExp ? "Salvando..." : "Salvar"}
                </button>
                <button onClick={() => setShowAddExp(false)} className="btn-outline text-sm py-2">Cancelar</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {expenses.sort((a,b) => new Date(b.date) - new Date(a.date)).map(e => (
              <div key={e.id} className="flex items-center justify-between py-3 border-b border-dark-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-ink-100">{e.description}</p>
                  <p className="text-xs text-ink-400">
                    {new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR")} · {EXPENSE_CATEGORIES[e.category]?.label ?? e.category}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-red-400">- {MONEY(e.amount)}</span>
                  <button onClick={() => removeExp(e.id)} className="text-ink-400 hover:text-red-400 transition">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
