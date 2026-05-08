const quest = {
  title: "Monday",
  progress: 62,
  tasks: [
    {
      title: "Lecture 1",
      status: "In Progress",
      subtasks: [
        { title: "Ask one question", done: false },
        { title: "Write three key notes", done: true },
      ],
    },
    {
      title: "Lecture 2",
      status: "Ready",
      subtasks: [
        { title: "Review slides before class", done: true },
        { title: "Mark confusing topics", done: false },
      ],
    },
    {
      title: "Lecture 3",
      status: "Locked",
      subtasks: [],
    },
    {
      title: "Grocery",
      status: "Ready",
      subtasks: [
        { title: "Buy fruit", done: false },
        { title: "Pick up rice", done: false },
      ],
    },
    {
      title: "Homework",
      status: "In Progress",
      subtasks: [
        { title: "Finish question 4", done: true },
        { title: "Submit before 8pm", done: false },
      ],
    },
  ],
};

const completedTasks = quest.tasks.filter((task) =>
  task.subtasks.length > 0 && task.subtasks.every((subtask) => subtask.done),
).length;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#eef0e8] text-[#1b1b18]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#25251f]/10 pb-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#53634f]">
              Quest It
            </p>
            <h1 className="mt-1 text-3xl font-black">Daily Quest Board</h1>
          </div>
          <div className="rounded-md bg-[#243b2a] px-4 py-2 text-sm font-bold text-white">
            Level 3
          </div>
        </header>

        <section className="grid min-h-[33vh] gap-5 py-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="flex flex-col justify-between rounded-lg border border-[#25251f]/10 bg-[#fbfaf4] p-5 shadow-sm">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#796a3f]">
                Current Quest
              </p>
              <h2 className="mt-3 text-5xl font-black leading-none">
                {quest.title}
              </h2>
              <p className="mt-4 max-w-sm text-base leading-7 text-[#615f56]">
                Complete the main tasks, clear optional subtasks, and finish the
                day with a cleaner quest log.
              </p>
            </div>

            <div className="mt-8">
              <div className="mb-2 flex items-center justify-between text-sm font-bold">
                <span>Quest progress</span>
                <span>{quest.progress}%</span>
              </div>
              <div className="h-3 rounded-full bg-[#d8d4c5]">
                <div
                  className="h-3 rounded-full bg-[#4b7c59]"
                  style={{ width: `${quest.progress}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-[#615f56]">
                {completedTasks} completed task groups out of{" "}
                {quest.tasks.length}.
              </p>
            </div>
          </aside>

          <div className="grid gap-3">
            {quest.tasks.map((task) => (
              <article
                className="rounded-lg border border-[#25251f]/10 bg-white p-4 shadow-sm"
                key={task.title}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#707064]">
                      Task
                    </p>
                    <h3 className="mt-1 text-xl font-black">{task.title}</h3>
                  </div>
                  <span className="rounded-md bg-[#e4eadf] px-3 py-1 text-xs font-black text-[#3e6547]">
                    {task.status}
                  </span>
                </div>

                {task.subtasks.length > 0 ? (
                  <ul className="mt-4 grid gap-2">
                    {task.subtasks.map((subtask) => (
                      <li
                        className="flex items-center gap-3 rounded-md bg-[#f6f5ef] px-3 py-2"
                        key={subtask.title}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border text-xs font-black ${
                            subtask.done
                              ? "border-[#4b7c59] bg-[#4b7c59] text-white"
                              : "border-[#b8b19d] bg-white text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                        <span
                          className={
                            subtask.done
                              ? "text-sm font-semibold text-[#777266] line-through"
                              : "text-sm font-semibold text-[#37342d]"
                          }
                        >
                          {subtask.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 rounded-md bg-[#f6f5ef] px-3 py-2 text-sm font-semibold text-[#777266]">
                    No subtasks yet.
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 border-t border-[#25251f]/10 py-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#53634f]">
              Add Later
            </p>
            <h2 className="mt-2 text-2xl font-black">Build the next quest</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#615f56]">
              This lower section is a placeholder for adding quests, tasks, and
              subtasks once the real form behavior is ready.
            </p>
          </div>

          <div className="grid gap-3 rounded-lg border border-dashed border-[#9d967f] bg-[#fbfaf4] p-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-bold">
              Quest
              <input
                className="rounded-md border border-[#25251f]/15 bg-white px-3 py-2 font-semibold outline-none"
                placeholder="Tuesday"
                readOnly
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Task
              <input
                className="rounded-md border border-[#25251f]/15 bg-white px-3 py-2 font-semibold outline-none"
                placeholder="Lab prep"
                readOnly
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Subtask
              <input
                className="rounded-md border border-[#25251f]/15 bg-white px-3 py-2 font-semibold outline-none"
                placeholder="Pack laptop"
                readOnly
              />
            </label>
          </div>
        </section>
      </section>
    </main>
  );
}
