import GameShell from "@/components/GameShell";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Sharpen your aim</h1>
        <p className="text-slate-300 max-w-2xl">
          Click to hit expanding targets. Simple, fast, no login. Results are shown at the end of each round.
        </p>
      </header>
      <GameShell />
    </div>
  );
}
