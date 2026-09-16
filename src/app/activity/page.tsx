import { Navbar } from "@/components/Navbar";
import { ActivityFeed } from "@/components/ActivityFeed";

export const metadata = { title: "Live Activity" };

export default function ActivityPage() {
  return (
    <main className="min-h-dvh px-4 pb-16">
      <Navbar />
      <section className="pt-6">
        <ActivityFeed />
      </section>
    </main>
  );
}
