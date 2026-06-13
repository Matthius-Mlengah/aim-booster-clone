import GameShell from "@/components/GameShell";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Sharpen your aim</h1>
        <p className="max-w-2xl text-slate-300">
          Train speed and centre precision, build score multipliers, or see how long you can survive the impossible Chaos challenge.
        </p>
      </header>
      <GameShell />
    </div>
  );
}
