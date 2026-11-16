import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Plus, 
  Search, 
  Calendar, 
  Trash2, 
  Edit, 
  PieChart as PieIcon, 
  Apple, 
  Coffee, 
  Sun, 
  Moon, 
  Cookie,
  CheckCircle2 
} from 'lucide-react';
import api from '../api/api';
import { toArray, toNumber, toDate, getErrorMessage, fmtDate } from '../utils/normalize';
import useFlash from '../utils/useFlash';
import NutritionModal from '../components/NutritionModal';

export default function Nutrition() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mealTypeFilter, setMealTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, flash] = useFlash();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  const fetchNutrition = async () => {
    try {
      setLoading(true);
      const params = {};
      if (mealTypeFilter !== 'All') params.mealType = mealTypeFilter;
      if (search) params.search = search;

      const res = await api.get('/nutrition', { params });
      setLogs(toArray(res.data));
      setError('');
    } catch (err) {
      setLogs([]);
      setError(getErrorMessage(err, 'Could not load nutrition logs.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, [mealTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNutrition();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this nutrition log?')) {
      try {
        await api.delete(`/nutrition/${id}`);
        setLogs((prev) => prev.filter((l) => l._id !== id));
        setError('');
        flash('Meal deleted.');
      } catch (err) {
        setError(getErrorMessage(err, 'Could not delete the entry.'));
      }
    }
  };

  const handleSaveLog = async (data) => {
    const wasEditing = Boolean(editingLog);
    if (editingLog) {
      await api.put(`/nutrition/${editingLog._id}`, data);
    } else {
      await api.post('/nutrition', data);
    }
    setEditingLog(null);
    await fetchNutrition();
    flash(wasEditing ? 'Meal updated.' : 'Meal saved.');
  };

  // Daily summaries use LOCAL calendar days, so different days are never combined.
  const dayKeyOf = (value) => {
    const d = toDate(value);
    return d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : 'unknown';
  };
  const sumLogs = (list) =>
    list.reduce(
      (acc, l) => ({
        calories: acc.calories + toNumber(l.calories),
        protein: acc.protein + toNumber(l.protein),
        carbs: acc.carbs + toNumber(l.carbs),
        fats: acc.fats + toNumber(l.fats),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  const groupMap = new Map();
  logs.forEach((l) => {
    const key = dayKeyOf(l.date);
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key).push(l);
  });
  const groups = [...groupMap.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, list]) => ({ key, logs: list, totals: sumLogs(list) }));
  const todayTotals = sumLogs(groupMap.get(dayKeyOf(new Date())) || []);
  const totalCalories = todayTotals.calories;
  const totalProtein = todayTotals.protein;
  const totalCarbs = todayTotals.carbs;
  const totalFats = todayTotals.fats;

  const mealIcons = {
    Breakfast: <Coffee className="w-4 h-4 text-amber-400" />,
    Lunch: <Sun className="w-4 h-4 text-orange-400" />,
    Dinner: <Moon className="w-4 h-4 text-indigo-400" />,
    Snacks: <Cookie className="w-4 h-4 text-emerald-400" />,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Utensils className="w-6 h-6 text-emerald-400" />
            <span>Nutrition & Macronutrient Accounting</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log daily food items, manage caloric deficit/surplus, and balance macros.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingLog(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/25 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Food Intake</span>
        </button>
      </div>

      {/* Daily Macro Summary Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400">Today's Calories</p>
          <h3 className="text-2xl font-bold text-amber-400 mt-0.5">{Math.round(totalCalories)} <span className="text-xs font-normal text-slate-400">kcal</span></h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Logged today</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400">Protein</p>
          <h3 className="text-2xl font-bold text-red-400 mt-0.5">{Math.round(totalProtein)} <span className="text-xs font-normal text-slate-400">g</span></h3>
          <p className="text-[10px] text-slate-500 mt-0.5">{Math.round(totalProtein * 4)} kcal</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400">Carbs</p>
          <h3 className="text-2xl font-bold text-cyan-400 mt-0.5">{Math.round(totalCarbs)} <span className="text-xs font-normal text-slate-400">g</span></h3>
          <p className="text-[10px] text-slate-500 mt-0.5">{Math.round(totalCarbs * 4)} kcal</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400">Fats</p>
          <h3 className="text-2xl font-bold text-yellow-400 mt-0.5">{Math.round(totalFats)} <span className="text-xs font-normal text-slate-400">g</span></h3>
          <p className="text-[10px] text-slate-500 mt-0.5">{Math.round(totalFats * 9)} kcal</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search food item, ingredient, or recipe (e.g. Oatmeal, Chicken, Salmon)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => (
            <button
              key={meal}
              onClick={() => setMealTypeFilter(meal)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                mealTypeFilter === meal
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {meal}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Nutrition List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading nutrition logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Apple className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Nutrition Logs Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Log your breakfast, lunch, or post-workout meals to track your daily macronutrient ratio.
          </p>
          <button
            onClick={() => {
              setEditingLog(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition"
          >
            Add Food Intake
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <React.Fragment key={group.key}>
              <div className="col-span-full flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                <span className="font-bold text-white">
                  {group.key === 'unknown' ? 'Unknown date' : fmtDate(`${group.key}T12:00:00`, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-slate-400">
                  {Math.round(group.totals.calories)} kcal • P {Math.round(group.totals.protein)}g • C {Math.round(group.totals.carbs)}g • F {Math.round(group.totals.fats)}g
                </span>
              </div>
          {group.logs.map((log) => (
            <div
              key={log._id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition shadow-lg flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      {mealIcons[log.mealType] || <Apple className="w-4 h-4 text-emerald-400" />}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        {log.mealType}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug">{log.foodName}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingLog(log);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit Log"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(log._id)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                      title="Delete Log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Portion: {log.quantity} {log.unit}</span>
                  <span>•</span>
                  <span>{fmtDate(log.date)}</span>
                </div>

                {log.notes && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    "{log.notes}"
                  </p>
                )}
              </div>

              {/* Macro pills */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold border border-red-500/20">
                    P: {log.protein}g
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">
                    C: {log.carbs}g
                  </span>
                  <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-semibold border border-yellow-500/20">
                    F: {log.fats}g
                  </span>
                </div>
                <span className="font-extrabold text-amber-400">
                  {log.calories} kcal
                </span>
              </div>
            </div>
          ))}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Nutrition Modal */}
      <NutritionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLog(null);
        }}
        onSave={handleSaveLog}
        initialData={editingLog}
      />
    </div>
  );
}
