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



//const userName: string = "ELVIS ZHANG";
//const level: number = 3;
//const coins: number = 50;


const badges = [
  { src: "/badges/badge1.png", alt: "Warrior badge" },
  { src: "/badges/badge9.png", alt: "Streak badge" },
  { src: "/badges/badge15.png", alt: "Focus badge" },
];

function getUserNameSize(name: string) {
  if (name.length > 20) return "text-lg";
  if (name.length > 14) return "text-xl";
  if (name.length > 10) return "text-2xl";
  return "text-3xl";
}

type Quest = {
  id: number;
  user_id: number;
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



  //AI

    const [aiNote, setAiNote] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    const handleAiGenerate = async () => {
      if (!aiNote.trim()) return;
      setAiLoading(true);

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: aiNote }),
      });

      const data = await res.json();

      if (data.quests) {
        for (const quest of data.quests) {
          const { data: questData } = await supabase.from("quests").insert([{
            title: quest.title,
            priority_group: quest.priority_group,
            priority_rank: quest.priority_rank,
            due_date: quest.due_date,
            total_xp: quest.total_xp,
            user_id: user?.id,  // ADD THIS
          }]).select().single();

          if (questData && quest.tasks?.length > 0) {
            await supabase.from("tasks").insert(
              quest.tasks.map((t: { title: string; xp: number }) => ({
                quest_id: questData.id,
                title: t.title,
                xp: t.xp,
                is_done: false,
                user_id: user?.id,  // ADD THIS
              }))
            );
          }
        }
        await fetchQuests();
        await fetchTasks();

      }

      if (data.message) {
        alert(data.message); // or show it in the UI somewhere
      }
      

      setAiNote("");
      setAiLoading(false);
      closeMenu();
    };



  //Menu
  //Coins
  const [coins, setCoins] = useState(0);

  const [newQuestType, setNewQuestType] = useState<"1" | "2">("1");
  const [newQuestRank, setNewQuestRank] = useState(1);
  const [newQuestDate, setNewQuestDate] = useState("");
  const [newQuestXp, setNewQuestXp] = useState(50);

  //Log in system
  const [user, setUser] = useState<{ id: string; username: string; level: number; total_xp: number } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginName, setLoginName] = useState("");


  const level = user ? Math.floor(user.total_xp / 1000) + 1 : null;

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
  if (!user) return;
  const { data, error } = await supabase.from("quests").select("*").eq("user_id", user.id);
  if (error) { console.error("Quest fetch error:", error); return; }
  setQuests(data ?? []);
};

const [keyboardOffset, setKeyboardOffset] = useState(0);

useEffect(() => {
  const handleResize = () => {
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      const offset = window.innerHeight - visualViewport.height;
      setKeyboardOffset(offset);
    }
  };

  window.visualViewport?.addEventListener("resize", handleResize);
  return () => window.visualViewport?.removeEventListener("resize", handleResize);
}, []);


const fetchTasks = async () => {
  if (!user) return;
  const { data: questIds } = await supabase
    .from("quests")
    .select("id")
    .eq("user_id", user.id);
  
  if (!questIds || questIds.length === 0) { setTasks([]); return; }
  
  const ids = questIds.map(q => q.id);
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .in("quest_id", ids);
  
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

//Add stuff
const handleAddXp = async () => {
  if (!user) return;
  const newXp = user.total_xp + 100;
  await supabase.from("users").update({ total_xp: newXp }).eq("id", user.id);
  setUser({ ...user, total_xp: newXp });
};

const handleAddCoins = () => {
  setCoins(coins + 5);
};


//RESET  
  const handleReset = async () => {
  
  await supabase.from("tasks").delete().eq("user_id", user?.id);
  await supabase.from("quests").delete().eq("user_id", user?.id);

  // Run to Delete all tasks and quests
  //await supabase.from("tasks").delete().neq("id", 0);
  //await supabase.from("quests").delete().neq("id", 0);

  // Insert 3 dummy quests
  const { data: questData } = await supabase.from("quests").insert([
  { title: "Engineering Assignment", priority_group: 1, priority_rank: 1, due_date: null, total_xp: 600, user_id: user?.id },
  { title: "Prepare for Road Trip", priority_group: 1, priority_rank: 2, due_date: null, total_xp: 600, user_id: user?.id },
  { title: "RC Car Project", priority_group: 2, priority_rank: 1, due_date: null, total_xp: 400, user_id: user?.id },
  ]).select();

  // Insert dummy tasks linked to those quests
  if (questData) {
    await supabase.from("tasks").insert([
      { quest_id: questData[0].id, title: "Research requirements", xp: 50, is_done: false },
      { quest_id: questData[0].id, title: "Complete calculations", xp: 80, is_done: false },
      { quest_id: questData[1].id, title: "Check vehicle oil and tires", xp: 50, is_done: false },
      { quest_id: questData[1].id, title: "Pack hiking gear", xp: 90, is_done: false },
      { quest_id: questData[2].id, title: "Watch RC vehicle videos", xp: 60, is_done: false },
    ]);
  }

  await supabase.from("users").update({ total_xp: 0 }).eq("id", user?.id);
  setCoins(0);

  // Log out
  localStorage.removeItem("quest_user_id");
  setUser(null);

  //await fetchQuests();
  //await fetchTasks();
  //setQuests([]);
  //setTasks([]);
};

const handleLogout = () => {
  localStorage.removeItem("quest_user_id");
  setCoins(0);
  setUser(null);
};


const handleToggleQuest = async (quest: Quest) => {
  const newDone = !quest.completed;
  await supabase.from("quests").update({ completed: newDone }).eq("id", quest.id);
  setQuests(quests.map(q => q.id === quest.id ? { ...q, completed: newDone } : q));

  if (user) {
    const newXp = newDone
      ? user.total_xp + quest.total_xp
      : Math.max(0, user.total_xp - quest.total_xp);
    await supabase.from("users").update({ total_xp: newXp }).eq("id", user.id);
    setUser({ ...user, total_xp: newXp });
  }

  setCoins(prev => newDone ? prev + 1 : Math.max(0, prev - 1));
};



  //Handles login
  const handleStartDemo = async () => {
      if (!loginName.trim()) return;

      // Check if username already exists
      const { data: existing } = await supabase
        .from("users")
        .select("*")
        .eq("username", loginName.trim())
        .single();

      if (existing) {
        // User found — just log them in
        localStorage.setItem("quest_user_id", existing.id);
        setShowLogin(false);
        setLoginName("");
        setUser(existing); // triggers useEffect → fetchQuests + fetchTasks
        return;
      }

      // New user — create them with dummy data
      const { data, error } = await supabase.from("users").insert([{ username: loginName.trim() }]).select().single();
      if (error) { console.error(error); return; }

      const { data: questData } = await supabase.from("quests").insert([
        { title: "Engineering Assignment", priority_group: 1, priority_rank: 1, due_date: null, total_xp: 200, user_id: data.id },
        { title: "Prepare for Road Trip", priority_group: 1, priority_rank: 2, due_date: null, total_xp: 200, user_id: data.id },
        { title: "RC Car Project", priority_group: 2, priority_rank: 1, due_date: null, total_xp: 100, user_id: data.id },
      ]).select();

      if (questData) {
        await supabase.from("tasks").insert([
          { quest_id: questData[0].id, title: "Research requirements", xp: 50, is_done: false },
          { quest_id: questData[0].id, title: "Complete calculations", xp: 80, is_done: false },
          { quest_id: questData[1].id, title: "Check vehicle oil and tires", xp: 50, is_done: false },
          { quest_id: questData[1].id, title: "Pack hiking gear", xp: 90, is_done: false },
          { quest_id: questData[2].id, title: "Watch RC vehicle videos", xp: 60, is_done: false },
        ]);
      }

      localStorage.setItem("quest_user_id", data.id);
      setShowLogin(false);
      setLoginName("");
      setUser(data);
    };



  console.log(quests)

    useEffect(() => {
      const savedId = localStorage.getItem("quest_user_id");
      if (savedId) {
        supabase.from("users").select("*").eq("id", savedId).single().then(({ data }) => {
          if (data) setUser(data);
        });
      }
    }, []);

    useEffect(() => {
      if (user) {
        fetchQuests();
        fetchTasks();
      } else {
        setQuests([]);
        setTasks([]);
      }
    }, [user]);


  const getTasksForQuest = (questId: number) =>
    tasks.filter((t) => t.quest_id === questId);

  const isQuestCompleted = (questId: number) => {
  const quest = quests.find(q => q.id === questId);
  if (quest?.completed) return true;
  const questTasks = getTasksForQuest(questId);
  return questTasks.length > 0 && questTasks.every((t) => t.is_done);
};

  // Sort quests by priority_rank
  const sortedQuests = [...quests].sort((a, b) => a.priority_rank - b.priority_rank);
  const mainQuests = sortedQuests.filter((q) => q.priority_group === 1);
  const sideQuests = sortedQuests.filter((q) => q.priority_group === 2);

const handleToggleTask = async (task: Task) => {
  const newDone = !task.is_done;
  await supabase.from("tasks").update({ is_done: newDone }).eq("id", task.id);

  const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, is_done: newDone } : t);
  setTasks(updatedTasks);

  if (user) {
    let newXp = newDone
      ? user.total_xp + task.xp
      : Math.max(0, user.total_xp - task.xp);

    // Check if all tasks in the quest are now done
    const questTasks = updatedTasks.filter(t => t.quest_id === task.quest_id);
    const allDone = questTasks.length > 0 && questTasks.every(t => t.is_done);
    const wasDone = tasks.filter(t => t.quest_id === task.quest_id).every(t => t.is_done);

    if (allDone && !wasDone) {
      // Just completed the quest
      const quest = quests.find(q => q.id === task.quest_id);
      newXp += quest?.total_xp ?? 0;
      setCoins(prev => prev + 1);
    } else if (!allDone && wasDone) {
      // Just uncompleted the quest
      const quest = quests.find(q => q.id === task.quest_id);
      newXp = Math.max(0, newXp - (quest?.total_xp ?? 0));
      setCoins(prev => Math.max(0, prev - 1));
    }

    await supabase.from("users").update({ total_xp: newXp }).eq("id", user.id);
    setUser({ ...user, total_xp: newXp });
  }
};

const handleAddTask = async (questId: number) => {
  await supabase.from("tasks").insert([
    { quest_id: questId, title: "New Task", xp: 10 },
  ]);
  fetchTasks(); // make sure this is here
};

  const handleAddQuest = async () => {
  if (!newQuestTitle.trim()) return;
  const { error } = await supabase.from("quests").insert([{
  title: newQuestTitle,
  priority_group: Number(newQuestType),
  priority_rank: newQuestRank,
  due_date: newQuestDate || null,
  total_xp: newQuestType === "1" ? 200 : 100,
  user_id: user?.id,  // ADD THIS
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
            <span className="text-lg break-words min-w-0">{task.title}</span>
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
            QUESTED
          </p>

          <h1 className={`${getUserNameSize(user?.username ?? "GUEST")} col-start-1 row-start-2  min-w-0 self-center overflow-hidden text-ellipsis whitespace-nowrap font-black leading-none tracking-wide`}>
            {user ? (
              user.username.toUpperCase()
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="text-white text-sm  p-1 border rounded-full"
              >
                LOG IN
              </button>
            )}
          </h1>

          <div className="col-start-1 row-start-3 flex items-end gap-3">
            {badges.map((badge, index) => (
              <div
                className={`relative h-10 w-10 overflow-hidden rounded-full transition-opacity duration-300 ${
                  (level ?? 1) >= index + 1 ? "opacity-100" : "opacity-20"
                }`}
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

          <div className="col-start-2 row-span-3 row-start-1 grid content-center gap-2 pb-5 text-right">
            
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">Coins</p>
              <p className="text-2xl font-black leading-none">{user ? coins : "-"}</p>
            </div>
            
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">Level</p>
              <p className="text-2xl font-black leading-none">{level ?? "-"}</p>

            </div>
            
          </div>
        </div>

        
      </section>

          {user && (
            <div className="relative z-10 w-full px-4 py-2 -mt-7"
              style={{
                background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))"
              }}
            >
              <div className="flex justify-end text-[10px] text-zinc-400 font-bold mb-1">
                <span>{user.total_xp % 1000} / 1000 XP</span>
              </div>
              <div className="h-1 bg-zinc-800/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-700 rounded-full transition-all duration-500"
                  style={{ width: `${(user.total_xp % 1000) / 10}%` }}
                />
              </div>
            </div>
          )}
      


      






      <div className="p-2 py-1">

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
                    className={`break-words min-w-0 text-xl font-bold pt-1 ${
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
              <div className="flex items-center justify-between">
                <h2 className={`break-words min-w-0 text-xl font-bold pt-1 ${
                  isQuestCompleted(quest.id) ? "line-through text-zinc-400" : ""
                }`}>
                  {quest.title}
                </h2>
                {getTasksForQuest(quest.id).length === 0 && (
                  <div
                    onClick={() => handleToggleQuest(quest)}
                    className={`w-5 h-5 rounded border-2 mt-2 flex items-center justify-center cursor-pointer shrink-0 ${
                      quest.completed ? "bg-rose-700 border-rose-900" : "bg-zinc-600 border-zinc-500"
                    }`}
                  >
                    {quest.completed && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                )}
              </div>
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
              <div className="flex items-center justify-between">
                <h2 className={`break-words min-w-0 text-xl font-bold pt-1 ${
                  isQuestCompleted(quest.id) ? "line-through text-zinc-400" : ""
                }`}>
                  {quest.title}
                </h2>
                {getTasksForQuest(quest.id).length === 0 && (
                  <div
                    onClick={() => handleToggleQuest(quest)}
                    className={`w-5 h-5 rounded border-2 flex mt-2 items-center justify-center cursor-pointer shrink-0 ${
                      quest.completed ? "bg-rose-700 border-rose-900" : "bg-zinc-600 border-zinc-500"
                    }`}
                  >
                    {quest.completed && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                )}
              </div>
              {renderTasks(quest)}
            </section>
          ))}
        </section>

      </div>


      {(showMenu || menuClosing) && (
        <button
          onClick={() => { setShowAddQuest(true); setShowMenu(false); }}
          className={`fixed bottom-6 right-23 px-6 h-14 z-50 rounded-full text-sm font-bold shadow-lg transition-colors bg-rose-800 text-zinc-300 ${
            menuClosing ? "menu-exit" : "menu-enter"
          }`}
        >
          + NEW QUEST
        </button>
      )}

        <button
          onClick={() => { setEditMode(!editMode); if (showMenu) closeMenu(); }}
          className={`fixed bottom-6 left-6 px-6 h-14 z-50 pl-8 pr-8 rounded-full text-sm font-bold shadow-lg transition-colors duration-250 ${
            editMode ? "bg-rose-900 text-white" : "bg-rose-800 text-zinc-300"
          }`}
        >
          {editMode ? "✓ DONE" : "✎ EDIT"}
        </button>


      {/* ADD QUEST BUTTON */}
      <button
        onClick={() => showMenu ? closeMenu() : setShowMenu(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 z-50 rounded-full text-white text-3xl font-bold shadow-lg flex items-center justify-center transition-colors duration-250 ${
          showMenu ? "bg-rose-900" : "bg-rose-800"
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
      <div className={`fixed inset-0 bg-black/50 flex flex-col p-6 z-50 py-35 ${
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

      
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center ${
          menuClosing ? "menu-exit" : "menu-enter"
        }`}>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="border px-4 h-8 rounded-full text-xs font-bold text-zinc-300 hover:text-rose-400 transition-colors whitespace-nowrap"
            >
              RESET ACCOUNT
            </button>
            <button
              onClick={handleLogout}
              className="border px-4 h-8 rounded-full text-xs font-bold text-zinc-300 hover:text-rose-400 transition-colors whitespace-nowrap"
            >
              LOG OUT
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddXp}
              className="border px-4 h-8 rounded-full text-xs font-bold text-zinc-300 hover:text-yellow-400 transition-colors whitespace-nowrap"
            >
              + XP
            </button>
            <button
              onClick={handleAddCoins}
              className="border px-4 h-8 rounded-full text-xs font-bold text-zinc-300 hover:text-yellow-400 transition-colors whitespace-nowrap"
            >
              + COINS
            </button>
          </div>
        </div>


    </div>
  </div>
)}



      {(showMenu || menuClosing) && (
        <div
  className={`fixed top-47 left-6 right-6 bg-zinc-800 rounded-lg border border-white/10 p-3 flex flex-col gap-2 z-50 ${menuClosing ? "menu-exit" : "menu-enter"}`}
>
            <div className="flex gap-2 p-1 pb-0 font-bold justify-center">AI ASSISTANT</div>

            {/* Text input */}
            <textarea
            value={aiNote}
            onChange={(e) => setAiNote(e.target.value)}
            placeholder="Quick note..."
            rows={6}
            className="w-full p-3 bg-zinc-900 text-white text-sm border border-white/10 rounded placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
          />

          <button
            className="w-full py-2 text-sm font-bold text-white bg-rose-900 hover:bg-rose-700 rounded transition-colors"
            onClick={handleAiGenerate}
            disabled={aiLoading}
          >
            {aiLoading ? "GENERATING..." : "✦ CREATE"}
          </button>

            </div>
      )}


      {showLogin && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
            <div className="bg-zinc-800 p-6 rounded-lg border border-white/10 flex flex-col gap-3 w-full">
              <h2 className="text-xl font-bold">Enter your name</h2>
              <input
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Your name..."
                className="w-full p-3 bg-zinc-900 text-white border border-white/20 placeholder-white/40 focus:outline-none focus:border-white rounded"
              />
              <button
                onClick={handleStartDemo}
                className="w-full bg-rose-900 text-white px-4 py-3 font-bold rounded hover:bg-rose-700 transition-colors"
              >
                LOG IN
              </button>
            </div>
          </div>
        )}


      <div className="fixed bottom-0 left-0 right-0 h-35 pointer-events-none z-10"
        style={{
          background: "linear-gradient(to bottom, transparent 40%, black 99%)"
        }}
      />


      {/* FOOTER */}
      <footer
        className="h-200 w-full fixed bottom-0 left-0 pointer-events-none z-[-1]"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, black, transparent 90%), url('/bottom.png')",
          backgroundSize: "100% auto",
          backgroundPosition: "bottom center",
          backgroundRepeat: "no-repeat",
        }}
      />

    </main>
  );
}
