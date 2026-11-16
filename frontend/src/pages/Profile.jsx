import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Edit, 
  Target, 
  Activity, 
  Scale, 
  Ruler, 
  Search, 
  Users, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import api from '../api/api';
import { toArray, getErrorMessage } from '../utils/normalize';
import useFlash from '../utils/useFlash';
import Avatar from '../components/ui/Avatar';
import { resolveAvatar } from '../utils/avatar';

export default function Profile() {
  const { user, updateUser, refreshUser } = useAuth();
  const [success, flash] = useFlash();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: resolveAvatar(user?.avatar),
    age: user?.age ?? 25,
    gender: user?.gender || 'male',
    height: user?.height ?? 175,
    weight: user?.weight ?? 72,
    targetWeight: user?.targetWeight ?? 70,
    activityLevel: user?.activityLevel || 'moderate',
    fitnessGoal: user?.fitnessGoal || 'muscle_gain',
  });

  useEffect(() => {
    refreshUser?.();
  }, [refreshUser]);

  // User search community feature
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSearchUsers = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setSearchLoading(true);
      const res = await api.get(`/users/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(toArray(res.data));
      setSearched(true);
      setSearchError('');
    } catch (err) {
      setSearchResults([]);
      setSearchError(getErrorMessage(err, 'Search failed. Please try again.'));
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveError('');

    if (!formData.name || !formData.name.trim()) {
      setSaveError('Full Name cannot be empty.');
      return;
    }
    const ageNum = Number(formData.age);
    if (!Number.isFinite(ageNum) || ageNum < 10 || ageNum > 120) {
      setSaveError('Age must be between 10 and 120.');
      return;
    }
    const heightNum = Number(formData.height);
    if (!Number.isFinite(heightNum) || heightNum < 50 || heightNum > 272) {
      setSaveError('Height must be between 50 and 272 cm.');
      return;
    }
    const weightNum = Number(formData.weight);
    if (!Number.isFinite(weightNum) || weightNum < 20 || weightNum > 500) {
      setSaveError('Current Weight must be between 20 and 500 kg.');
      return;
    }
    const targetWeightNum = Number(formData.targetWeight);
    if (!Number.isFinite(targetWeightNum) || targetWeightNum < 20 || targetWeightNum > 500) {
      setSaveError('Target Weight must be between 20 and 500 kg.');
      return;
    }

    setSaving(true);
    try {
      await updateUser({
        ...formData,
        name: formData.name.trim(),
        age: ageNum,
        height: heightNum,
        weight: weightNum,
        targetWeight: targetWeightNum,
      });
      setIsEditModalOpen(false);
      flash('Profile details updated successfully!');
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Could not save your profile.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {success && (
        <div role="status" className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* 1. Main Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <Avatar src={user?.avatar} name={user?.name} size={128} rounded="rounded-3xl" className="border-2 border-brand-500/50 shadow-2xl" />

          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {user?.name}
                </h1>
                <p className="text-xs text-brand-400 font-mono">@{user?.username}</p>
              </div>

              <button
                onClick={() => {
                  // start from the latest saved profile each time the editor opens
                  setFormData({
                    name: user?.name || '',
                    bio: user?.bio || '',
                    avatar: resolveAvatar(user?.avatar),
                    age: user?.age ?? 25,
                    gender: user?.gender || 'male',
                    height: user?.height ?? 175,
                    weight: user?.weight ?? 72,
                    targetWeight: user?.targetWeight ?? 70,
                    activityLevel: user?.activityLevel || 'moderate',
                    fitnessGoal: user?.fitnessGoal || 'muscle_gain',
                  });
                  setSaveError('');
                  setIsEditModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition flex items-center gap-2 self-center sm:self-auto"
              >
                <Edit className="w-3.5 h-3.5 text-brand-400" />
                <span>Edit Profile</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {user?.bio || 'Fitness athlete tracking consistency, workouts, and macro balance.'}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{user?.email}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 capitalize">
                <Target className="w-3.5 h-3.5 text-brand-400" />
                <span>Goal: {user?.fitnessGoal ? user.fitnessGoal.replace(/_/g, ' ') : '--'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 capitalize">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Activity: {user?.activityLevel ? user.activityLevel.replace(/_/g, ' ') : '--'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Biometrics Stat Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 font-medium">Current Weight</p>
            <h4 className="text-xl font-bold text-white mt-0.5">{user?.weight != null ? `${user.weight} kg` : '--'}</h4>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 font-medium">Target Weight</p>
            <h4 className="text-xl font-bold text-brand-400 mt-0.5">{user?.targetWeight != null ? `${user.targetWeight} kg` : '--'}</h4>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 font-medium">Height</p>
            <h4 className="text-xl font-bold text-white mt-0.5">{user?.height != null ? `${user.height} cm` : '--'}</h4>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 font-medium">Age & Gender</p>
            <h4 className="text-xl font-bold text-white mt-0.5 capitalize">
              {user?.age != null ? `${user.age} yrs` : '--'} / {user?.gender ? user.gender.replace(/_/g, ' ') : '--'}
            </h4>
          </div>
        </div>
      </div>

      {/* 2. Community & User Search Section (SRS requirement 3.8) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Community Athlete Search</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Discover other fitness enthusiasts and view their public routines.
          </p>
        </div>

        <form onSubmit={handleSearchUsers} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by username or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition"
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchError && <p role="alert" className="text-xs text-red-400">{searchError}</p>}
        {searched && !searchLoading && !searchError && searchResults.length === 0 && (
          <p className="text-xs text-slate-400 italic">No athletes found for that search.</p>
        )}

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {searchResults.map((athlete) => (
              <div
                key={athlete._id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3"
              >
                <Avatar src={athlete.avatar} name={athlete.name} size={40} rounded="rounded-xl" className="border border-slate-700" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">{athlete.name}</h4>
                  <p className="text-[10px] text-brand-400">@{athlete.username}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{athlete.fitnessGoal?.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Edit Profile Details</h3>
                <p className="text-xs text-slate-400">
                  Update your personal biometrics, avatar, and bio.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <p className="text-[10px] text-slate-500">Optional. Leave empty to show your initials.</p>
                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: '' })}
                      className="text-[10px] font-semibold text-slate-400 hover:text-red-400 transition"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bio</label>
                <textarea
                  rows="3"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share your training focus..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="50"
                    max="272"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="500"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="500"
                    value={formData.targetWeight}
                    onChange={(e) =>
                      setFormData({ ...formData, targetWeight: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fitness Goal
                  </label>
                  <select
                    value={formData.fitnessGoal}
                    onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="endurance">Endurance</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="general_fitness">General Fitness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Activity Level
                  </label>
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light Active</option>
                    <option value="moderate">Moderate</option>
                    <option value="very_active">Very Active</option>
                    <option value="extra_active">Extra Active</option>
                  </select>
                </div>
              </div>

              {saveError && (
                <p role="alert" className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {saveError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-brand-500 text-slate-950 text-xs font-bold hover:bg-brand-400 transition disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
