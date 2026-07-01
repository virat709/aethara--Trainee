import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Activity, Droplet, Coffee, Heart, Plus, Trash2, Calendar, Search, FileText, CheckCircle2 } from 'lucide-react';
import { DailyLog } from '../types';
import { getTodayDateString, getMoodDetails, formatHumanDate } from '../utils';

interface LogsSectionProps {
  logs: DailyLog[];
  onAddOrUpdateLog: (log: Omit<DailyLog, 'id' | 'createdAt'> & { id?: string }) => void;
  onDeleteLog: (id: string) => void;
  searchTerm?: string;
  waterTarget: number;
  stepsTarget: number;
  sleepTarget: number;
}

export default function LogsSection({
  logs,
  onAddOrUpdateLog,
  onDeleteLog,
  searchTerm = '',
  waterTarget,
  stepsTarget,
  sleepTarget,
}: LogsSectionProps) {
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Form states
  const [mood, setMood] = useState<number>(4);
  const [waterIntake, setWaterIntake] = useState<number>(2000);
  const [steps, setSteps] = useState<number>(8000);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [notes, setNotes] = useState<string>('');

  // When selected date changes, auto-load existing log data if it exists
  const existingLog = useMemo(() => {
    return logs.find((l) => l.date === selectedDate);
  }, [logs, selectedDate]);

  // Sync state with existing log or reset to sensible defaults
  React.useEffect(() => {
    if (existingLog) {
      setMood(existingLog.mood);
      setWaterIntake(existingLog.waterIntake);
      setSteps(existingLog.steps);
      setSleepHours(existingLog.sleepHours);
      setNotes(existingLog.notes);
    } else {
      setMood(4);
      setWaterIntake(2000);
      setSteps(8050);
      setSleepHours(7.5);
      setNotes('');
    }
  }, [existingLog, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrUpdateLog({
      id: existingLog?.id,
      date: selectedDate,
      mood,
      waterIntake: Number(waterIntake),
      waterTarget,
      steps: Number(steps),
      stepsTarget,
      sleepHours: Number(sleepHours),
      sleepTarget,
      notes: notes.trim(),
    });
  };

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => b.date.localeCompare(a.date));
  }, [logs]);

  // Apply search filtering on logs list
  const filteredLogs = useMemo(() => {
    return sortedLogs.filter(
      (l) =>
        l.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.date.includes(searchTerm)
    );
  }, [sortedLogs, searchTerm]);

  return (
    <div className="space-y-6" id="logs-section-root">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight flex items-center gap-2">
          <Activity className="text-cyan-400 w-8 h-8" />
          <span>Biometric Telemetry Logs</span>
        </h1>
        <p className="text-slate-400 mt-1">
          Journal daily notes, log custom hydration, sleep, step values, and build a precise timeline of physical progress.
        </p>
      </div>

      {/* Main Split Layout: Log Editor (Left) vs Log History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Create/Update Log Form (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
              <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-cyan-400" />
                <span>{existingLog ? 'Update Registry Entry' : 'New Registry Entry'}</span>
              </h2>
              {existingLog && (
                <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Registered
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Date Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Telemetry Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-hidden focus:border-cyan-500/50"
                  required
                />
              </div>

              {/* Mood Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">General Mood Factor</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const moodDetail = getMoodDetails(val);
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setMood(val)}
                        className={`flex-1 py-2.5 rounded-xl border text-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                          mood === val
                            ? 'bg-gradient-to-tr from-cyan-950/40 to-cyan-500/10 border-cyan-500 text-cyan-400 shadow-lg'
                            : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60 hover:opacity-100'
                        }`}
                        title={moodDetail.label}
                      >
                        <span>{moodDetail.emoji}</span>
                        <span className="text-[9px] font-bold font-mono mt-0.5">{val}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Water Intake slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-400">Water Intake (ml)</label>
                  <span className="text-cyan-400 font-mono font-bold">{waterIntake} ml</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4000"
                  step="250"
                  value={waterIntake}
                  onChange={(e) => setWaterIntake(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[10px] text-slate-500 block font-mono">System benchmark target is set at {waterTarget}ml</span>
              </div>

              {/* Steps slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-400">Steps Count</label>
                  <span className="text-purple-400 font-mono font-bold">{steps.toLocaleString()} steps</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20000"
                  step="500"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
                <span className="text-[10px] text-slate-500 block font-mono">System benchmark target is set at {stepsTarget.toLocaleString()} steps</span>
              </div>

              {/* Sleep slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-400">Sleep Duration (hrs)</label>
                  <span className="text-amber-400 font-mono font-bold">{sleepHours} hrs</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="text-[10px] text-slate-500 block font-mono">System benchmark target is set at {sleepTarget} hours</span>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Daily Reflection & Notes</label>
                <textarea
                  placeholder="Record insights, milestones, or mood reflections for telemetry logs..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg mt-4 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>{existingLog ? 'Record Registry Updates' : 'Commit Telemetry Entry'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Log History (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
            <div className="pb-3 border-b border-slate-900/60 flex justify-between items-center">
              <div>
                <h3 className="text-base font-display font-bold text-white">Biometric Telemetry Stream</h3>
                <p className="text-[11px] text-slate-400">History of recorded physical and wellness entries</p>
              </div>
            </div>

            {/* List entries scrollpane */}
            <div className="max-h-[580px] overflow-y-auto space-y-3.5 pr-1 mt-4">
              {filteredLogs.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-xs space-y-2">
                  <Activity className="w-10 h-10 mx-auto text-slate-800" />
                  <p className="font-semibold text-slate-400">No telemetry records match current filters.</p>
                  <p className="text-[11px]">Use the left editor pane to commit wellness parameters.</p>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const moodInfo = getMoodDetails(log.mood);
                  
                  // Compute stats percentage targets
                  const waterPct = Math.min(Math.round((log.waterIntake / log.waterTarget) * 100), 100);
                  const stepsPct = Math.min(Math.round((log.steps / log.stepsTarget) * 100), 100);
                  const sleepPct = Math.min(Math.round((log.sleepHours / log.sleepTarget) * 100), 100);

                  return (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all group"
                    >
                      {/* Top stats info */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white font-display">
                            {formatHumanDate(log.date)}
                          </span>
                          <p className="text-[10px] text-slate-500 font-mono">ID: {log.id}</p>
                        </div>

                        {/* Mood and delete button */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 text-slate-300">
                            <span>{moodInfo.emoji}</span>
                            <span>{moodInfo.label}</span>
                          </span>
                          <button
                            onClick={() => {
                              if (window.confirm(`Permanently delete log for ${formatHumanDate(log.date)}?`)) {
                                onDeleteLog(log.id);
                              }
                            }}
                            className="p-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 rounded-lg cursor-pointer transition-all"
                            title="Delete log entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Log text notes */}
                      {log.notes && (
                        <p className="text-xs text-slate-300 italic leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-850/60">
                          "{log.notes}"
                        </p>
                      )}

                      {/* Health parameters grid */}
                      <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-mono">
                        {/* Hydration */}
                        <div className="p-2 bg-slate-950/40 rounded-lg border border-slate-850/40 space-y-1">
                          <div className="flex justify-between text-slate-400">
                            <span>Hydration</span>
                            <span className="text-cyan-400 font-bold">{waterPct}%</span>
                          </div>
                          <p className="text-slate-200 font-bold">{log.waterIntake} ml</p>
                        </div>

                        {/* Movement */}
                        <div className="p-2 bg-slate-950/40 rounded-lg border border-slate-850/40 space-y-1">
                          <div className="flex justify-between text-slate-400">
                            <span>Movement</span>
                            <span className="text-purple-400 font-bold">{stepsPct}%</span>
                          </div>
                          <p className="text-slate-200 font-bold">{log.steps.toLocaleString()} steps</p>
                        </div>

                        {/* Rest sleep */}
                        <div className="p-2 bg-slate-950/40 rounded-lg border border-slate-850/40 space-y-1">
                          <div className="flex justify-between text-slate-400">
                            <span>Rest Sleep</span>
                            <span className="text-amber-400 font-bold">{sleepPct}%</span>
                          </div>
                          <p className="text-slate-200 font-bold">{log.sleepHours} hrs</p>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
