import React from 'react';

interface TabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const tabsList = ['Kanban', 'Agenda', 'Metas', 'Orçamento', 'Citações', 'Concluídos', 'Recompensas', 'Backup'];

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="px-4 mb-6">
        <div className="border-b border-slate-700">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
                {tabsList.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === tab 
                                ? 'border-indigo-500 text-indigo-400' 
                                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'}`
                        }
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    </div>
  );
};

export default Tabs;