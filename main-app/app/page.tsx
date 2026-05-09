"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Numbering system
const getOrdinal = (n: number) => {
  const s = ["TH", "ST", "ND", "RD"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};



const userName: string = "ELVIS ZHANG";
const level: number = 3;
const coins: number = 50;

const badges = [
  { src: "/badges/badge1.png", alt: "Warrior badge" },
  { src: "/badges/badge1.png", alt: "Streak badge" },
  { src: "/badges/badge1.png", alt: "Focus badge" },
];

function getUserNameSize(name: string) {
  if (name.length > 20) return "text-lg";
  if (name.length > 14) return "text-xl";
  if (name.length > 10) return "text-2xl";
  return "text-3xl";
}

type Quest = {
  id: number;
  title: string;
  priority_group: number;
  priority_rank: number;
  due_date: string;
  total_xp: number;
  completed: boolean;
};

type Task = {
  id: number;
  quest_id: number;
  title: string;
  xp: number;
  is_done: boolean;
};

export default function Home() {
  //Menu
  const [newQuestType, setNewQuestType] = useState<"1" | "2">("1");
  const [newQuestRank, setNewQuestRank] = useState(1);
  const [newQuestDate, setNewQuestDate] = useState("");
  const [newQuestXp, setNewQuestXp] = useState(50);

  //Edit mode
  const [editMode, setEditMode] = useState(false);

  //Delete and edit
  const handleDeleteQuest = async (questId: number) => {
    await supabase.from("tasks").delete().eq("quest_id", questId);
    await supabase.from("quests").delete().eq("id", questId);
    fetchQuests();
    fetchTasks();
  };

  const [activeQuest, setActiveQuest] = useState("1");
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState("");

  //-----------
  const [showMenu, setShowMenu] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);

  const closeMenu = () => {
    setMenuClosing(true);
    setTimeout(() => { setShowMenu(false); setMenuClosing(false); }, 200);
  };//------------


  const [questClosing, setQuestClosing] = useState(false);

  const closeAddQuest = () => {
    setQuestClosing(true);
    setTimeout(() => { setShowAddQuest(false); setQuestClosing(false); }, 200);
  };


  //Actually where they're stored
  const [quests, setQuests] = useState<Quest[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchQuests = async () => {
    const { data, error } = await supabase.from("quests").select("*");
    if (error) { console.error("Quest fetch error:", error); return; }
    setQuests(data ?? []);
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*");
    if (error) { console.error("Task fetch error:", error); return; }
    setTasks(data ?? []);
  };


  //Handle delete and edit
  const handleRenameTask = async (task: Task, newTitle: string) => {
    if (!newTitle.trim() || newTitle === task.title) return;
    await supabase.from("tasks").update({ title: newTitle }).eq("id", task.id);
    fetchTasks();
  };

  const handleDeleteTask = async (taskId: number) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    fetchTasks();
  };






  console.log(quests)

  useEffect(() => {
    fetchQuests();
    fetchTasks();
  }, []);

  const getTasksForQuest = (questId: number) =>
    tasks.filter((t) => t.quest_id === questId);

  const isQuestCompleted = (questId: number) => {
    const questTasks = getTasksForQuest(questId);
    return questTasks.length > 0 && questTasks.every((t) => t.is_done);
  };

  // Sort quests by priority_rank
  const sortedQuests = [...quests].sort((a, b) => a.priority_rank - b.priority_rank);
  const mainQuests = sortedQuests.filter((q) => q.priority_group === 1);
  const sideQuests = sortedQuests.filter((q) => q.priority_group === 2);

  const handleToggleTask = async (task: Task) => {
    await supabase
      .from("tasks")
      .update({ is_done: !task.is_done })
      .eq("id", task.id);
    fetchTasks();
  };

  const handleAddTask = async (questId: number) => {
    await supabase.from("tasks").insert([
      { quest_id: questId, title: "New Task", xp: 10 },
    ]);
    fetchTasks();
  };

  const handleAddQuest = async () => {
  if (!newQuestTitle.trim()) return;
  const { error } = await supabase.from("quests").insert([{
    title: newQuestTitle,
    priority_group: Number(newQuestType),
    priority_rank: newQuestRank,
    due_date: newQuestDate || null,
    total_xp: newQuestType === "1" ? 200 : 100,
  }]);
  if (error) { console.log("SUPABASE ERROR:", JSON.stringify(error, null, 2)); return; }
  await fetchQuests();
  setNewQuestTitle("");
  setNewQuestType("1");
  setNewQuestRank(1);
  setNewQuestDate("");
  setNewQuestXp(50);
  setShowAddQuest(false);
};

  // Reusable task list renderer
  const renderTasks = (quest: Quest) => (
  <div className="mt-2 pl-2 space-y-1 border-l border-zinc-600">
    {getTasksForQuest(quest.id).map((task) => (
      <div
        key={task.id}
        className={`text-xs flex justify-between items-center gap-2 py-1 ${
          task.is_done ? "text-zinc-500 line-through" : "text-zinc-300"
        }`}
      >
        <div className="flex items-center justify-between w-full">

          {editMode ? (
            <input
              defaultValue={task.title}
              onBlur={(e) => handleRenameTask(task, e.target.value)}
              className="text-lg bg-zinc-600 text-white rounded px-2 py-0.5 flex-1 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          ) : (
            <span className="text-lg">{task.title}</span>
          )}

          <div className="flex items-center gap-0">
            {editMode ? (
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-rose-500 font-bold text-sm px-3 pl-5 hover:text-rose-500 transition-colors"
              >
                ✕
              </button>
            ) : (
              <>
                <span>+{task.xp}XP</span>
                <div
                  onClick={() => handleToggleTask(task)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer shrink-0 mx-2 ${
                    task.is_done ? "bg-rose-700 border-rose-900" : "bg-zinc-600 border-zinc-500"
                  }`}
                >
                  {task.is_done && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    ))}
    {editMode && (
    <div className="mt-2 flex gap-2">
      <button
        className="flex-1 py-2 rounded border border border-zinc-200 text-zinc-200 text-xs font-bold tracking-widest hover:border-zinc-400 hover:text-zinc-300 transition-colors"
        onClick={() => handleAddTask(quest.id)}
      >
        + ADD TASK
      </button>
      <button
        className="px-4 py-2 rounded border border border-rose-200 text-rose-400 text-xs font-bold tracking-widest hover:border-rose-600 hover:text-rose-300 transition-colors"
        onClick={() => handleDeleteQuest(quest.id)}
      >
        DELETE QUEST
      </button>
    </div>
  )}
  </div>
);

  return (
    <main className="min-h-screen bg-neutral-900 text-white z-10">

      {/* HEADER BANNER */}
      <section
        className="relative h-[14vh] min-h-28 bg-neutral-950 px-4 py-3"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.7)), url('/banner2.png')",
          backgroundSize: "100% auto",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-10 grid h-full grid-cols-[minmax(0,1fr)_72px] grid-rows-[1px_1fr_34px] gap-x-4">
          <p className="col-start-1 row-start-1 self-start text-[8px] font-bold uppercase tracking-[0.28em] text-white/70">
            QUEST IT
          </p>

          <h1
            className={`${getUserNameSize(userName)} col-start-1 row-start-2 min-w-0 self-center overflow-hidden text-ellipsis whitespace-nowrap font-black leading-none tracking-wide`}
          >
            {userName}
          </h1>

          <div className="col-start-1 row-start-3 flex items-end gap-3">
            {badges.map((badge) => (
              <div
                className="relative h-10 w-10 overflow-hidden rounded-full"
                key={badge.alt}
              >
                <Image
                  className="scale-175 object-cover"
                  src={badge.src}
                  alt={badge.alt}
                  fill
                  sizes="40px"
                />
              </div>
            ))}
          </div>

          <div className="col-start-2 row-span-3 row-start-1 grid content-center gap-3 text-right">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">Level</p>
              <p className="text-2xl font-black leading-none">{level}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">Coins</p>
              <p className="text-2xl font-black leading-none">{coins}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="p-2">

        {/* TAB BUTTONS */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveQuest("1")}
            className={`flex-1 px-4 py-4 text-xs font-bold transition-colors duration-150 ease-out rounded-t-md ${
              activeQuest === "1" ? "bg-rose-900" : "bg-rose-950"
            }`}
          >
            OVERVIEW
          </button>

          <button
            onClick={() => setActiveQuest("2")}
            className={`flex-2 px-4 py-2 text-xs font-bold transition-colors duration-150 ease-out rounded-t-md ${
              activeQuest === "2" ? "bg-zinc-800" : "bg-zinc-700"
            }`}
          >
            MAIN QUEST
          </button>

          <button
            onClick={() => setActiveQuest("3")}
            className={`flex-2 px-4 py-2 text-xs font-bold transition-colors duration-150 ease-out rounded-t-md ${
              activeQuest === "3" ? "bg-zinc-800" : "bg-zinc-700"
            }`}
          >
            SIDE QUEST
          </button>
          
        </div>

        {/* OVERVIEW TAB */}
        <section
          className={`bg-rose-900 p-2 pt-3 pb-0.5 transition-opacity duration-250 ease-out rounded-b-lg ${
            activeQuest === "1" ? "opacity-100" : "opacity-0 pointer-events-none hidden overflow-hidden"
          }`}
        >
          {sortedQuests.map((quest) => (
            <section
                key={quest.id}
                className={`bg-zinc-800 p-3 rounded-md mb-2 pt-2 transition-all ${
                  isQuestCompleted(quest.id) ? "opacity-60" : "opacity-100"
                }`}
              >
                <p className="text-zinc-400 text-xs flex justify-between">
                  <span>{quest.priority_group === 1 ? "MAIN QUEST" : "SIDE QUEST"}</span>
                  {quest.due_date && quest.due_date.slice(0, 10) !== "2000-01-01" && (
                    <span>DUE {new Date(quest.due_date + 'T00:00:00').toLocaleDateString()}</span>
                  )}
                </p>
                <div className="flex items-center justify-between">
                  <h2
                    className={`text-xl font-bold pt-1 ${
                      isQuestCompleted(quest.id) ? "line-through text-zinc-400" : ""
                    }`}
                  >
                    {quest.title}
                  </h2>
                  {editMode && (
                    <button
                      className="px-4 py-2 pt-1 pb-1 rounded border border-rose-200 text-rose-400 text-xs font-bold tracking-widest hover:border-rose-600 hover:text-rose-300 transition-colors"
                      onClick={() => handleDeleteQuest(quest.id)}
                    >
                      DELETE
                    </button>
                  )}
                </div>
              </section>
          ))}
        </section>

        {/* MAIN QUEST TAB */}
        <section
          className={`bg-zinc-800 p-2 pt-3 pb-0.5 transition-opacity duration-250 ease-out rounded-b-lg ${
            activeQuest === "2" ? "opacity-100" : "opacity-0 pointer-events-none hidden overflow-hidden"
          }`}
        >
          {mainQuests.map((quest) => (
            <section
              key={quest.id}
              className={`bg-zinc-700 p-3 rounded-md mb-2 pt-2 transition-all ${
                isQuestCompleted(quest.id) ? "opacity-60" : "opacity-100"
              }`}
            >
              <p className="text-zinc-400 text-xs flex justify-between">
                <span>
                {getOrdinal(quest.priority_rank)} PRIORITY</span>

                {quest.due_date && quest.due_date.slice(0, 10) !== "2000-01-01" && (
                  <span>DUE {new Date(quest.due_date).toLocaleDateString()}
                  
                  </span>
                )}
              </p>
              <h2
                className={`text-xl font-bold pt-1 ${
                  isQuestCompleted(quest.id) ? "line-through text-zinc-400" : ""
                }`}
              >
                {quest.title}
              </h2>
              {renderTasks(quest)}
            </section>
          ))}
        </section>

        {/* SIDE QUEST TAB */}
        <section
          className={`bg-zinc-800 p-2 pt-3 pb-0.5 transition-opacity duration-250 ease-out rounded-b-lg ${
            activeQuest === "3" ? "opacity-100" : "opacity-0 pointer-events-none hidden overflow-hidden"
          }`}
        >
          {sideQuests.map((quest) => (
            <section
              key={quest.id}
              className={`bg-zinc-700 p-3 rounded-md mb-2 pt-2 transition-all ${
                isQuestCompleted(quest.id) ? "opacity-60" : "opacity-100"
              }`}
            >
              <p className="text-zinc-400 text-xs flex justify-between">
                <span>{getOrdinal(quest.priority_rank)} PRIORITY</span>
                {quest.due_date && quest.due_date.slice(0, 10) !== "2000-01-01" && (
                  <span>DUE {new Date(quest.due_date).toLocaleDateString()}</span>
                )}
              </p>
              <h2
                className={`text-xl font-bold pt-1 ${
                  isQuestCompleted(quest.id) ? "line-through text-zinc-400" : ""
                }`}
              >
                {quest.title}
              </h2>
              {renderTasks(quest)}
            </section>
          ))}
        </section>

      </div>


      {(showMenu || menuClosing) && (
        <button
          onClick={() => { setShowAddQuest(true); setShowMenu(false); }}
          className={`fixed bottom-6 right-23 px-6 h-14 rounded-full text-sm font-bold shadow-lg transition-colors bg-zinc-700 text-zinc-300 ${
            menuClosing ? "menu-exit" : "menu-enter"
          }`}
        >
          + NEW QUEST
        </button>
      )}

        <button
          onClick={() => { setEditMode(!editMode); if (showMenu) closeMenu(); }}
          className={`fixed bottom-6 left-6 px-6 h-14 pl-8 pr-8 rounded-full text-sm font-bold shadow-lg transition-colors duration-250 ${
            editMode ? "bg-rose-900 text-white" : "bg-zinc-700 text-zinc-300"
          }`}
        >
          {editMode ? "✓ DONE" : "✎ EDIT"}
        </button>


      {/* ADD QUEST BUTTON */}
      <button
        onClick={() => showMenu ? closeMenu() : setShowMenu(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full text-white text-3xl font-bold shadow-lg flex items-center justify-center transition-colors duration-250 ${
          showMenu ? "bg-rose-900" : "bg-zinc-700"
        }`}
      >
        <Image
          src="/chat.png"
          alt="Add quest"
          width={26}
          height={28}
          className="invert"
        />
      </button>

      {/* ADD QUEST MODAL */}
    {(showAddQuest || questClosing) && (
      <div className={`fixed inset-0 bg-black/60 flex flex-col p-6 z-50 py-20 ${
        questClosing ? "menu-exit" : "menu-enter"
      }`}>

    <div className="bg-zinc-800 p-6 rounded-lg border border-white/10 flex flex-col gap-3">

      {/* Title */}
      <input
        value={newQuestTitle}
        onChange={(e) => setNewQuestTitle(e.target.value)}
        placeholder="Quest title..."
        className="w-full p-3 bg-zinc-900 text-white border border-white/20 placeholder-white/40 focus:outline-none focus:border-white rounded"
      />

      {/* Quest Type */}
            <div>
              <p className="text-xs text-zinc-400 font-bold mb-1 tracking-widest">TYPE</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewQuestType("1")}
                  className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${
                    newQuestType === "1" ? "bg-rose-900 text-white" : "bg-zinc-700 text-zinc-300"
                  }`}
                >
                  MAIN QUEST
                </button>
                <button
                  onClick={() => setNewQuestType("2")}
                  className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${
                    newQuestType === "2" ? "bg-rose-900 text-white" : "bg-zinc-700 text-zinc-300"
                  }`}
                >
                  SIDE QUEST
                </button>
              </div>
            </div>

            {/* Priority Rank */}
            <div>
              <p className="text-xs text-zinc-400 font-bold mb-1 tracking-widest">PRIORITY RANK</p>
              <input
                type="number"
                min={1}
                value={newQuestRank}
                onChange={(e) => setNewQuestRank(Number(e.target.value))}
                className="w-full p-3 bg-zinc-900 text-white border border-white/20 focus:outline-none focus:border-white rounded"
              />
            </div>

            {/* Due Date */}
            <div>
              <p className="text-xs text-zinc-400 font-bold mb-1 tracking-widest">DUE DATE</p>
              <input
                type="date"
                value={newQuestDate}
                onChange={(e) => setNewQuestDate(e.target.value)}
                className="w-full p-3 bg-zinc-900 text-white border border-white/20 focus:outline-none focus:border-white rounded"
              />
            </div>

            {/* Total XP */}
            <div>
              <p className="text-xs text-zinc-400 font-bold mb-1 tracking-widest">TOTAL XP</p>
              <p className="p-3 bg-zinc-900 text-white rounded">
                {newQuestType === "1" ? 200 : 100} XP
              </p>
            </div>

            <button
              className="w-full bg-rose-900 text-white px-4 py-3 font-bold rounded hover:bg-rose-600 transition-colors"
              onClick={handleAddQuest}
            >
              ADD NEW QUEST
            </button>

            <button
        className="w-full bg-zinc-700 text-white px-4 py-3 font-bold rounded hover:bg-rose-600 transition-colors"
        onClick={closeAddQuest}
      >
        CANCEL
      </button>
    </div>
  </div>
)}



      {(showMenu || menuClosing) && (
        <div className={`fixed bottom-27 left-6 right-6 bg-zinc-800 rounded-lg border border-white/10 p-3 flex flex-col gap-2 z-50 ${menuClosing ? "menu-exit" : "menu-enter"}`}>

            <div className="flex gap-2 p-1 pb-0 font-bold justify-center">AI ASSISTANT</div>

            {/* Text input */}
            <textarea
              placeholder="Quick note..."
              rows={6}
              className="w-full p-3 bg-zinc-900 text-white text-sm border border-white/10 rounded placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
            />

            {/* AI Assistant button */}
            <button className="w-full py-2 text-sm font-bold text-white bg-rose-900 hover:bg-rose-700 rounded transition-colors"
            onClick={() => closeMenu()}
            >
              ✦ START
            </button>

            </div>
      )}

      {/* FOOTER */}
      <footer
        className="h-200 w-full fixed bottom-0 left-0 pointer-events-none z-[-1]"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, black, transparent 90%), linear-gradient(to top, black 0%, transparent 10%), url('/bottom.png')",
          backgroundSize: "100% auto",
          backgroundPosition: "bottom center",
          backgroundRepeat: "no-repeat",
        }}
      />

    </main>
  );
}
