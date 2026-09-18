import { Navbar } from "@/components/Navbar";

export default function LeaderboardLoading() {
  return (
    <main className="min-h-dvh pb-16 animate-pulse">
      <Navbar />

      <section className="max-w-2xl mx-auto text-center pt-10 pb-10 px-4 sm:px-6">
        <div className="h-10 w-10 rounded-full bg-white/10 mx-auto mb-3" />
        <div className="h-9 sm:h-12 w-4/5 bg-white/10 rounded-lg mx-auto" />
        <div className="h-4 w-2/3 bg-white/5 rounded mx-auto mt-4" />
      </section>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-9 w-24 shrink-0 rounded-full bg-white/5" />
        ))}
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3 border border-white/10 bg-white/5">
              <div className="w-8 h-6 rounded bg-white/10 shrink-0" />
              <div className="w-11 h-11 rounded-full bg-white/10 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-4 w-32 bg-white/10 rounded" />
                <div className="h-3 w-24 bg-white/5 rounded mt-2" />
              </div>
              <div className="h-5 w-16 bg-white/10 rounded shrink-0" />
            </div>
          ))}
        </div>
        <div className="hidden lg:block h-64 rounded-xl bg-white/5" />
      </section>
    </main>
  );
}
