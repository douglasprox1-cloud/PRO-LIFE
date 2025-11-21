import React, { useState, useMemo, useEffect } from 'react';
import { WeightEntry, WaterLog, SleepLog, DietLog, Supplement, SupplementLog, DietPlanItem, ProhibitedFoodItem, ProhibitedFoodLog } from '../types';
import { ScaleIcon, WaterDropIcon, MoonIcon, ClipboardListIcon, PillIcon, TrashIcon, CogIcon, ExclamationTriangleIcon } from './Icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface HealthViewProps {
    weightHistory: WeightEntry[];
    waterLogs: WaterLog[];
    sleepLogs: SleepLog[];
    dietLogs: DietLog[];
    supplements: Supplement[];
    supplementLogs: SupplementLog[];
    dietPlan: DietPlanItem[];
    prohibitedFoodPlan: ProhibitedFoodItem[];
    prohibitedFoodLogs: ProhibitedFoodLog[];
    waterGoalMode: 'fixed' | 'dynamic';
    onAddWeightEntry: (weight: number) => void;
    onLogWater: (glasses: number, goalInGlasses: number) => void;
    onLogSleep: (hours: number) => void;
    onLogDiet: (log: Omit<DietLog, 'consumedItemIds'>) => void;
    onAddSupplement: (name: string) => void;
    onDeleteSupplement: (id: string) => void;
    onToggleSupplementLog: (supplementId: string, taken: boolean) => void;
    onAddDietPlanItem: (name: string) => void;
    onDeleteDietPlanItem: (itemId: string) => void;
    onToggleDietLogItem: (itemId: string, consumed: boolean) => void;
    onAddProhibitedFoodItem: (name: string) => void;
    onDeleteProhibitedFoodItem: (id: string) => void;
    onToggleProhibitedFoodLog: (foodId: string, consumed: boolean) => void;
    onSetWaterGoalMode: (mode: 'fixed' | 'dynamic') => void;
}

const HealthCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode; }> = ({ title, icon, children, actions }) => (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
                <div className="p-2 bg-slate-700 rounded-lg mr-3">{icon}</div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            {actions}
        </div>
        <div className="flex-grow">{children}</div>
    </div>
);

const HealthView: React.FC<HealthViewProps> = (props) => {
    const { 
        weightHistory, waterLogs, sleepLogs, dietLogs, supplements, supplementLogs, dietPlan, prohibitedFoodPlan, prohibitedFoodLogs, waterGoalMode,
        onAddWeightEntry, onLogWater, onLogSleep, onLogDiet, onAddSupplement, onDeleteSupplement, 
        onToggleSupplementLog, onAddDietPlanItem, onDeleteDietPlanItem, onToggleDietLogItem, onAddProhibitedFoodItem,
        onDeleteProhibitedFoodItem, onToggleProhibitedFoodLog, onSetWaterGoalMode
    } = props;
    
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    
    // State for inputs
    const [newWeight, setNewWeight] = useState('');
    const [lastNightSleep, setLastNightSleep] = useState('');
    const [dietNotes, setDietNotes] = useState('');
    const [newSupplementName, setNewSupplementName] = useState('');
    const [newDietItemName, setNewDietItemName] = useState('');
    const [newProhibitedItemName, setNewProhibitedItemName] = useState('');

    // Derived values for display
    const currentWeight = useMemo(() => weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : null, [weightHistory]);
    const todayWaterLog = useMemo(() => waterLogs.find(l => l.date === todayStr) || { date: todayStr, glasses: 0 }, [waterLogs, todayStr]);
    const lastSleepLog = useMemo(() => sleepLogs.length > 0 ? sleepLogs.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null, [sleepLogs]);
    const todayDietLog = useMemo(() => dietLogs.find(l => l.date === todayStr), [dietLogs, todayStr]);

    const dynamicGoalMl = (currentWeight || 70) * 35; // Default to 70kg if no weight
    const dynamicGoalGlasses = Math.ceil(dynamicGoalMl / 200);
    const waterGoal = waterGoalMode === 'dynamic' ? dynamicGoalGlasses : 8;

    useEffect(() => {
        setDietNotes(todayDietLog?.notes || '');
    }, [todayDietLog]);

    const weightChartData = useMemo(() => {
        return weightHistory.slice(-30).map(entry => ({
            date: new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            peso: entry.weight
        }));
    }, [weightHistory]);

    const sleepChartData = useMemo(() => {
        return sleepLogs.slice(-7).map(entry => ({
             date: new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }),
             horas: entry.hours
        }));
    }, [sleepLogs]);

    const handleAddWeight = (e: React.FormEvent) => {
        e.preventDefault();
        const weight = parseFloat(newWeight);
        if (weight > 0) {
            onAddWeightEntry(weight);
            setNewWeight('');
        }
    };
    
    const handleWaterChange = (change: number) => {
        const newGlasses = Math.max(0, todayWaterLog.glasses + change);
        onLogWater(newGlasses, waterGoal);
    };

    const handleAddSleep = (e: React.FormEvent) => {
        e.preventDefault();
        const hours = parseFloat(lastNightSleep);
        if (hours > 0 && hours <= 24) {
            onLogSleep(hours);
            setLastNightSleep('');
        }
    };

    const handleDietAdherence = (adherence: 'good' | 'medium' | 'bad') => {
        onLogDiet({
            date: todayStr,
            notes: dietNotes,
            adherence: adherence
        });
    };
    
    const handleAddSupplementForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSupplementName.trim()) {
            onAddSupplement(newSupplementName.trim());
            setNewSupplementName('');
        }
    };

    const handleAddDietItemForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDietItemName.trim()) {
            onAddDietPlanItem(newDietItemName.trim());
            setNewDietItemName('');
        }
    };

    const handleAddProhibitedItemForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (newProhibitedItemName.trim()) {
            onAddProhibitedFoodItem(newProhibitedItemName.trim());
            setNewProhibitedItemName('');
        }
    };

    const isSupplementTakenToday = (supplementId: string) => {
        return supplementLogs.some(log => log.date === todayStr && log.supplementId === supplementId);
    };

    const isProhibitedFoodConsumedToday = (foodId: string) => {
        return prohibitedFoodLogs.some(log => log.date === todayStr && log.foodId === foodId);
    };

    return (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <HealthCard title="Controle de Peso" icon={<ScaleIcon className="w-6 h-6 text-green-400" />}>
                <div className="text-center mb-4">
                    <p className="text-slate-400 text-sm">Peso Atual</p>
                    <p className="text-4xl font-bold">{currentWeight ? `${currentWeight} kg` : 'N/A'}</p>
                </div>
                <div className="h-40 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                            <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#94a3b8" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                            <Line type="monotone" dataKey="peso" stroke="#4ade80" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <form onSubmit={handleAddWeight} className="flex gap-2">
                    <input type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="Ex: 80.5" className="w-full bg-slate-700 p-2 rounded-md" />
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md">Salvar</button>
                </form>
            </HealthCard>
            
            <HealthCard 
                title="Hidratação" 
                icon={<WaterDropIcon className="w-6 h-6 text-sky-400" isFilled />}
                actions={
                    <div className="relative group">
                        <button className="p-2 text-slate-400 hover:text-white"><CogIcon className="w-5 h-5"/></button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-md shadow-lg p-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity z-10">
                            <button onClick={() => onSetWaterGoalMode('fixed')} className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${waterGoalMode === 'fixed' ? 'bg-indigo-600' : 'hover:bg-slate-700'}`}>Meta Fixa (8 copos)</button>
                            <button onClick={() => onSetWaterGoalMode('dynamic')} className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${waterGoalMode === 'dynamic' ? 'bg-indigo-600' : 'hover:bg-slate-700'}`}>Meta por Peso</button>
                        </div>
                    </div>
                }
            >
                <p className="text-slate-400 text-center mb-4">Meta diária: {waterGoal} copos ({waterGoal * 200}ml)</p>
                <div className="flex justify-center items-center gap-1 flex-wrap mb-6">
                    {Array.from({ length: waterGoal }).map((_, i) => (
                        <WaterDropIcon key={i} className="w-6 h-6 text-sky-400" isFilled={i < todayWaterLog.glasses} />
                    ))}
                </div>
                <p className="text-5xl font-bold text-center mb-6">{todayWaterLog.glasses}</p>
                 <div className="flex justify-center gap-4">
                    <button onClick={() => handleWaterChange(-1)} className="bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-full w-16 h-16 flex items-center justify-center text-3xl">-</button>
                    <button onClick={() => handleWaterChange(1)} className="bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-full w-16 h-16 flex items-center justify-center text-3xl">+</button>
                </div>
            </HealthCard>

            <HealthCard title="Registro de Sono" icon={<MoonIcon className="w-6 h-6 text-purple-400" />}>
                 <div className="text-center mb-4">
                    <p className="text-slate-400 text-sm">Último registro ({lastSleepLog ? new Date(lastSleepLog.date + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'})</p>
                    <p className="text-4xl font-bold">{lastSleepLog ? `${lastSleepLog.hours} horas` : 'N/A'}</p>
                </div>
                 <div className="h-40 mb-4">
                     <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={sleepChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                             <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                             <YAxis stroke="#94a3b8" fontSize={12} />
                             <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                             <Bar dataKey="horas" fill="#a78bfa" />
                         </BarChart>
                     </ResponsiveContainer>
                 </div>
                <form onSubmit={handleAddSleep} className="flex gap-2">
                    <input type="number" step="0.5" value={lastNightSleep} onChange={e => setLastNightSleep(e.target.value)} placeholder="Horas dormidas" className="w-full bg-slate-700 p-2 rounded-md" />
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md">Salvar</button>
                </form>
            </HealthCard>

             <HealthCard title="Diário Alimentar" icon={<ClipboardListIcon className="w-6 h-6 text-orange-400" />}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <div className="flex flex-col">
                         <h4 className="font-semibold mb-2 text-green-400">Plano Alimentar (+1 pt cada)</h4>
                         <div className="space-y-2 max-h-40 overflow-y-auto pr-2 mb-2">
                             {dietPlan.map(item => (
                                <div key={item.id} className="flex items-center bg-slate-900/50 p-2.5 rounded-md">
                                    <input 
                                        type="checkbox"
                                        id={`diet-${item.id}`}
                                        checked={todayDietLog?.consumedItemIds?.includes(item.id) || false}
                                        onChange={(e) => onToggleDietLogItem(item.id, e.target.checked)}
                                        className="form-checkbox h-4 w-4 bg-slate-700 border-slate-600 rounded text-green-500 focus:ring-green-600"
                                    />
                                    <label htmlFor={`diet-${item.id}`} className="ml-3 text-sm">{item.name}</label>
                                </div>
                             ))}
                             {dietPlan.length === 0 && <p className="text-slate-500 text-xs text-center py-4">Adicione itens ao seu plano de dieta.</p>}
                         </div>
                         <form onSubmit={handleAddDietItemForm} className="flex gap-2 mb-4">
                            <input value={newDietItemName} onChange={e => setNewDietItemName(e.target.value)} placeholder="Novo item da dieta" className="w-full text-sm bg-slate-700 p-2 rounded-md" />
                            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md">+</button>
                         </form>
                         <div className="mt-auto pt-4 border-t border-slate-700">
                             <h4 className="font-semibold mb-2 text-red-400 flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4" /> Alimentos Proibidos (-10 pts cada)
                             </h4>
                             <div className="space-y-2 max-h-40 overflow-y-auto pr-2 mb-2">
                                {prohibitedFoodPlan.map(item => (
                                    <div key={item.id} className="flex items-center justify-between bg-red-900/30 p-2.5 rounded-md">
                                        <div className="flex items-center">
                                            <input 
                                                type="checkbox"
                                                id={`prohibit-${item.id}`}
                                                checked={isProhibitedFoodConsumedToday(item.id)}
                                                onChange={(e) => onToggleProhibitedFoodLog(item.id, e.target.checked)}
                                                className="form-checkbox h-4 w-4 bg-slate-700 border-slate-600 rounded text-red-500 focus:ring-red-600"
                                            />
                                            <label htmlFor={`prohibit-${item.id}`} className="ml-3 text-sm">{item.name}</label>
                                        </div>
                                        <button onClick={() => onDeleteProhibitedFoodItem(item.id)}><TrashIcon className="w-4 h-4 text-slate-500 hover:text-red-400"/></button>
                                    </div>
                                ))}
                                {prohibitedFoodPlan.length === 0 && <p className="text-slate-500 text-xs text-center py-4">Nenhum item proibido adicionado.</p>}
                             </div>
                             <form onSubmit={handleAddProhibitedItemForm} className="flex gap-2">
                                <input value={newProhibitedItemName} onChange={e => setNewProhibitedItemName(e.target.value)} placeholder="Novo item proibido" className="w-full text-sm bg-slate-700 p-2 rounded-md" />
                                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-md">+</button>
                             </form>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Anotações do dia</label>
                        <textarea value={dietNotes} onChange={e => setDietNotes(e.target.value)} rows={3} className="w-full bg-slate-700 p-2 rounded-md mb-3 resize-none" placeholder="O que você comeu hoje?"></textarea>
                        <p className="text-sm font-medium text-slate-300 mb-2 text-center">Como foi sua adesão à dieta hoje?</p>
                        <div className="grid grid-cols-3 gap-2 mt-auto">
                           <button onClick={() => handleDietAdherence('good')} className={`font-bold py-2 rounded-md transition-colors ${todayDietLog?.adherence === 'good' ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'}`}>Bom</button>
                           <button onClick={() => handleDietAdherence('medium')} className={`font-bold py-2 rounded-md transition-colors ${todayDietLog?.adherence === 'medium' ? 'bg-yellow-600' : 'bg-slate-700 hover:bg-slate-600'}`}>Médio</button>
                           <button onClick={() => handleDietAdherence('bad')} className={`font-bold py-2 rounded-md transition-colors ${todayDietLog?.adherence === 'bad' ? 'bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}>Ruim</button>
                        </div>
                    </div>
                 </div>
            </HealthCard>

            <div className="lg:col-span-2 xl:col-span-2">
                <HealthCard title="Controle de Suplementos" icon={<PillIcon className="w-6 h-6 text-pink-400" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">Seus Suplementos</h4>
                            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto pr-2">
                                {supplements.map(sup => (
                                    <div key={sup.id} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-md">
                                        <span>{sup.name}</span>
                                        <button onClick={() => onDeleteSupplement(sup.id)}><TrashIcon className="w-4 h-4 text-slate-500 hover:text-red-500" /></button>
                                    </div>
                                ))}
                                 {supplements.length === 0 && <p className="text-slate-500 text-sm">Nenhum suplemento adicionado.</p>}
                            </div>
                            <form onSubmit={handleAddSupplementForm} className="flex gap-2">
                                <input value={newSupplementName} onChange={e => setNewSupplementName(e.target.value)} placeholder="Novo suplemento" className="w-full bg-slate-700 p-2 rounded-md" />
                                <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-3 rounded-md">+</button>
                            </form>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Checklist de Hoje</h4>
                             <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {supplements.map(sup => (
                                    <div key={sup.id} className="flex items-center bg-slate-900/50 p-2.5 rounded-md">
                                        <input 
                                            type="checkbox" 
                                            id={`sup-${sup.id}`}
                                            checked={isSupplementTakenToday(sup.id)}
                                            onChange={(e) => onToggleSupplementLog(sup.id, e.target.checked)}
                                            className="form-checkbox h-5 w-5 bg-slate-700 border-slate-600 rounded text-pink-500 focus:ring-pink-600"
                                        />
                                        <label htmlFor={`sup-${sup.id}`} className="ml-3">{sup.name}</label>
                                    </div>
                                ))}
                                {supplements.length === 0 && <p className="text-slate-500 text-sm">Adicione um suplemento para começar.</p>}
                            </div>
                        </div>
                    </div>
                </HealthCard>
            </div>
        </div>
    );
};

export default HealthView;