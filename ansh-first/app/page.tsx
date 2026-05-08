"use client";

import { useMemo, useState } from "react";

type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type Quest = {
  id: string;
  title: string;
  completed: boolean;
  diamonds: number;
};

const DAYS: Day[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString();
}

// Level requirements pattern
function getLevelRequirement(level: number) {
  const base = [15, 20, 30, 45];
  if (level <= base.length) return base[level - 1];
  return base[base.length - 1] + (level - base.length) * 15;
}

function calculateLevel(totalDiamonds: number) {
  let level = 1;
  let remaining = totalDiamonds;

  while (true) {
    const req = getLevelRequirement(level);
    if (remaining >= req) {
      remaining -= req;
      level++;
    } else break;
  }

  const currentRequirement = getLevelRequirement(level);

  return {
    level,
    diamondsIntoLevel: remaining,
    diamondsToNext: currentRequirement,
    progressPercent: Math.round((remaining / currentRequirement) * 100),
  };
}

// Sparkle sound
function playDiamondSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.09;
    masterGain.connect(ctx.destination);

    const notes = [784, 988, 1175, 1568];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.value = 0.001;

      osc.connect(gain);
      gain.connect(masterGain);

      const start = ctx.currentTime + i * 0.05;
      const end = start + 0.14;

      osc.start(start);
      osc.stop(end);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, end);
    });

    setTimeout(() => ctx.close(), 500);
  } catch {}
}

export default function Home() {
  const [questsByDay, setQuestsByDay] = useState<Record<Day, Quest[]>>({
    Monday: [
      {
        id: generateId(),
        title: "Finish lab report draft",
        completed: false,
        diamonds: 5,
      },
      {
        id: generateId(),
        title: "Gym session",
        completed: true,
        diamonds: 5,
      },
    ],
    Tuesday: [
      {
        id: generateId(),
        title: "Revise lecture notes",
        completed: false,
        diamonds: 5,
      },
      {
        id: generateId(),
        title: "Make hackathon SaaS project",
        completed: false,
        diamonds: 5,
      },
    ],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  const [selectedDay, setSelectedDay] = useState<Day>("Monday");
  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [diamondPopup, setDiamondPopup] = useState("");

  const totalDiamonds = useMemo(() => {
    let total = 0;
    for (const day of DAYS) {
      for (const quest of questsByDay[day]) {
        if (quest.completed) total += quest.diamonds;
      }
    }
    return total;
  }, [questsByDay]);

  const totalQuests = useMemo(() => {
    let count = 0;
    for (const day of DAYS) count += questsByDay[day].length;
    return count;
  }, [questsByDay]);

  const totalCompleted = useMemo(() => {
    let count = 0;
    for (const day of DAYS) {
      for (const quest of questsByDay[day]) {
        if (quest.completed) count++;
      }
    }
    return count;
  }, [questsByDay]);

  const levelData = useMemo(() => {
    return calculateLevel(totalDiamonds);
  }, [totalDiamonds]);

  const streakData = useMemo(() => {
    const activeDays = DAYS.map((day) => {
      const completed = questsByDay[day].filter((q) => q.completed).length;
      return completed > 0;
    });

    let currentStreak = 0;
    for (let i = 0; i < activeDays.length; i++) {
      if (activeDays[i]) currentStreak++;
      else break;
    }

    let bestStreak = 0;
    let temp = 0;
    for (let i = 0; i < activeDays.length; i++) {
      if (activeDays[i]) {
        temp++;
        bestStreak = Math.max(bestStreak, temp);
      } else temp = 0;
    }

    return { currentStreak, bestStreak };
  }, [questsByDay]);

  function completedCount(day: Day) {
    return questsByDay[day].filter((q) => q.completed).length;
  }

  function totalCount(day: Day) {
    return questsByDay[day].length;
  }

  function addQuest() {
    const title = newQuestTitle.trim();
    if (!title) return;

    const quest: Quest = {
      id: generateId(),
      title,
      completed: false,
      diamonds: 5,
    };

    setQuestsByDay((prev) => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], quest],
    }));

    setNewQuestTitle("");
  }

  function toggleQuest(day: Day, questId: string) {
    setQuestsByDay((prev) => {
      const quest = prev[day].find((q) => q.id === questId);
      if (!quest) return prev;

      const willComplete = !quest.completed;

      if (willComplete) {
        playDiamondSound();
        setDiamondPopup(`+💎 ${quest.diamonds}`);
        setTimeout(() => setDiamondPopup(""), 900);
      }

      return {
        ...prev,
        [day]: prev[day].map((q) =>
          q.id === questId ? { ...q, completed: !q.completed } : q
        ),
      };
    });
  }

  function deleteQuest(day: Day, questId: string) {
    setQuestsByDay((prev) => ({
      ...prev,
      [day]: prev[day].filter((q) => q.id !== questId),
    }));
  }

  return (
    <div className="min-h-screen text-slate-900 bg-gradient-to-br from-sky-200 via-cyan-200 to-yellow-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900">
              🗺️ Quest Planner
            </h1>
            <p className="text-slate-700 mt-3 font-medium">
              Your week is a journey. Complete quests, earn diamonds.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="relative bg-white/60 border border-white/70 rounded-2xl px-5 py-4 shadow-lg overflow-hidden">
              <p className="text-sm text-slate-600 font-semibold">
                Total Diamonds
              </p>
              <p className="text-2xl font-black mt-1 text-slate-900">
                💎 {totalDiamonds}
              </p>

              {diamondPopup && (
                <div className="absolute right-4 top-2 animate-flyUp font-black text-cyan-700">
                  {diamondPopup}
                </div>
              )}
            </div>

            <div className="bg-white/60 border border-white/70 rounded-2xl px-5 py-4 shadow-lg">
              <p className="text-sm text-slate-600 font-semibold">Streak</p>
              <p className="text-2xl font-black mt-1 text-slate-900">
                🔥 {streakData.currentStreak}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                Best: 🏆 {streakData.bestStreak}
              </p>
            </div>

            <div className="bg-white/60 border border-white/70 rounded-2xl px-5 py-4 shadow-lg">
              <p className="text-sm text-slate-600 font-semibold">Progress</p>
              <p className="text-2xl font-black mt-1 text-slate-900">
                {totalCompleted}/{totalQuests}
              </p>
            </div>
          </div>
        </div>

        {/* LEVEL BAR */}
        <div className="mt-8 bg-white/50 border border-white/70 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Level {levelData.level} Adventurer
              </h2>
              <p className="text-slate-700 text-sm mt-1 font-semibold">
                {levelData.diamondsIntoLevel} / {levelData.diamondsToNext} 💎 to
                reach Level {levelData.level + 1}
              </p>
            </div>

            <div className="text-sm text-slate-600 font-black">
              {levelData.progressPercent}% to next level
            </div>
          </div>

          <div className="mt-4 w-full bg-white/60 rounded-full h-4 overflow-hidden border border-white/80">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
              style={{ width: `${levelData.progressPercent}%` }}
            />
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* VERTICAL MAP */}
          <div className="lg:col-span-2 bg-white/50 border border-white/70 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-black mb-2">🌴 Weekly Journey</h2>
            <p className="text-slate-700 text-sm font-semibold mb-8">
              Islands are days. Quest nodes fill up as you complete them.
            </p>

            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute left-7 top-6 bottom-6 w-2 rounded-full bg-cyan-200/60" />

              <div className="space-y-10">
                {DAYS.map((day) => {
                  const completed = completedCount(day);
                  const total = totalCount(day);
                  const ratio = total === 0 ? 0 : completed / total;

                  // color intensity based on completion ratio
                  const progressClass =
                    ratio === 0
                      ? "bg-cyan-200"
                      : ratio < 0.25
                      ? "bg-cyan-300"
                      : ratio < 0.5
                      ? "bg-cyan-400"
                      : ratio < 0.75
                      ? "bg-blue-500"
                      : ratio < 1
                      ? "bg-blue-600"
                      : "bg-blue-800";

                  const isSelected = selectedDay === day;

                  return (
                    <div key={day} className="relative pl-16">
                      {/* Day node */}
                      <button
                        onClick={() => setSelectedDay(day)}
                        className="absolute left-2 top-0"
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl border-2 shadow-md flex items-center justify-center text-xl transition
                            ${
                              isSelected
                                ? "bg-yellow-200 border-yellow-500 scale-105"
                                : "bg-white/80 border-white hover:border-cyan-500/60"
                            }`}
                        >
                          🏝️
                        </div>
                      </button>

                      {/* Day Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-black text-slate-900">
                            {day}
                          </h3>
                          <p className="text-sm text-slate-600 font-semibold">
                            {completed}/{total} quests completed
                          </p>
                        </div>

                        <div
                          className={`px-4 py-2 rounded-2xl text-white font-black shadow-md ${progressClass}`}
                        >
                          {Math.round(ratio * 100)}%
                        </div>
                      </div>

                      {/* Quest nodes */}
                      <div className="mt-4 flex flex-wrap gap-3">
                        {questsByDay[day].length === 0 ? (
                          <div className="text-slate-600 font-semibold text-sm">
                            No quests.
                          </div>
                        ) : (
                          questsByDay[day].map((quest) => (
                            <button
                              key={quest.id}
                              onClick={() => toggleQuest(day, quest.id)}
                              title={quest.title}
                              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 shadow-sm transition max-w-[280px]
                                ${
                                  quest.completed
                                    ? "bg-blue-700 text-white border-blue-900"
                                    : "bg-white/80 text-slate-900 border-white hover:border-cyan-500/60"
                                }`}
                            >
                              <span className="text-lg font-black">
                                {quest.completed ? "✅" : "⬜"}
                              </span>

                              <span className="font-bold truncate">
                                {quest.title}
                              </span>

                              <span className="text-sm font-black ml-auto">
                                💎{quest.diamonds}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SIDE PANEL (NO DUPLICATION) */}
          <div className="bg-white/50 border border-white/70 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-black">📜 Quest Controls</h2>
            <p className="text-slate-700 text-sm font-semibold mt-2">
              Add quests to the selected day.
            </p>

            {/* Add quest */}
            <div className="mt-6">
              <p className="text-slate-700 font-black text-sm">
                Add Quest ({selectedDay})
              </p>

              <div className="mt-2 flex gap-2">
                <input
                  value={newQuestTitle}
                  onChange={(e) => setNewQuestTitle(e.target.value)}
                  placeholder="New quest..."
                  className="w-full bg-white/80 border border-white/80 rounded-xl px-4 py-2 outline-none focus:border-cyan-500/70 font-semibold"
                />
                <button
                  onClick={addQuest}
                  className="bg-cyan-600 hover:bg-cyan-500 transition font-black text-white rounded-xl px-4 py-2"
                >
                  +
                </button>
              </div>

              <p className="text-xs text-slate-500 font-semibold mt-2">
                Each quest = <span className="font-black">💎 5</span>
              </p>
            </div>

            {/* Delete selected day quests */}
            <div className="mt-8">
              <p className="text-slate-700 font-black text-sm">
                Manage {selectedDay}
              </p>

              <div className="mt-3 space-y-2 max-h-[360px] overflow-auto pr-1">
                {questsByDay[selectedDay].length === 0 ? (
                  <div className="text-slate-600 font-semibold text-sm">
                    Nothing to manage.
                  </div>
                ) : (
                  questsByDay[selectedDay].map((quest) => (
                    <div
                      key={quest.id}
                      className="flex items-center justify-between rounded-2xl px-4 py-3 border bg-white/70 border-white/70"
                    >
                      <p className="text-sm font-bold text-slate-800 truncate max-w-[170px]">
                        {quest.title}
                      </p>

                      <button
                        onClick={() => deleteQuest(selectedDay, quest.id)}
                        className="text-xs font-black text-red-500 hover:text-red-700"
                      >
                        DELETE
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 space-y-3">
              <div className="bg-white/60 border border-white/70 rounded-2xl p-4">
                <p className="text-slate-600 text-sm font-semibold">
                  Weekly Progress
                </p>
                <p className="text-2xl font-black mt-1 text-slate-900">
                  {totalCompleted}/{totalQuests}
                </p>
              </div>

              <div className="bg-white/60 border border-white/70 rounded-2xl p-4">
                <p className="text-slate-600 text-sm font-semibold">
                  Next Level In
                </p>
                <p className="text-2xl font-black mt-1 text-slate-900">
                  💎 {levelData.diamondsToNext - levelData.diamondsIntoLevel}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-slate-600 text-sm font-semibold">
          Productivity disguised as a journey map.
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes flyUp {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          20% {
            transform: translateY(0px);
            opacity: 1;
          }
          100% {
            transform: translateY(-35px);
            opacity: 0;
          }
        }

        .animate-flyUp {
          animation: flyUp 0.9s ease-out forwards;
        }
      `}</style>
    </div>
  );
}