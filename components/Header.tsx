
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center mb-6 px-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Lifeboard Pro</h1>
        <p className="text-slate-400">Transforme metas em realidade.</p>
      </div>
      <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xl">
        D
      </div>
    </header>
  );
};

export default Header;
