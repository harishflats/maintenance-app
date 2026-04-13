import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ExpenseItem {
  id: string;
  type: string;
  amount: number;
}

export interface MaintenanceData {
  year: number;
  month: number;
  amountPerPerson: number;
  paidMembers: number;
  expenses: ExpenseItem[];
}

export interface Summary {
  collected: number;
  spent: number;
  balance: number;
  overallBalance: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private defaultData: MaintenanceData = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    amountPerPerson: 0,
    paidMembers: 0,
    expenses: [
      { id: '1', type: 'Maid', amount: 0 },
      { id: '2', type: 'EB Bill', amount: 0 },
      { id: '3', type: 'Others', amount: 0 }
    ]
  };

  private maintenanceDataSubject = new BehaviorSubject<MaintenanceData>(this.getInitialData());
  public maintenanceData$ = this.maintenanceDataSubject.asObservable();
  //private apiUrl = 'http://localhost:3001/api/maintenance';
  private apiUrl ='https://maintenance-backend-zyo9.onrender.com/api/maintenance';

  

  constructor(private http: HttpClient) {}

  private normalizeData(data: any): MaintenanceData {
    if (!data) return { ...this.defaultData };

    if (!data.expenses) {
      data.expenses = [];
    } else if (!Array.isArray(data.expenses)) {
      // Migrate legacy object format to the new array format
      const expensesArray: ExpenseItem[] = [];
      let idCounter = 1;
      for (const [key, value] of Object.entries(data.expenses)) {
        expensesArray.push({
          id: Date.now().toString() + '-' + idCounter++,
          type: key === 'ebBill' ? 'EB Bill' : key.charAt(0).toUpperCase() + key.slice(1),
          amount: Number(value) || 0
        });
      }
      data.expenses = expensesArray;
    }
    return data as MaintenanceData;
  }

  private getInitialData(): MaintenanceData {
    const key = `maintenance_${this.defaultData.year}_${this.defaultData.month}`;
    const stored = localStorage.getItem(key);
    return stored ? this.normalizeData(JSON.parse(stored)) : { ...this.defaultData };
  }

  private getStorageKey(): string {
    const data = this.maintenanceDataSubject.value;
    return `maintenance_${data.year}_${data.month}`;
  }

  getCurrentData(): MaintenanceData {
    return this.maintenanceDataSubject.value;
  }

  setCurrentData(data: MaintenanceData): void {
    this.maintenanceDataSubject.next(data);
    this.saveToStorage(data);
  }

  updateAmountPerPerson(amount: number): void {
    const current = this.maintenanceDataSubject.value;
    current.amountPerPerson = amount;
    this.maintenanceDataSubject.next({ ...current });
  }

  updatePaidMembers(count: number): void {
    const current = this.maintenanceDataSubject.value;
    current.paidMembers = Math.max(0, count);
    this.maintenanceDataSubject.next({ ...current });
  }

  incrementPaidMembers(): void {
    const current = this.maintenanceDataSubject.value;
    current.paidMembers += 1;
    this.maintenanceDataSubject.next({ ...current });
  }

  decrementPaidMembers(): void {
    const current = this.maintenanceDataSubject.value;
    if (current.paidMembers > 0) {
      current.paidMembers -= 1;
      this.maintenanceDataSubject.next({ ...current });
    }
  }

  updateExpense(id: string, type: string, amount: number): void {
    const current = this.maintenanceDataSubject.value;
    const expenseIndex = current.expenses.findIndex(exp => exp.id === id);
    if (expenseIndex !== -1) {
      current.expenses[expenseIndex] = { id, type, amount };
      this.maintenanceDataSubject.next({ ...current });
    }
  }

  addExpense(): void {
    const current = this.maintenanceDataSubject.value;
    const newId = Date.now().toString();
    current.expenses.push({ id: newId, type: '', amount: 0 });
    this.maintenanceDataSubject.next({ ...current });
  }

  removeExpense(id: string): void {
    const current = this.maintenanceDataSubject.value;
    current.expenses = current.expenses.filter(exp => exp.id !== id);
    this.maintenanceDataSubject.next({ ...current });
  }

  setMonth(year: number, month: number): void {
    const key = `maintenance_${year}_${month}`;
    const stored = localStorage.getItem(key);
    const newData = stored ? this.normalizeData(JSON.parse(stored)) : { ...this.defaultData, year, month };
    this.maintenanceDataSubject.next(newData);
  }

  getSummary(): Summary {
    const data = this.maintenanceDataSubject.value;
    const collected = data.amountPerPerson * data.paidMembers;
    const spent = data.expenses.reduce((total, expense) => total + expense.amount, 0);
    const balance = collected - spent;
    const overallBalance = this.calculateOverallBalance();

    return { collected, spent, balance, overallBalance };
  }

  private calculateOverallBalance(): number {
    let totalBalance = 0;
    const currentData = this.maintenanceDataSubject.value;
    const currentKey = `maintenance_${currentData.year}_${currentData.month}`;

    // 1. Sum up all balances from past saved months (excluding current active month)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('maintenance_') && key !== currentKey) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const data = this.normalizeData(JSON.parse(stored));
            const collected = (data.amountPerPerson || 0) * (data.paidMembers || 0);
            const spent = (data.expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
            totalBalance += (collected - spent);
          }
        } catch (e) {
          console.error('Error parsing stored data for overall balance', e);
        }
      }
    }

    // 2. Add the active in-memory month (so unsaved changes instantly reflect)
    const currentCollected = (currentData.amountPerPerson || 0) * (currentData.paidMembers || 0);
    const currentSpent = (currentData.expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
    totalBalance += (currentCollected - currentSpent);

    return totalBalance;
  }

  saveData(): Observable<any> {
    const data = this.maintenanceDataSubject.value;
    this.saveToStorage(data);
    return this.http.post(this.apiUrl, data);
  }

  private saveToStorage(data: MaintenanceData): void {
    const key = `maintenance_${data.year}_${data.month}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  clearData(): void {
    const key = this.getStorageKey();
    localStorage.removeItem(key);
    this.maintenanceDataSubject.next({ ...this.defaultData });
  }
}
