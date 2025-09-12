import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  ticker: string;
  value: number;
  color: string;
}

interface PortfolioChartProps {
  data: ChartData[];
}

const COLORS = [
  'hsl(210, 100%, 50%)',   // Primary
  'hsl(142, 76%, 36%)',    // Secondary  
  'hsl(262, 83%, 58%)',    // Accent
  'hsl(43, 96%, 56%)',     // Chart-4
  'hsl(27, 87%, 67%)',     // Chart-5
  'hsl(180, 100%, 50%)',   // Cyan
  'hsl(300, 100%, 50%)',   // Magenta
  'hsl(60, 100%, 50%)',    // Yellow
  'hsl(120, 100%, 50%)',   // Green
  'hsl(0, 100%, 50%)',     // Red
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">{data.ticker}</p>
        <p className="text-sm">
          <span className="font-semibold">{data.value}%</span> of portfolio
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <ul className="flex flex-wrap justify-center gap-2 mt-4">
      {payload.map((entry: any, index: number) => (
        <li key={index} className="flex items-center text-sm">
          <span
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.payload.ticker}</span>
        </li>
      ))}
    </ul>
  );
};

export default function PortfolioChart({ data }: PortfolioChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No portfolio data available
      </div>
    );
  }

  // Map data with consistent colors
  const chartData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="w-full h-64" data-testid="portfolio-chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
