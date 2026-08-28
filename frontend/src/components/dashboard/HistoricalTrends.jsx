
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-md border border-white/20 p-3 rounded-xl text-white">
        <p className="font-bold mb-1">{label}</p>
        <p className="text-emerald-400 text-sm">
          Temp: {payload[0].value}°C
        </p>
      </div>
    );
  }
  return null;
};

export default function HistoricalTrends({ data, pointHistory }) {
  const chartData = data.map((item) => ({
    ...item,
    temp: item.mean_LST,
    pointTemp: pointHistory.find((point) => point.year === item.year)?.LST,
  }));
  return (
    <div className="w-full h-full min-h-[350px] p-2 flex flex-col">
      <h3 className="text-xl font-bold text-white mb-6">Historical & Projected LST</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
            <XAxis dataKey="year" stroke="#ffffff80" tick={{ fill: '#ffffff80', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#ffffff80" tick={{ fill: '#ffffff80', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="temp" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
            <Area type="monotone" dataKey="pointTemp" name="Selected point" stroke="#22d3ee" strokeWidth={2} fillOpacity={0} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
