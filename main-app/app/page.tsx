import Image from "next/image";

export default function Home() {
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
                  <Image
                    className="object-cover"
                    src="/badges/badge1.png"
                    alt="Warrior badge"
                    fill
                    sizes="32px"
                  />
                </div>
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-black/40">
                  <Image
                    className="object-cover"
                    src="/badges/badge2.png"
                    alt="Streak badge"
                    fill
                    sizes="32px"
                  />
                </div>
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-black/40">
                  <Image
                    className="object-cover"
                    src="/badges/badge3.png"
                    alt="Focus badge"
                    fill
                    sizes="32px"
                  />
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
        <p className="max-w-md text-neutral-300">
          This is a basic paragraph. Change this text to edit what appears on the page.
        </p>

        <section className="mt-8 border border-white/30 bg-neutral-900 p-6">
          <h2 className="text-2xl font-semibold">Example Box</h2>
          <p className="mt-2 text-neutral-400">
            This box is a section element. The border, background, and spacing come from className.
          </p>
        </section>

        <button className="mt-6 bg-white px-4 py-2 font-bold text-neutral-900">
          Example Button
        </button>

        <ul className="mt-8 list-disc space-y-2 pl-6 text-neutral-200">
          <li>First list item</li>
          <li>Second list item</li>
          <li>Third list item</li>
        </ul>
      </div>
    </main>
  );
}
