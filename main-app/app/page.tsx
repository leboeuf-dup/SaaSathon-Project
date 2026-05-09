"use client";

import Image from "next/image";
import { useRef, useState } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

const userName = "ELVIS ZHANG";

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

export default function Home() {
  const [activeQuest, setActiveQuest] = useState("MONDAY");
  const [promptText, setPromptText] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");

  async function sendPromptToAI(text: string) {
    if (!text.trim()) {
      alert("Speak or type something first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/generate-quests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal: text,
          currentDateTime: new Date().toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "AI request failed.");
        return;
      }

      setAiResult(data);
      console.log("AI result:", data);
    } catch (err) {
      console.error(err);
      alert("AI request failed.");
    } finally {
      setLoading(false);
    }
  }

  function toggleVoiceInput() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);

      if (promptText.trim()) {
        sendPromptToAI(promptText);
      }

      return;
    }

    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input works best in Chrome or Edge.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();

    recognition.lang = "en-NZ";
    recognition.continuous = true;
    recognition.interimResults = true;

    finalTranscriptRef.current = "";
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      const combinedText = (
        finalTranscriptRef.current + interimTranscript
      ).trim();

      setPromptText(combinedText);
    };

    recognition.onerror = () => {
      setListening(false);
      alert("Voice input failed.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  }

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
              userName
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
        <div className="flex gap-2">
          <button
            onClick={() => setActiveQuest("OVERVIEW")}
            className={`flex-1 px-4 py-2 font-bold ${
              activeQuest === "OVERVIEW"
                ? "bg-neutral-100 text-neutral-900"
                : "bg-neutral-700 text-white"
            }`}
          >
            OVERVIEW
          </button>

          <button
            onClick={() => setActiveQuest("MAIN")}
            className={`flex-1 px-4 py-2 font-bold ${
              activeQuest === "MAIN"
                ? "bg-neutral-100 text-neutral-900"
                : "bg-neutral-700 text-white"
            }`}
          >
            MAIN QUESTS
          </button>

          <button
            onClick={() => setActiveQuest("SIDE")}
            className={`flex-1 px-4 py-2 font-bold ${
              activeQuest === "SIDE"
                ? "bg-neutral-100 text-neutral-900"
                : "bg-neutral-700 text-white"
            }`}
          >
            SIDE QUESTS
          </button>
        </div>

        {activeQuest === "OVERVIEW" && (
          <section className="border border-white/30 bg-neutral-900 p-6">
            <h2 className="text-2xl font-semibold">OVERVIEW</h2>
            <p className="mt-2 text-neutral-400">
              All generated quests will appear here.
            </p>
          </section>
        )}

        {activeQuest === "MAIN" && (
          <section className="border border-white/30 bg-neutral-900 p-6">
            <h2 className="text-2xl font-semibold">MAIN QUESTS</h2>
            <p className="mt-2 text-neutral-400">
              High-priority main quests will appear here.
            </p>
          </section>
        )}

        {activeQuest === "SIDE" && (
          <section className="border border-white/30 bg-neutral-900 p-6">
            <h2 className="text-2xl font-semibold">SIDE QUESTS</h2>
            <p className="mt-2 text-neutral-400">
              Low-priority side quests will appear here.
            </p>
          </section>
        )}
      </div>

      <div className="p-4">
        <section className="mt-8 border border-white/30 bg-neutral-900 p-6">
          <h2 className="text-2xl font-semibold">AI Quest Prompt</h2>

          <p className="mt-2 text-neutral-400">
            Speak or type your goal. Press the mic once to start, then press it
            again to stop and send to AI.
          </p>

          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Example: Make my SaaS project the main quest, due Sunday, high priority. Add gym as a side quest."
            className="mt-4 h-32 w-full bg-neutral-800 p-3 text-white outline-none ring-1 ring-white/20 focus:ring-white/50"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={toggleVoiceInput}
              className={`px-4 py-2 font-bold transition ${
                listening
                  ? "bg-red-500 text-white"
                  : "bg-yellow-300 text-neutral-900"
              }`}
            >
              {listening ? "⏹ Stop & Send" : "🎙️ Start Speaking"}
            </button>

            <button
              onClick={() => sendPromptToAI(promptText)}
              disabled={loading}
              className="bg-white px-4 py-2 font-bold text-neutral-900 disabled:bg-neutral-500"
            >
              {loading ? "Generating..." : "Generate From Text"}
            </button>
          </div>
        </section>

        <section className="mt-8 border border-white/30 bg-neutral-900 p-6">
          <h2 className="text-2xl font-semibold">AI Result</h2>

          {!aiResult ? (
            <p className="mt-2 text-neutral-400">
              No AI result yet. Speak or type a prompt above.
            </p>
          ) : (
            <pre className="mt-4 max-h-[500px] overflow-auto whitespace-pre-wrap bg-neutral-950 p-4 text-sm text-green-300">
              {JSON.stringify(aiResult, null, 2)}
            </pre>
          )}
        </section>
      </div>
    </main>
  );
}