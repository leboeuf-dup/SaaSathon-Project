"use client";

import Image from "next/image";
import { useState } from "react";
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function Home() {
  const [listening, setListening] = useState(false);
  const [goal, setGoal] = useState("");
  const [quests, setQuests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function startVoiceInput() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice input is not supported in this browser. Use Chrome or Edge.");
    return;
  }

  const recognition = new window.webkitSpeechRecognition();

  recognition.lang = "en-NZ";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    setListening(true);
  };

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    setGoal(transcript);
  };

  recognition.onerror = () => {
    alert("Voice input failed. Try again.");
    setListening(false);
  };

  recognition.onend = () => {
    setListening(false);
  };

  recognition.start();
}

  async function generateQuests() {
    if (!goal.trim()) {
      alert("Type a goal first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/generate-quests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "AI failed.");
        return;
      }

      setQuests(data.quests);
    } catch {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-800 text-white">
      <section
        className="relative h-[14vh] min-h-28 bg-neutral-950 px-4 py-3"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.7)), url('/banner1.jpg')",
          backgroundSize: "100% auto",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-10 flex h-full items-center justify-between gap-4">
          <div className="relative flex h-full flex-1 items-center">
            <h3 className="absolute left-0 top-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">
              QUEST IT
            </h3>

            <div className="translate-y-3">
              <h1 className="text-3xl font-black leading-none tracking-wide">
                ELVIS
              </h1>

              <div className="mt-2 flex translate-y-1 items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-black/40">
                  <Image src="/badges/badge1.png" alt="Warrior badge" fill sizes="32px" className="object-cover" />
                </div>
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-black/40">
                  <Image src="/badges/badge2.png" alt="Streak badge" fill sizes="32px" className="object-cover" />
                </div>
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-black/40">
                  <Image src="/badges/badge3.png" alt="Focus badge" fill sizes="32px" className="object-cover" />
                </div>
              </div>
            </div>
          </div>

          <div className="self-center border border-white/40 bg-black/40 px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
              Level
            </p>
            <p className="text-2xl font-black leading-none">03</p>
          </div>
        </div>
      </section>

      <div className="p-4">
        <section className="border border-white/30 bg-neutral-900 p-6">
          <h2 className="text-2xl font-semibold">AI Quest Generator</h2>

          <p className="mt-2 text-neutral-400">
            Type a goal. AI will turn it into simple quests.
          </p>

          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Example: I need to finish my SaaS hackathon project by Sunday"
            className="mt-4 h-28 w-full bg-neutral-800 p-3 text-white outline-none ring-1 ring-white/20 focus:ring-white/50"
          />

          <button
          onClick={startVoiceInput}
          className="mt-3 mr-3 bg-yellow-300 px-4 py-2 font-bold text-neutral-900"
                    >
          {listening ? "Listening..." : "🎙️ Speak Goal"}
          </button>

          <button
            onClick={generateQuests}
            disabled={loading}
            className="mt-4 bg-white px-4 py-2 font-bold text-neutral-900 disabled:bg-neutral-500"
          >
            {loading ? "Generating..." : "Generate Quests"}
          </button>
        </section>

        <section className="mt-8 border border-white/30 bg-neutral-900 p-6">
          <h2 className="text-2xl font-semibold">Your Quests</h2>

          {quests.length === 0 ? (
            <p className="mt-2 text-neutral-400">
              No quests yet. Generate some using AI.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {quests.map((quest, index) => (
                <li
                  key={index}
                  className="border border-white/20 bg-neutral-800 p-3 text-neutral-100"
                >
                  <span className="font-bold text-yellow-300">
                    Quest {index + 1}:
                  </span>{" "}
                  {quest}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}