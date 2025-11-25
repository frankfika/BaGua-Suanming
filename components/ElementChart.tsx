import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ElementData {
  name: string;
  value: number;
  color: string;
}

interface ElementChartProps {
  elements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
}

const ElementChart: React.FC<ElementChartProps> = ({ elements }) => {
  const data: ElementData[] = [
    { name: 'Wood (木)', value: elements.wood, color: '#4ade80' }, // Green
    { name: 'Fire (火)', value: elements.fire, color: '#f87171' }, // Red
    { name: 'Earth (土)', value: elements.earth, color: '#fbbf24' }, // Yellow/Earth
    { name: 'Metal (金)', value: elements.metal, color: '#94a3b8' }, // Gray/Silver
    { name: 'Water (水)', value: elements.water, color: '#60a5fa' }, // Blue
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-full flex flex-col">
      <h4 className="text-center font-serif text-lg text-stone-800 mb-4">Five Elements Balance (五行分布)</h4>
      <div className="flex-1 w-full h-[250px] min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
                formatter={(value: number) => `${value}%`}
                contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e5e5', borderRadius: '8px', fontFamily: 'serif' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle"/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center text-xs text-stone-400 mt-2 italic">
        Values represent approximate strength percentage.
      </div>
    </div>
  );
};

export default ElementChart;