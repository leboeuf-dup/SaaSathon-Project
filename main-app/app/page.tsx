"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const userName = "ELVIS ZHANG";

const badges = [
  { src: "/badges/badge1.png", alt: "Warrior badge" },
  { src: "/badges/badge1.png", alt: "Streak badge" },
  { src: "/badges/badge1.png", alt: "Focus badge" },
];

function getUserNameSize(name: string) {
  if (name.length > 20) {
    return "text-lg";
  }

  if (name.length > 14) {
    return "text-xl";
  }

  if (name.length > 10) {
    return "text-2xl";
  }

  return "text-3xl";
}

export default function Home() {

  const [showAddQuest, setShowAddQuest] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  
  type Quest = {
    id: number;
    title: string;
    priority_group: number;
    total_xp: number;
  };

  const [quests, setQuests] = useState<Quest[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchQuests = async () => {
    const { data, error } = await supabase
      .from("quests")
      .select("*");

    if (error) {
      console.error("Quest fetch error:", error);
      return;
    }

    setQuests(data ?? []);
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*");

    if (error) {
      console.error("Task fetch error:", error);
      return;
    }

    setTasks(data ?? []);
  };

  useEffect(() => {
    fetchQuests();
    fetchTasks();
  }, []);

  const getTasksForQuest = (questId: number) => {
    return tasks.filter(t => t.quest_id === questId);
  };

  const mainQuests = quests.filter(q => q.priority_group === 1);
  const sideQuests = quests.filter(q => q.priority_group === 2);

  return (

    <main className="min-h-screen bg-neutral-800 text-white">
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
            className={`${getUserNameSize(
              userName,
            )} col-start-1 row-start-2 min-w-0 self-center overflow-hidden text-ellipsis whitespace-nowrap font-black leading-none tracking-wide`}
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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                Level
              </p>
              <p className="text-2xl font-black leading-none">03</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                Coins
              </p>
              <p className="text-2xl font-black leading-none">240</p>
            </div>
          </div>
        </div>
      </section>

      
      <div className="p-2">

        {/* TAB BUTTONS */}
        <div className="flex gap-2">

          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={`flex-1 px-4 py-2 font-bold ${
              activeTab === "OVERVIEW"
                ? "bg-neutral-100 text-black"
                : "bg-neutral-700 text-white"
            }`}
          >
            OVERVIEW
          </button>

          <button
            onClick={() => setActiveTab("MAIN")}
            className={`flex-1 px-4 py-2 font-bold ${
              activeTab === "MAIN"
                ? "bg-neutral-100 text-black"
                : "bg-neutral-700 text-white"
            }`}
          >
            MAIN
          </button>

          <button
            onClick={() => setActiveTab("SIDE")}
            className={`flex-1 px-4 py-2 font-bold ${
              activeTab === "SIDE"
                ? "bg-neutral-100 text-black"
                : "bg-neutral-700 text-white"
            }`}
          >
            SIDE
          </button>

        </div>

        {/* TAB CONTENT */}
        <div className="mt-4 border border-white/30 bg-neutral-900 p-4">

          {/* OVERVIEW */}
          {activeTab === "OVERVIEW" && (
            <div>
              <p className="text-3xl font-bold mb-4">1</p>

              {quests.map((q) => (
                <div key={q.id} className="border border-white/20 p-3 mb-2">

                  <p className="font-bold">{q.title}</p>
                  <p className="text-sm opacity-70">{q.total_xp} XP</p>

                  {/* TASKS */}
                  <div className="mt-2 space-y-2">

                    {getTasksForQuest(q.id).map(task => (
                      <div key={task.id} className="flex items-center gap-2">

                        <input
                          type="checkbox"
                          checked={task.is_done}
                          onChange={async () => {

                            await supabase
                              .from("tasks")
                              .update({ is_done: !task.is_done })
                              .eq("id", task.id);

                            fetchTasks(); // refresh UI
                          }}
                        />

                        <span className={task.is_done ? "line-through opacity-50" : ""}>
                          {task.title} (+{task.xp} XP)
                        </span>

                      </div>
                    ))}

                    <button
                      className="mt-2 text-sm underline text-white/70 hover:text-white"
                      onClick={async () => {
                        await supabase.from("tasks").insert([
                          {
                            quest_id: q.id,
                            title: "New Task",
                            xp: 10,
                          },
                        ]);

                        fetchTasks();
                      }}
                    >
                      + Add Task
                    </button>

                  </div>

                </div>
              ))}
            </div>
          )}

          {/* MAIN */}
          {activeTab === "MAIN" && (
            <div>
              <p className="text-3xl font-bold mb-4">2</p>

              {mainQuests.map((q) => (
                <div key={q.id} className="border border-white/20 p-3 mb-2">

                  <p className="font-bold">{q.title}</p>
                  <p className="text-sm opacity-70">{q.total_xp} XP</p>

                  {/* TASKS */}
                  <div className="mt-2 space-y-2">

                    {getTasksForQuest(q.id).map(task => (
                      <div key={task.id} className="flex items-center gap-2">

                        <input
                          type="checkbox"
                          checked={task.is_done}
                          onChange={async () => {

                            await supabase
                              .from("tasks")
                              .update({ is_done: !task.is_done })
                              .eq("id", task.id);

                            fetchTasks(); // refresh UI
                          }}
                        />

                        <span className={task.is_done ? "line-through opacity-50" : ""}>
                          {task.title} (+{task.xp} XP)
                        </span>

                      </div>
                    ))}

                  </div>

                  <button
                    className="mt-2 text-sm underline text-white/70 hover:text-white"
                    onClick={async () => {
                      await supabase.from("tasks").insert([
                        {
                          quest_id: q.id,
                          title: "New Task",
                          xp: 10,
                        },
                      ]);

                      fetchTasks();
                    }}
                  >
                    + Add Task
                  </button>

                </div>
              ))}
            </div>
          )}

          {/* SIDE */}
          {activeTab === "SIDE" && (
            <div>
              <p className="text-3xl font-bold mb-4">3</p>

              {sideQuests.map((q) => (
                <div key={q.id} className="border border-white/20 p-3 mb-2">

                  <p className="font-bold">{q.title}</p>
                  <p className="text-sm opacity-70">{q.total_xp} XP</p>

                  {/* TASKS */}
                  <div className="mt-2 space-y-2">

                    {getTasksForQuest(q.id).map(task => (
                      <div key={task.id} className="flex items-center gap-2">

                        <input
                          type="checkbox"
                          checked={task.is_done}
                          onChange={async () => {

                            await supabase
                              .from("tasks")
                              .update({ is_done: !task.is_done })
                              .eq("id", task.id);

                            fetchTasks(); // refresh UI
                          }}
                        />

                        <span className={task.is_done ? "line-through opacity-50" : ""}>
                          {task.title} (+{task.xp} XP)
                        </span>

                      </div>
                    ))}

                  </div>

                  <button
                    className="mt-2 text-sm underline text-white/70 hover:text-white"
                    onClick={async () => {
                      await supabase.from("tasks").insert([
                        {
                          quest_id: q.id,
                          title: "New Task",
                          xp: 10,
                        },
                      ]);

                      fetchTasks();
                    }}
                  >
                    + Add Task
                  </button>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      <button
        onClick={() => setShowAddQuest(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-white text-black text-3xl font-bold shadow-lg flex items-center justify-center"
      >
        +
      </button>

      {showAddQuest && (
        <div className="fixed inset-0 bg-black/80 flex flex-col p-6">

          {/* BACK BUTTON */}
          <button
            onClick={() => setShowAddQuest(false)}
            className="text-white text-xl mb-4"
          >
            ← Back
          </button>

          {/* INPUT BOX */}
          <div className="bg-neutral-900 p-6 border border-white/20">
            
            <h2 className="text-xl font-bold mb-4">
              Create Quest
            </h2>

            <input
              value={newQuestTitle}
              onChange={(e) => setNewQuestTitle(e.target.value)}
              placeholder="Enter quest title..."
              className="w-full p-3 bg-neutral-800 text-white border border-white/20 placeholder-white/40 focus:outline-none focus:border-white"
            />

            <button
              className="mt-4 w-full bg-white text-black px-4 py-3 font-bold rounded hover:bg-gray-200 transition"
              onClick={async () => {
                if (!newQuestTitle.trim()) return;

                const { error } = await supabase.from("quests").insert([
                  {
                    title: newQuestTitle,
                    priority_group: activeTab === "MAIN" ? 1 : 2,
                    priority_rank: 1,
                    total_xp: 50,
                  },
                ]);

                if (error) {
                  console.log("SUPABASE ERROR FULL:", JSON.stringify(error, null, 2));
                  return;
                }
                
                await fetchQuests();
                
                setNewQuestTitle("");
                setShowAddQuest(false);
              }}
            >
              Save
            </button>

          </div>

        </div>
      )}

    </main>
  );
}
