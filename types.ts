export type Priority = 'Urgente' | 'O mais breve possível' | 'Quando Possível' | 'Rotina' | 'Pode Esperar';
export type Category = 'Rotina 1h' | 'Rotina 3h' | 'Saúde' | 'Pendências' | 'Expansão/Projetos' | 'Hábitos' | 'Padrão Paralelo';
export type Period = 'Manhã' | 'Tarde' | 'Noite';
export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type DayKey = 'inbox' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
export type Repetition = 'Não repetir' | 'Mensalmente' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type PendingItemStatus = 'A iniciar' | 'Executando' | 'Concluído';

export interface PendingItem {
  id: string;
  title: string;
  description: string;
  status: PendingItemStatus;
  tags: string[];
  createdAt: string;
}

export type ExpenseCategory = 'Moradia' | 'Transporte' | 'Dívidas' | 'Lazer' | 'Presentes' | 'Alimentação' | 'Reserva' | 'Imprevisto' | 'Estudo' | 'Autocuidado' | 'Farmácia' | 'Cartão de Crédito' | 'Comunicação' | 'Cantina' | 'Investir em negócio';
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
  resolution?: 'winner' | 'defeated';
  imageUrl?: string;
  date?: string; // Format YYYY-MM-DD
  time?: string; // Format HH:MM
  repetition?: Repetition;
  completionDate?: string; // Format YYYY-MM-DD
}

export interface Goal {
  id: string;
  title: string;
  type: 'weekly' | 'monthly';
  progress: number; // A percentage from 0 to 100
  points: number;
}

export interface PurchasePlanItem {
  id: string;
  itemName: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string; // YYYY-MM-DD
}

export type TransportType = 'onibus' | 'metro' | 'uber' | 'moto-combustivel' | 'moto-manutencao' | 'taxi' | 'outros';


export interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string; // Transaction date
    type: 'income' | 'expense';
    category: IncomeCategory | ExpenseCategory;
    isCreditCard?: boolean;
    dueDate?: string; // For scheduled expenses
    repetition?: 'Não repetir' | 'Semanal' | 'Mensal' | 'Anual';
    repetitionEndDate?: string;
    isPaid?: boolean;
    paymentMethod?: 'ticketRestaurante' | 'ticketAlimentacao';
    // New fields for installments
    paymentType?: 'A Vista' | 'Parcelado';
    installments?: number;
    currentInstallment?: number;
    purchaseId?: string; // To group installments
    // New fields for transport details
    transportType?: TransportType;
    km?: number;
    maintenancePayment?: 'A Vista' | 'Parcelado';
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

export interface Citation {
    id: number;
    book: string;
    author: string;
    page: string;
    theme: string;
    quote: string;
    tags: string;
}

export interface PdaEntry {
  date: string; // YYYY-MM-DD
  perception: string;
  decision: string;
  action: string;
  event?: string;
  mood?: 'happy' | 'sad' | null;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string; // mime type
  dataUrl: string;
}

export interface DailyNote {
  day: DayKey;
  content: string;
  attachments: Attachment[];
}

// Health Tracking Types
export interface WeightEntry {
  date: string; // YYYY-MM-DD
  weight: number;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  glasses: number;
}

export interface SleepLog {
  date: string; // YYYY-MM-DD
  hours: number;
}

export interface DietPlanItem {
  id: string;
  name: string;
}

export interface DietLog {
  date: string; // YYYY-MM-DD
  notes: string;
  adherence: 'good' | 'medium' | 'bad';
  consumedItemIds?: string[];
}

export interface Supplement {
  id: string;
  name: string;
}

export interface SupplementLog {
  date: string; // YYYY-MM-DD
  supplementId: string;
}

export interface ProhibitedFoodItem {
  id: string;
  name: string;
}

export interface ProhibitedFoodLog {
  date: string; // YYYY-MM-DD
  foodId: string;
}


// Finance Forecast & Shopping List
export interface ForecastedExpense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  estimatedValue: number;
  foundValue?: number;
  foundLink?: string;
}