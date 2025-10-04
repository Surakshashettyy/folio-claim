export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface Expense {
  id: string;
  employee: string;
  description: string;
  date: string;
  category: string;
  paidBy: string;
  remarks: string;
  amount: number;
  currency: string;
  status: ExpenseStatus;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  draft: number;
  submitted: number;
  approved: number;
}
