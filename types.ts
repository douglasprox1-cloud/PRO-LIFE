export type Priority = 'Urgente' | 'Quando Possível' | 'Rotina' | 'Pode Esperar';
export type Category = 'Rotina 1h' | 'Rotina 3h' | 'Saúde' | 'Pendências' | 'Expansão/Projetos' | 'Hábitos';
export type Period = 'Manhã' | 'Tarde' | 'Noite';
export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type DayKey = 'inbox' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
export type Repetition = 'Não repetir' | 'Diariamente' | 'Semanalmente' | 'Mensalmente';

export type ExpenseCategory = 'Moradia' | 'Transporte' | 'Dívidas' | 'Lazer' | 'Presentes' | 'Alimentação' | 'Reserva' | 'Imprevisto' | 'Estudo' | 'Autocuidado' | 'Farmácia' | 'Cartão de Crédito';
export type IncomeCategory = 'Hospital' | '24 de Março' | 'Eventos' | 'Grau' | 'Outros' | 'Palestras' | 'Vendas';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  points: number;
  subtasks: Subtask[];
  day: DayKey;
  period: Period | null;
  completed: boolean;
  imageUrl?: string;
  date?: string; // Format YYYY-MM-DD
  time?: string; // Format HH:MM
  repetition?: Repetition;
}

export interface Goal {
  id: string;
  title: string;
  type: 'weekly' | 'monthly';
  progress: number; // A percentage from 0 to 100
  points: number;
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string; // Transaction date
    type: 'income' | 'expense';
    category: IncomeCategory | ExpenseCategory;
    isCreditCard?: boolean;
    dueDate?: string; // For scheduled expenses
}

export interface Reward {
    id: string;
    name: string;
    cost: number;
}


export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  }
}