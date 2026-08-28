
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const shapData = [
  { feature: 'NDVI (Vegetation)', impact: 2.8 },
  { feature: 'NDBI (Built-up)', impact: 2.1 },
  { feature: 'Albedo', impact: 1.5 },
  { feature: 'NDWI (Water)', impact: 0.9 },
  { feature: 'Population', impact: 0.6 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-md border border-white/20 p-3 rounded-xl text-white">
        <p className="font-bold mb-1">{label}</p>
        <p className="text-cyan-400 text-sm">
          Impact: +{payload[0].value}°C
        </p>
      </div>
    );
  }
  return null;
};

export default function ShapChart() {
  return (
    <div className="w-full h-full min-h-[350px] p-2 flex flex-col">
      <h3 className="text-xl font-bold text-white mb-6">SHAP Feature Impact</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={shapData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" horizontal={false} />
            <XAxis type="number" stroke="#ffffff80" tick={{ fill: '#ffffff80', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis dataKey="feature" type="category" stroke="#ffffff80" tick={{ fill: '#ffffff80', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff1a' }} />
            <Bar dataKey="impact" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}