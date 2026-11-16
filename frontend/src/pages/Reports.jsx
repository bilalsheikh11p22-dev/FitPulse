import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Table, 
  Calendar 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../api/api';
import { toArray, toNumber, getErrorMessage, fmtDate } from '../utils/normalize';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState('all');
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (type !== 'all') params.type = type;
      if (startDate && endDate && startDate > endDate) {
        setError('Start date must be before the end date.');
        setLoading(false);
        return;
      }

      const res = await api.get('/reports/export', { params });
      const d = res.data && typeof res.data === 'object' && !Array.isArray(res.data) ? res.data : null;
      setReportData(
        d && {
          ...d,
          summary: d.summary || {},
          workouts: toArray(d.workouts),
          nutrition: toArray(d.nutrition),
          progress: toArray(d.progress),
        }
      );
      setError('');
    } catch (err) {
      setReportData(null);
      setError(getErrorMessage(err, 'Could not load report data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 1. Export as PDF using jsPDF + autoTable (all numbers come from the saved records)
  const handleExportPDF = () => {
    if (!reportData) return;
    const sm = reportData.summary || {};
    const rangeLabel =
      reportData.range?.startDate || reportData.range?.endDate
        ? `${reportData.range.startDate || 'start'} to ${reportData.range.endDate || 'today'}`
        : 'All time';

    const doc = new jsPDF();

    // Document Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 107, 44);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('FITPULSE FITNESS REPORT', 14, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Athlete: ${reportData.user?.name || '--'} (${reportData.user?.email || '--'})`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Period: ${rangeLabel}`, 14, 34);

    // Summary Box
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Aggregate Metrics', 14, 52);

    autoTable(doc, {
      startY: 56,
      head: [['Metric', 'Value', 'Context']],
      body: [
        ['Total Workouts Recorded', String(toNumber(sm.totalWorkouts)), 'Strength & Cardio routines'],
        ['Total Training Time', `${toNumber(sm.totalWorkoutMinutes)} minutes`, 'Cumulative session duration'],
        ['Total Calories Burned', `${toNumber(sm.totalCaloriesBurned)} kcal`, 'Active energy expenditure'],
        ['Total Meals Logged', String(toNumber(sm.totalMealsLogged)), 'Breakfast, Lunch, Dinner, Snacks'],
        ['Total Caloric Intake', `${toNumber(sm.totalCaloriesConsumed)} kcal`, `Avg ${toNumber(sm.avgDailyCalories)} kcal per logged day`],
        ['Macros (P / C / F)', `${Math.round(toNumber(sm.totalProtein))}g / ${Math.round(toNumber(sm.totalCarbs))}g / ${Math.round(toNumber(sm.totalFats))}g`, 'Totals for the period'],
        ['Latest Recorded Weight', reportData.user?.currentWeight != null ? `${reportData.user.currentWeight} kg` : '--', 'Body composition check-in'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [255, 107, 44], textColor: [15, 23, 42] },
      styles: { fontSize: 10 },
    });

    let sectionsPrinted = 0;
    const section = (title, head, body) => {
      if (body.length === 0) return;
      sectionsPrinted++;
      let y = doc.lastAutoTable.finalY + 14;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 14, y);
      autoTable(doc, {
        startY: y + 4,
        head: [head],
        body,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
      });
    };

    section(
      'Workout Routines',
      ['Date', 'Workout Title', 'Category', 'Duration', 'Burned', 'Exercises'],
      reportData.workouts.map((w) => [
        fmtDate(w.date),
        w.title,
        w.category,
        `${toNumber(w.duration)} min`,
        `${toNumber(w.caloriesBurned)} kcal`,
        `${toArray(w.exercises).length}`,
      ])
    );
    section(
      'Nutrition Log',
      ['Date', 'Meal', 'Food', 'Portion', 'Calories', 'P / C / F (g)'],
      reportData.nutrition.map((n) => [
        fmtDate(n.date),
        n.mealType,
        n.foodName,
        `${toNumber(n.quantity, 1)} ${n.unit || 'serving'}`,
        `${toNumber(n.calories)} kcal`,
        `${toNumber(n.protein)} / ${toNumber(n.carbs)} / ${toNumber(n.fats)}`,
      ])
    );
    section(
      'Progress Check-ins',
      ['Date', 'Weight', 'Chest', 'Waist', 'Arms', 'Bench', 'Squat'],
      reportData.progress.map((p) => [
        fmtDate(p.date),
        `${toNumber(p.weight)} kg`,
        p.bodyMeasurements?.chest ? `${p.bodyMeasurements.chest} cm` : '--',
        p.bodyMeasurements?.waist ? `${p.bodyMeasurements.waist} cm` : '--',
        p.bodyMeasurements?.arms ? `${p.bodyMeasurements.arms} cm` : '--',
        p.performanceMetrics?.benchPressMax ? `${p.performanceMetrics.benchPressMax} kg` : '--',
        p.performanceMetrics?.squatMax ? `${p.performanceMetrics.squatMax} kg` : '--',
      ])
    );

    if (sectionsPrinted === 0) {
      const y = doc.lastAutoTable.finalY + 14;
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.text('No detailed workout, nutrition, or progress records found for this period.', 14, y);
    }

    doc.save(`FitPulse_Progress_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // 2. Export as CSV format
  const handleExportCSV = () => {
    if (!reportData) return;

    // Quote every cell and neutralize spreadsheet formulas (=, +, -, @) in user-entered text
    const cell = (v) => {
      let t = String(v ?? '');
      if (/^[=+\-@]/.test(t)) t = `'${t}`;
      return `"${t.replace(/"/g, '""')}"`;
    };
    const rows = [['Type', 'Date', 'Title/Name', 'Category/Meal', 'Duration/Quantity', 'Calories', 'Notes']];

    reportData.workouts.forEach((w) =>
      rows.push(['Workout', fmtDate(w.date), w.title, w.category, `${toNumber(w.duration)} mins`, toNumber(w.caloriesBurned), w.notes || ''])
    );
    reportData.nutrition.forEach((n) =>
      rows.push(['Nutrition', fmtDate(n.date), n.foodName, n.mealType, `${toNumber(n.quantity, 1)} ${n.unit || 'serving'}`, toNumber(n.calories), n.notes || ''])
    );
    reportData.progress.forEach((p) =>
      rows.push(['Checkin', fmtDate(p.date), `Weight Check: ${toNumber(p.weight)}kg`, 'Biometrics', `Waist: ${p.bodyMeasurements?.waist || '--'}cm`, '--', p.notes || ''])
    );

    const csvContent = rows.map((r) => r.map(cell).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FitPulse_Fitness_Data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 3. Print-friendly output (print styles live in index.css)
  const handlePrint = () => window.print();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-amber-400" />
            <span>Progress Reporting & Clinical Data Export</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate printable and clinical export reports in PDF and spreadsheet CSV formats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={loading || !reportData}
            className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={loading || !reportData}
            className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Table className="w-4 h-4 text-emerald-400" />
            <span>Export CSV Sheet</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={loading || !reportData}
            className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition flex items-center gap-2 print:hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-4">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-brand-400" />
          Filter Period:
        </span>
        <div className="flex items-center gap-2 text-xs">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
            aria-label="Report type"
          >
            <option value="all">Combined report</option>
            <option value="workouts">Workouts only</option>
            <option value="nutrition">Nutrition only</option>
            <option value="progress">Progress only</option>
          </select>
          <button
            onClick={fetchReports}
            className="px-3 py-1.5 rounded-lg bg-brand-500 text-slate-950 font-bold hover:bg-brand-400"
          >
            Apply
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400">Total Workouts</p>
          <h3 className="text-2xl font-bold text-white mt-1">
            {toNumber(reportData?.summary?.totalWorkouts)}
          </h3>
          <p className="text-[11px] text-brand-400 mt-0.5">
            {toNumber(reportData?.summary?.totalWorkoutMinutes)} active minutes
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400">Calories Burned</p>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">
            {toNumber(reportData?.summary?.totalCaloriesBurned)} kcal
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Total energy output</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400">Meals Recorded</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">
            {toNumber(reportData?.summary?.totalMealsLogged)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {toNumber(reportData?.summary?.totalCaloriesConsumed)} kcal total
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400">Progress Check-ins</p>
          <h3 className="text-2xl font-bold text-cyan-400 mt-1">
            {toNumber(reportData?.summary?.progressEntries)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Biometric records</p>
        </div>
      </div>

      {/* Report Data Preview Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Table className="w-5 h-5 text-amber-400" />
          <span>Report Data Stream Preview</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Name / Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Duration / Qty</th>
                <th className="px-4 py-3 rounded-r-lg">Calories</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading report data...</span>
                  </td>
                </tr>
              )}
              {reportData && !loading && reportData.workouts.length + reportData.nutrition.length + reportData.progress.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                    No records found for the selected period.
                  </td>
                </tr>
              )}
              {reportData?.workouts?.slice(0, 5).map((w) => (
                <tr key={w._id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-brand-500/10 text-brand-400 font-bold border border-brand-500/20">
                      Workout
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">
                    {fmtDate(w.date)}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-white">{w.title}</td>
                  <td className="px-4 py-2.5 text-slate-400">{w.category}</td>
                  <td className="px-4 py-2.5 text-slate-300">{w.duration} mins</td>
                  <td className="px-4 py-2.5 text-amber-400 font-semibold">{w.caloriesBurned} kcal</td>
                </tr>
              ))}

              {reportData?.nutrition?.slice(0, 5).map((n) => (
                <tr key={n._id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      Nutrition
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">
                    {fmtDate(n.date)}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-white">{n.foodName}</td>
                  <td className="px-4 py-2.5 text-slate-400">{n.mealType}</td>
                  <td className="px-4 py-2.5 text-slate-300">{n.quantity} {n.unit}</td>
                  <td className="px-4 py-2.5 text-amber-400 font-semibold">{n.calories} kcal</td>
                </tr>
              ))}
              {reportData?.progress?.slice(0, 5).map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20">
                      Check-in
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">{fmtDate(p.date)}</td>
                  <td className="px-4 py-2.5 font-medium text-white">Weight {toNumber(p.weight)} kg</td>
                  <td className="px-4 py-2.5 text-slate-400">Biometrics</td>
                  <td className="px-4 py-2.5 text-slate-300">{p.bodyMeasurements?.waist ? `Waist ${p.bodyMeasurements.waist} cm` : '--'}</td>
                  <td className="px-4 py-2.5 text-slate-500">--</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
