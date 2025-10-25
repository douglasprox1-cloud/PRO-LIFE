import React, { useState } from 'react';
import { Reward } from '../types';
import { StarIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardsViewProps {
    rewards: Reward[];
    totalPoints: number;
    onAddReward: (rewardData: Omit<Reward, 'id'>) => void;
    onRedeemReward: (rewardId: string) => void;
}

const RewardCard: React.FC<{ reward: Reward; totalPoints: number; onRedeem: (id: string) => void }> = ({ reward, totalPoints, onRedeem }) => {
    const canAfford = totalPoints >= reward.cost;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-800 p-4 rounded-lg flex justify-between items-center"
        >
            <div>
                <h4 className="font-bold text-white">{reward.name}</h4>
                <p className="text-yellow-400 font-bold text-sm flex items-center gap-1">
                    <StarIcon className="w-4 h-4" />
                    {reward.cost} Pontos
                </p>
            </div>
            <button
                onClick={() => onRedeem(reward.id)}
                disabled={!canAfford}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Resgatar
            </button>
        </motion.div>
    )
};


const RewardsView: React.FC<RewardsViewProps> = ({ rewards, totalPoints, onAddReward, onRedeemReward }) => {
    const [rewardName, setRewardName] = useState('');
    const [rewardCost, setRewardCost] = useState('');

    const handleAddReward = (e: React.FormEvent) => {
        e.preventDefault();
        const cost = parseInt(rewardCost, 10);
        if (!rewardName.trim() || isNaN(cost) || cost <= 0) {
            alert("Por favor, preencha o nome e um custo válido para a recompensa.");
            return;
        }

        onAddReward({ name: rewardName, cost });
        setRewardName('');
        setRewardCost('');
    };

    return (
        <div className="p-4 text-white space-y-8">
            {/* Form to add new reward */}
            <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Cadastrar Nova Recompensa</h3>
                <form onSubmit={handleAddReward} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nome da Recompensa</label>
                        <input
                            type="text"
                            placeholder="Ex: Jantar fora"
                            className="w-full bg-slate-700 p-2 rounded-md"
                            value={rewardName}
                            onChange={(e) => setRewardName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Custo (Pontos)</label>
                        <input
                            type="number"
                            placeholder="Ex: 300"
                            className="w-full bg-slate-700 p-2 rounded-md"
                            value={rewardCost}
                            onChange={(e) => setRewardCost(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="md:col-start-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md h-10">
                        Adicionar Recompensa
                    </button>
                </form>
            </div>

            {/* Rewards display */}
            <div>
                 <h2 className="text-2xl font-bold mb-4">Recompensas Disponíveis</h2>
                 <p className="text-slate-400 mb-4">Você tem <span className="font-bold text-yellow-400">{totalPoints}</span> pontos para gastar.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <AnimatePresence>
                        {rewards.map(reward => <RewardCard key={reward.id} reward={reward} totalPoints={totalPoints} onRedeem={onRedeemReward} />)}
                     </AnimatePresence>
                     {rewards.length === 0 && <p className="text-slate-500 md:col-span-3 text-center">Nenhuma recompensa cadastrada ainda.</p>}
                 </div>
            </div>
        </div>
    );
};

export default RewardsView;