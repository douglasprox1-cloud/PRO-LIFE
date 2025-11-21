

import React, { useRef } from 'react';
import { Task, Goal, Reward, Transaction, Citation, PdaEntry, DailyNote, PendingItem, WeightEntry, WaterLog, SleepLog, Supplement, SupplementLog, DietLog, DietPlanItem, PurchasePlanItem, ForecastedExpense, ShoppingListItem, ProhibitedFoodItem, ProhibitedFoodLog } from '../types';
import { UploadIcon, DownloadIcon } from './Icons';

interface AppData {
    tasks: Task[];
    goals: Goal[];
    rewards: Reward[];
    transactions: Transaction[];
    citations: Citation[];
    pdaEntries: PdaEntry[];
    dailyNotes: DailyNote[];
    pendingItems: PendingItem[];
    totalPoints: number;
    weightHistory: WeightEntry[];
    waterLogs: WaterLog[];
    sleepLogs: SleepLog[];
    supplements: Supplement[];
    supplementLogs: SupplementLog[];
    dietLogs: DietLog[];
    dietPlan: DietPlanItem[];
    prohibitedFoodPlan: ProhibitedFoodItem[];
    prohibitedFoodLogs: ProhibitedFoodLog[];
    waterGoalMode: 'fixed' | 'dynamic';
    purchasePlans: PurchasePlanItem[];
    forecastedExpenses: ForecastedExpense[];
    shoppingList: ShoppingListItem[];
}

interface BackupViewProps {
    appData: AppData;
    onRestoreData: (data: AppData) => void;
}

const BackupView: React.FC<BackupViewProps> = ({ appData, onRestoreData }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        try {
            const dataStr = JSON.stringify(appData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.download = `lifeboard-pro-backup-${date}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting data:", error);
            alert("Não foi possível exportar os dados.");
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!window.confirm("Isso substituirá todos os seus dados atuais neste dispositivo. Tem certeza que deseja continuar?")) {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Falha ao ler o arquivo.");
                }
                const parsedData = JSON.parse(text);
                
                // Basic validation to ensure the file is a valid backup
                if (
                    'tasks' in parsedData &&
                    'goals' in parsedData &&
                    'rewards' in parsedData &&
                    'transactions' in parsedData &&
                    'citations' in parsedData &&
                    'pdaEntries' in parsedData &&
                    'dailyNotes' in parsedData &&
                    'pendingItems' in parsedData &&
                    'totalPoints' in parsedData
                ) {
                    const dataToRestore: AppData = {
                        tasks: parsedData.tasks || [],
                        goals: parsedData.goals || [],
                        rewards: parsedData.rewards || [],
                        transactions: parsedData.transactions || [],
                        citations: parsedData.citations || [],
                        pdaEntries: parsedData.pdaEntries || [],
                        dailyNotes: parsedData.dailyNotes || [],
                        pendingItems: parsedData.pendingItems || [],
                        totalPoints: parsedData.totalPoints || 0,
                        weightHistory: parsedData.weightHistory || [],
                        waterLogs: parsedData.waterLogs || [],
                        sleepLogs: parsedData.sleepLogs || [],
                        supplements: parsedData.supplements || [],
                        supplementLogs: parsedData.supplementLogs || [],
                        dietLogs: parsedData.dietLogs || [],
                        dietPlan: parsedData.dietPlan || [],
                        prohibitedFoodPlan: parsedData.prohibitedFoodPlan || [],
                        prohibitedFoodLogs: parsedData.prohibitedFoodLogs || [],
                        waterGoalMode: parsedData.waterGoalMode || 'fixed',
                        purchasePlans: parsedData.purchasePlans || [],
                        forecastedExpenses: parsedData.forecastedExpenses || [],
                        shoppingList: parsedData.shoppingList || [],
                    };

                    onRestoreData(dataToRestore);
                    alert("Dados restaurados com sucesso!");
                } else {
                    throw new Error("O arquivo de backup é inválido ou está corrompido.");
                }

            } catch (error) {
                console.error("Erro ao importar dados:", error);
                alert(error instanceof Error ? error.message : "Ocorreu um erro desconhecido ao importar o arquivo.");
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-4 text-center text-white min-h-[400px] flex flex-col items-center justify-center">
            <div className="bg-slate-800 p-8 rounded-lg shadow-lg max-w-2xl w-full">
                <h2 className="text-2xl font-bold mb-2">Backup e Restauração</h2>
                <p className="text-slate-400 mb-6">Salve todos os seus dados em um arquivo para transferi-los entre dispositivos ou mantê-los seguros.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Export Card */}
                    <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600 flex flex-col items-center">
                        <DownloadIcon className="w-12 h-12 text-indigo-400 mb-3" />
                        <h3 className="font-semibold text-lg mb-2">Exportar Dados</h3>
                        <p className="text-sm text-slate-400 mb-4 text-center">Salvar todas as tarefas, metas e finanças em um arquivo JSON.</p>
                        <button 
                            onClick={handleExport}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                        >
                            <DownloadIcon className="w-5 h-5"/>
                            Baixar Backup
                        </button>
                    </div>

                    {/* Import Card */}
                    <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600 flex flex-col items-center">
                        <UploadIcon className="w-12 h-12 text-green-400 mb-3" />
                        <h3 className="font-semibold text-lg mb-2">Importar Dados</h3>
                        <p className="text-sm text-slate-400 mb-4 text-center">Carregar um arquivo de backup para restaurar seus dados. <strong className="text-yellow-400">Isso substituirá os dados atuais.</strong></p>
                        <input type="file" ref={fileInputRef} id="import-backup" className="hidden" accept=".json" onChange={handleImport} />
                        <label 
                            htmlFor="import-backup"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                            <UploadIcon className="w-5 h-5"/>
                            Carregar Backup
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupView;