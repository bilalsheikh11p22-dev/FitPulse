import React, { useState } from 'react';
import { getErrorMessage } from '../utils/normalize';
import { X, Utensils } from 'lucide-react';

const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const validateMeal = (f) => {
  if (!String(f.foodName || '').trim()) return 'Please enter a food name.';
  if (!(num(f.quantity, NaN) > 0)) return 'Quantity must be greater than 0.';
  for (const k of ['calories', 'protein', 'carbs', 'fats']) {
    if (!(num(f[k], NaN) >= 0)) return 'Calories and macros must be 0 or more.';
  }
  return null;
};

const buildMealPayload = (f) => ({
  ...f,
  foodName: String(f.foodName).trim(),
  unit: String(f.unit || '').trim() || 'serving',
  quantity: num(f.quantity, 1),
  calories: num(f.calories),
  protein: num(f.protein),
  carbs: num(f.carbs),
  fats: num(f.fats),
});

export default function NutritionModal({ isOpen, onClose, onSave, initialData }) {
  if (!isOpen) return null;
  return <NutritionModalForm onClose={onClose} onSave={onSave} initialData={initialData} />;
}

function NutritionModalForm({ onClose, onSave, initialData }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState(
    initialData
      ? {
          mealType: initialData.mealType || 'Breakfast',
          foodName: initialData.foodName || '',
          quantity: initialData.quantity ?? 1,
          unit: initialData.unit || 'serving',
          calories: initialData.calories ?? 0,
          protein: initialData.protein ?? 0,
          carbs: initialData.carbs ?? 0,
          fats: initialData.fats ?? 0,
          notes: initialData.notes || '',
          date: initialData.date,
        }
      : {
      mealType: 'Breakfast',
      foodName: '',
      quantity: 1,
      unit: 'serving',
      calories: 350,
      protein: 25,
      carbs: 40,
      fats: 8,
      notes: '',
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const problem = validateMeal(formData);
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave(buildMealPayload(formData));
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {initialData ? 'Edit Meal Log' : 'Log Daily Nutrition'}
            </h3>
            <p className="text-xs text-slate-400">
              Record meals with calories and macronutrient breakdown.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-0.5">
                Meal Category *
              </label>
              <select
                value={formData.mealType}
                onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-0.5">
                Portion & Unit
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-20 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="bowl/serving"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-0.5">
              Food Item / Dish Name *
            </label>
            <input
              type="text"
              required
              value={formData.foodName}
              onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
              placeholder="e.g. Oatmeal with Whey Protein & Blueberries"
              className="w-full px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-amber-400 mb-1">Calories</label>
              <input
                type="number"
                min="0"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-red-400 mb-1">Protein (g)</label>
              <input
                type="number"
                min="0"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-cyan-400 mb-1">Carbs (g)</label>
              <input
                type="number"
                min="0"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-yellow-400 mb-1">Fats (g)</label>
              <input
                type="number"
                min="0"
                value={formData.fats}
                onChange={(e) => setFormData({ ...formData, fats: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-center font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-0.5">
              Notes
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Cooked with coconut oil, added chia seeds"
              className="w-full px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          {error && (
            <p role="alert" className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/25 disabled:opacity-60"
            >
              {initialData ? 'Update Meal' : 'Save Meal Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
