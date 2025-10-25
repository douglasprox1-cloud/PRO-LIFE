
import React from 'react';

interface PlaceholderViewProps {
  title: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title }) => {
  return (
    <div className="p-4 text-center text-white min-h-[400px] flex flex-col items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-slate-400">Funcionalidade em breve!</p>
        <p className="text-sm text-slate-500 mt-4">Estamos trabalhando para trazer esta seção para você.</p>
      </div>
    </div>
  );
};

export default PlaceholderView;
