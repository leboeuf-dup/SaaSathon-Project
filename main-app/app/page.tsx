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

// REMOVED: top-level savedUsername const (was SSR-unsafe and non-reactive)

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
  date?: string;
  total_xp: number;
  completed?: boolean;
};

type Task = {
  id: number;
  quest_id: number;
  title: string;
  xp: number;
  is_done: boolean;
};

export default function Home() {

  const [usernameInput, setUsernameInput] = useState("");
  // FIX 1: username is now reactive state instead of a top-level const
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [activeQuest, setActiveQuest] = useState("1");
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState("");

  const [quests, setQuests] = useState<Quest[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchData = async (uid: string) => {
    const { data: questsData, error: questError } = await supabase
      .from("quests")
      .select("*")
      .eq("user_id", uid);

    if (questError) console.error(questError);
    setQuests(questsData ?? []);

    // FIX 2: guard tasks query when no quests exist
    if (!questsData || questsData.length === 0) {
      setTasks([]);
      return;
    }

    const { data: tasksData, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .in(
        "quest_id",
        questsData.map((q) => q.id)
      );

    if (taskError) console.error(taskError);
    setTasks(tasksData ?? []);
  };

  const handleUserLogin = async () => {
    if (!usernameInput.trim()) return;

    let { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("username", usernameInput)
      .single();

    let uid: string;

    if (!existingUser) {
      const { data: newUser, error } = await supabase
        .from("users")
        .insert([{ username: usernameInput }])
        .select()
        .single();

      if (error) {
        console.error(error);
        return;
      }

      uid = newUser.id;
    } else {
      uid = existingUser.id;
    }

    setUserId(uid);
    // FIX 1: set reactive username state on login
    setUsername(usernameInput);
    // Clear input after login
    setUsernameInput("");

    localStorage.setItem("user_id", uid);
    localStorage.setItem("username", usernameInput);

    await fetchData(uid);
  };

  useEffect(() => {
    const initUser = async () => {
      setLoadingUser(true);

      const savedUser = localStorage.getItem("user_id");
      const savedName = localStorage.getItem("username");

      if (savedUser && savedName) {
        setUserId(savedUser);
        // FIX 1: set reactive username state on restore
        setUsername(savedName);
        await fetchData(savedUser);
        setLoadingUser(false);
        return;
      }

      setLoadingUser(false);
    };

    initUser();
  }, []);

  const getTasksForQuest = (questId: number) =>
    tasks.filter((t) => t.quest_id === questId);

  const isQuestCompleted = (questId: number) => {
    const questTasks = getTasksForQuest(questId);
    return questTasks.length > 0 && questTasks.every((t) => t.is_done);
  };

  const sortedQuests = [...quests].sort((a, b) => a.priority_rank - b.priority_rank);
  const mainQuests = sortedQuests.filter((q) => q.priority_group === 1);
  const sideQuests = sortedQuests.filter((q) => q.priority_group === 2);

  const handleToggleTask = async (task: Task) => {
    await supabase
      .from("tasks")
      .update({ is_done: !task.is_done })
      .eq("id", task.id);

    if (userId) await fetchData(userId);
  };

  const handleAddTask = async (questId: number) => {
    await supabase.from("tasks").insert([
      { quest_id: questId, title: "New Task", xp: 10 },
    ]);

    if (userId) await fetchData(userId);
  };

  const handleAddQuest = async () => {
    if (!newQuestTitle.trim() || !userId) return;

    const { error } = await supabase.from("quests").insert([
      {
        title: newQuestTitle,
        priority_group: activeQuest === "2" ? 1 : 2,
        priority_rank: 1,
        total_xp: 50,
        user_id: userId,
      },
    ]);

    if (error) {
      console.log("SUPABASE ERROR:", JSON.stringify(error, null, 2));
      return;
    }

    await fetchData(userId);
    setNewQuestTitle("");
    setShowAddQuest(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    setUserId(null);
    setUsername("");
    setQuests([]);
    setTasks([]);
  };

  const renderTasks = (quest: Quest) => (
    <div className="mt-2 pl-2 space-y-1 border-l border-zinc-600">
      {getTasksForQuest(quest.id).map((task) => (
        <div
          key={task.id}
          className={`text-xs flex justify-between items-center gap-2 ${
            task.is_done ? "text-zinc-500 line-through" : "text-zinc-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={task.is_done}
              onChange={() => handleToggleTask(task)}
              className="accent-rose-500"
            />
            <span>{task.title}</span>
          </div>
          <span>{task.xp} XP</span>
        </div>
      ))}
      <button
        className="mt-1 text-xs underline text-zinc-500 hover:text-zinc-300 transition-colors"
        onClick={() => handleAddTask(quest.id)}
      >
        + Add Task
      </button>
    </div>
  );

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <h1 className="text-white text-2xl mb-4">UserName:</h1>

        <input
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          className="p-3 bg-zinc-800 text-white border border-white/20 rounded w-64"
          placeholder="Enter username..."
        />

        <button
          onClick={handleUserLogin}
          className="mt-4 px-6 py-2 bg-rose-700 text-white rounded"
        >
          Continue
        </button>
      </div>
    );
  }

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

          {/* FIX 1: use reactive username state instead of savedUsername */}
          <h1
            className={`${getUserNameSize(username)} col-start-1 row-start-2 min-w-0 self-center overflow-hidden text-ellipsis whitespace-nowrap font-black leading-none tracking-wide`}
          >
            {username}
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
            <button
              onClick={handleLogout}
              className="text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors text-right"
            >
              Log out
            </button>
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
                {quest.date && quest.date.slice(0, 10) !== "2000-01-01" && (
                  <span>DUE: {new Date(quest.date).toLocaleDateString()}</span>
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
                <span>{getOrdinal(quest.priority_rank)} PRIORITY</span>
                {quest.date && quest.date.slice(0, 10) !== "2000-01-01" && (
                  <span>DUE: {new Date(quest.date).toLocaleDateString()}</span>
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
                {quest.date && quest.date.slice(0, 10) !== "2000-01-01" && (
                  <span>DUE: {new Date(quest.date).toLocaleDateString()}</span>
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

      {/* ADD QUEST BUTTON */}
      <button
        onClick={() => setShowAddQuest(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-rose-700 text-white text-3xl font-bold shadow-lg flex items-center justify-center hover:bg-rose-600 transition-colors"
      >
        +
      </button>

      {/* ADD QUEST MODAL */}
      {showAddQuest && (
        <div className="fixed inset-0 bg-black/80 flex flex-col p-6 z-50">
          <button
            onClick={() => setShowAddQuest(false)}
            className="text-white text-xl mb-4"
          >
            ← Back
          </button>

          <div className="bg-zinc-800 p-6 rounded-lg border border-white/10">
            <h2 className="text-xl font-bold mb-4">Create Quest</h2>

            <input
              value={newQuestTitle}
              onChange={(e) => setNewQuestTitle(e.target.value)}
              placeholder="Enter quest title..."
              className="w-full p-3 bg-zinc-900 text-white border border-white/20 placeholder-white/40 focus:outline-none focus:border-white rounded"
            />

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setActiveQuest("2")}
                className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${
                  activeQuest === "2" ? "bg-rose-700 text-white" : "bg-zinc-700 text-zinc-300"
                }`}
              >
                MAIN QUEST
              </button>
              <button
                onClick={() => setActiveQuest("3")}
                className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${
                  activeQuest === "3" ? "bg-rose-700 text-white" : "bg-zinc-700 text-zinc-300"
                }`}
              >
                SIDE QUEST
              </button>
            </div>

            <button
              className="mt-4 w-full bg-rose-700 text-white px-4 py-3 font-bold rounded hover:bg-rose-600 transition-colors"
              onClick={handleAddQuest}
            >
              Save Quest
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
