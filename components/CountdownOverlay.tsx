export default function CountdownOverlay({ value }: { value: number | "GO" }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/35 backdrop-blur-[2px]">
      <div
        key={value}
        className="animate-[countdown_.55s_ease-out] text-7xl font-black tracking-tight text-white drop-shadow-2xl sm:text-9xl"
      >
        {value}
      </div>
    </div>
  );
}
