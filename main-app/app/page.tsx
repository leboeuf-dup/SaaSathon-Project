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

  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [quests, setQuests] = useState<any[]>([]);

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("quests")
        .select("*");

      console.log("DATA:", data);
      console.log("ERROR:", error);

      setQuests(data ?? []);
    }

    testConnection();
  }, []);

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
        <div className="mt-4 border border-white/30 bg-neutral-900 p-6 text-center text-3xl font-bold">

          {activeTab === "OVERVIEW" && <p>1</p>}
          {activeTab === "MAIN" && <p>2</p>}
          {activeTab === "SIDE" && <p>3</p>}

        </div>

      </div>

    </main>
  );
}
