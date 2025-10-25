import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { StarIcon } from './Icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  progress?: number;
}

interface ScoreboardProps {
    dailyPoints: number;
    totalPoints: number;
    dailyTaskProgress: number; // 0-100
    goalsProgress: number; // 0-100
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, progress }) => {
  const data = progress !== undefined ? [
    { name: 'Completed', value: progress },
    { name: 'Remaining', value: 100 - progress },
  ] : [];

  return (
    <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="p-3 bg-slate-700 rounded-lg mr-4">
          {icon}
        </div>
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
      {progress !== undefined && (
        <div className="w-16 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={28}
                startAngle={90}
                endAngle={450}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell fill="#4f46e5" />
                <Cell fill="#374151" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};


const Scoreboard: React.FC<ScoreboardProps> = ({ dailyPoints, totalPoints, dailyTaskProgress, goalsProgress }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 px-4">
      <StatCard title="Pontuação do Dia" value={dailyPoints} icon={<StarIcon className="w-6 h-6 text-yellow-400"/>} />
      <StatCard title="Pontuação Total" value={totalPoints} icon={<StarIcon className="w-6 h-6 text-amber-500"/>} />
      <StatCard title="Tarefas do Dia" value={`${dailyTaskProgress.toFixed(0)}%`} icon={<div className="font-bold text-indigo-400 text-xl">✓</div>} progress={dailyTaskProgress} />
      <StatCard title="Metas Concluídas" value={`${goalsProgress.toFixed(0)}%`} icon={<div className="font-bold text-indigo-400 text-xl">🎯</div>} progress={goalsProgress} />
    </div>
  );
};

export default Scoreboard;