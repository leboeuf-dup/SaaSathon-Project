const quests = [
  {
    title: "Monday",
    rank: "Main Quest",
    progress: 58,
    active: true,
    tasks: [
      {
        title: "Lecture 1",
        complete: false,
        subtasks: [
          { title: "Ask one question", complete: false },
          { title: "Write three key notes", complete: true },
        ],
      },
      {
        title: "Lecture 2",
        complete: false,
        subtasks: [
          { title: "Review slides before class", complete: true },
          { title: "Mark confusing topics", complete: false },
        ],
      },
      {
        title: "Grocery",
        complete: true,
        subtasks: [
          { title: "Buy fruit", complete: true },
          { title: "Pick up rice", complete: true },
        ],
      },
      {
        title: "Homework",
        complete: false,
        subtasks: [
          { title: "Finish question 4", complete: true },
          { title: "Submit before 8pm", complete: false },
        ],
      },
    ],
  },
  {
    title: "Tuesday",
    rank: "Side Quest",
    progress: 20,
    active: false,
    tasks: [
      {
        title: "Lab Prep",
        complete: false,
        subtasks: [{ title: "Pack laptop charger", complete: false }],
      },
    ],
  },
];

const activeQuest = quests.find((quest) => quest.active) ?? quests[0];
const completedCount = activeQuest.tasks.filter((task) => task.complete).length;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-4 py-5 sm:px-6">
        <header className="border border-white/20 bg-[#0c0c0c]">
          <div className="flex items-center justify-between border-b border-white/20 px-4 py-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-white/55">
                Quest It
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-wide">
                Quest Log
              </h1>
            </div>
            <div className="border border-white/25 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/75">
              Lv. 03
            </div>
          </div>

          <nav className="flex overflow-hidden">
            {quests.map((quest) => (
              <button
                className={`min-h-14 flex-1 border-r border-white/15 px-4 text-left text-sm font-black uppercase tracking-[0.14em] last:border-r-0 ${
                  quest.active
                    ? "bg-white text-black"
                    : "bg-[#0c0c0c] text-white/55"
                }`}
                key={quest.title}
                type="button"
              >
                {quest.title}
              </button>
            ))}
          </nav>
        </header>

        <section className="min-h-[50vh] border-x border-b border-white/20 bg-[#080808]">
          <div className="border-b border-white/15 px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/45">
                  {activeQuest.rank}
                </p>
                <h2 className="mt-1 text-4xl font-black uppercase tracking-wide">
                  {activeQuest.title}
                </h2>
              </div>
              <p className="pt-2 text-right text-xs font-black uppercase tracking-[0.18em] text-white/55">
                {completedCount}/{activeQuest.tasks.length} Clear
              </p>
            </div>

            <div className="mt-4 h-2 border border-white/25 bg-black">
              <div
                className="h-full bg-white"
                style={{ width: `${activeQuest.progress}%` }}
              />
            </div>
          </div>

          <div className="grid gap-3 p-3">
            {activeQuest.tasks.map((task, taskIndex) => (
              <article
                className={`border bg-[#101010] ${
                  task.complete ? "border-white/40" : "border-white/20"
                }`}
                key={task.title}
              >
                <div className="flex min-h-20 items-center gap-4 px-4 py-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center border text-sm font-black ${
                      task.complete
                        ? "border-white bg-white text-black"
                        : "border-white/35 text-white/60"
                    }`}
                  >
                    {task.complete ? "X" : String(taskIndex + 1).padStart(2, "0")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
                      Task
                    </p>
                    <h3
                      className={`mt-1 text-2xl font-black uppercase tracking-wide ${
                        task.complete
                          ? "text-white/45 line-through decoration-white decoration-2"
                          : "text-white"
                      }`}
                    >
                      {task.title}
                    </h3>
                  </div>
                </div>

                <ul className="border-t border-white/10">
                  {task.subtasks.map((subtask) => (
                    <li
                      className="flex min-h-12 items-center gap-3 border-b border-white/10 px-4 py-2 last:border-b-0"
                      key={subtask.title}
                    >
                      <span
                        className={`h-3 w-3 shrink-0 border ${
                          subtask.complete
                            ? "border-white bg-white"
                            : "border-white/35"
                        }`}
                      />
                      <span
                        className={`text-sm font-bold uppercase tracking-[0.08em] ${
                          subtask.complete
                            ? "text-white/40 line-through decoration-white decoration-2"
                            : "text-white/75"
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-4 border border-white/20 bg-[#0c0c0c] p-4">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">
            Add Panel
          </p>
          <div className="mt-3 grid gap-3">
            <input
              className="h-11 border border-white/20 bg-black px-3 text-sm font-bold uppercase tracking-[0.08em] text-white outline-none placeholder:text-white/25"
              placeholder="New quest"
              readOnly
            />
            <input
              className="h-11 border border-white/20 bg-black px-3 text-sm font-bold uppercase tracking-[0.08em] text-white outline-none placeholder:text-white/25"
              placeholder="New task"
              readOnly
            />
            <input
              className="h-11 border border-white/20 bg-black px-3 text-sm font-bold uppercase tracking-[0.08em] text-white outline-none placeholder:text-white/25"
              placeholder="New subtask"
              readOnly
            />
          </div>
        </section>
      </section>
    </main>
  );
}
