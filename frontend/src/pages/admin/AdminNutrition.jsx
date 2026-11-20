import React, { useState, useEffect } from 'react';
import { Utensils, Trash2, User } from 'lucide-react';
import api from '../../api/api';
import { toArray, getErrorMessage, fmtDate } from '../../utils/normalize';
import {
  PageHeader,
  Card,
  Badge,
  Alert,
  Spinner,
  EmptyState,
  SearchBar,
  FilterTabs,
  iconBtn,
} from '../../components/admin/ui';

export default function AdminNutrition() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mealType, setMealType] = useState('All');
  const [search, setSearch] = useState('');

  const fetchNutrition = async () => {
    try {
      setLoading(true);
      const params = {};
      if (mealType !== 'All') params.mealType = mealType;
      if (search) params.search = search;

      const res = await api.get('/admin/nutrition', { params });
      setLogs(toArray(res.data));
      setError('');
    } catch (err) {
      setLogs([]);
      setError(getErrorMessage(err, 'Could not load records.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, [mealType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNutrition();
  };

  const handleDelete = async (id, foodName) => {
    if (window.confirm(`Delete food entry "${foodName}"?`)) {
      try {
        await api.delete(`/admin/nutrition/${id}`);
        setLogs((prev) => prev.filter((l) => l._id !== id));
      } catch (err) {
        window.alert(getErrorMessage(err));
      }
    }
  };

  return (
    <div>
      <PageHeader
        icon={Utensils}
        title="Nutrition"
        description="Review and moderate the meals and food entries logged across all users."
      />

      <div className="space-y-4">
        <Card>
          <div className="space-y-4">
            <SearchBar value={search} onChange={setSearch} onSubmit={handleSearchSubmit} placeholder="Search by food name" />
            <FilterTabs label="Meal" options={['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks']} value={mealType} onChange={setMealType} />
          </div>
        </Card>

        {error && <Alert>{error}</Alert>}

        {loading ? (
          <Spinner label="Loading nutrition logs…" />
        ) : logs.length === 0 ? (
          <Card>
            <EmptyState icon={Utensils} title="No nutrition logs found" description="Try a different search or meal type." />
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {logs.map((log) => (
              <article key={log._id} className="rounded-xl bg-slate-900 border border-slate-800 flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge tone="success">{log.mealType}</Badge>
                        <span className="text-xs text-slate-500">{fmtDate(log.date)}</span>
                      </div>
                      <h3 className="text-base font-semibold text-white truncate">{log.foodName}</h3>
                      <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">
                          {log.user?.name || 'Athlete'} <span className="text-slate-500">@{log.user?.username}</span>
                        </span>
                      </p>
                      <p className="text-sm text-slate-500 mt-2">
                        Portion: {log.quantity} {log.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(log._id, log.foodName)}
                      className={`${iconBtn} hover:!text-red-400 hover:!bg-red-500/10`}
                      title="Delete entry"
                      aria-label={`Delete ${log.foodName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="px-5 py-3.5 border-t border-slate-800 flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-4 text-slate-300 tabular-nums">
                    <span><span className="text-slate-500">P</span> {log.protein}g</span>
                    <span><span className="text-slate-500">C</span> {log.carbs}g</span>
                    <span><span className="text-slate-500">F</span> {log.fats}g</span>
                  </div>
                  <span className="font-semibold text-white tabular-nums">{log.calories} kcal</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
