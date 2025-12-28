import { PieChart, Pie, Cell } from "recharts";

interface CalorieRingProps {
  value: number;
  max?: number;
}

export function CalorieRing({ value, max = 2000 }: CalorieRingProps) {
  const safeMax = Math.max(max, 1);
  const consumed = Math.min(value, safeMax);
  const remaining = Math.max(safeMax - consumed, 0);

  const data = [
    { name: "Consumed", value: consumed },
    { name: "Remaining", value: remaining },
  ];

  const COLORS = ["#22c55e", "#e5e7eb"];

  return (
    <div className="relative flex items-center justify-center">
      <PieChart width={190} height={190}>
        <Pie
          data={data}
          innerRadius={70}
          outerRadius={90}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
      </PieChart>

      {/* CENTER TEXT */}
      <div className="absolute text-center">
        <p className="text-3xl font-bold leading-none">{value}</p>
        <p className="text-sm text-muted-foreground">kcal</p>
        <p className="mt-1 text-xs text-muted-foreground">
          of <span className="font-semibold">{safeMax}</span>
        </p>
      </div>
    </div>
  );
}
