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
  comments: string;
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
  private maintenanceDataSubject = new BehaviorSubject<MaintenanceData>(this.getInitialData());
  public maintenanceData$ = this.maintenanceDataSubject.asObservable();
  //private apiUrl = 'http://localhost:3001/api/maintenance';
  private apiUrl ='https://maintenance-backend-zyo9.onrender.com/api/maintenance';

  private allHistoricalData: any[] = [];

  constructor(private http: HttpClient) {
    this.refreshHistoricalData();
  }

  private refreshHistoricalData(): void {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.allHistoricalData = response;
        } else if (response) {
          this.allHistoricalData = [response];
        } else {
          this.allHistoricalData = [];
        }
        this.maintenanceDataSubject.next({ ...this.maintenanceDataSubject.value });
      },
      error: (err) => console.error('Error fetching historical data', err)
    });
  }

  private getDefaultData(year: number, month: number): MaintenanceData {
    return {
      year,
      month,
      amountPerPerson: 0,
      paidMembers: 0,
      expenses: [
        { id: '1', type: 'Maid', amount: 0 },
        { id: '2', type: 'EB Bill', amount: 0 },
        { id: '3', type: 'Others', amount: 0 }
      ],
      comments: ''
    };
  }

  private normalizeData(data: any, fallbackYear?: number, fallbackMonth?: number): MaintenanceData {
    const year = Number(data?.year || fallbackYear || new Date().getFullYear());
    const month = Number(data?.month || fallbackMonth || new Date().getMonth() + 1);

    if (!data) return this.getDefaultData(year, month);

    if (!data.expenses || data.expenses.length === 0) {
      data.expenses = this.getDefaultData(year, month).expenses;
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
    
    data.year = year;
    data.month = month;
    data.comments = data.comments || '';
    return data as MaintenanceData;
  }

  private getInitialData(): MaintenanceData {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    return this.getDefaultData(year, month);
  }

  getCurrentData(): MaintenanceData {
    return this.maintenanceDataSubject.value;
  }

  setCurrentData(data: MaintenanceData): void {
    this.maintenanceDataSubject.next(data);
  }

  updateAmountPerPerson(amount: number): void {
    const current = this.maintenanceDataSubject.value;
    current.amountPerPerson = amount;
    this.maintenanceDataSubject.next({ ...current });
  }

  updateComments(comments: string): void {
    const current = this.maintenanceDataSubject.value;
    current.comments = comments;
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
    // Fetch latest data from the backend when month changes
    this.fetchData(year, month);
  }

  getSummary(): Summary {
    const data = this.maintenanceDataSubject.value;
    const collected = (data?.amountPerPerson || 0) * (data?.paidMembers || 0);
    const spent = (data?.expenses || []).reduce((total: number, expense: any) => total + (expense?.amount || 0), 0);
    const balance = collected - spent;
    const overallBalance = this.calculateOverallBalance();

    return { collected, spent, balance, overallBalance };
  }

  private calculateOverallBalance(): number {
    let totalBalance = 0;
    const currentData = this.maintenanceDataSubject.value;

    // Add all historical data EXCEPT the current active month
    this.allHistoricalData.forEach(item => {
      if (Number(item.year) === Number(currentData.year) && Number(item.month) === Number(currentData.month)) {
        return; // Skip current active month so we don't double count it
      }
      const collected = (Number(item.amountPerPerson) || 0) * (Number(item.paidMembers) || 0);
      const spent = (item.expenses || []).reduce((sum: number, exp: any) => sum + (Number(exp.amount) || 0), 0);
      totalBalance += (collected - spent);
    });

    // Calculate the active in-memory month
    const currentCollected = (Number(currentData?.amountPerPerson) || 0) * (Number(currentData?.paidMembers) || 0);
    const currentSpent = (currentData?.expenses || []).reduce((sum: number, exp: any) => sum + (Number(exp?.amount) || 0), 0);
    totalBalance += (currentCollected - currentSpent);

    return totalBalance;
  }

  saveData(): Observable<any> {
    const data = this.maintenanceDataSubject.value;
    return this.http.post(this.apiUrl, data);
  }

  fetchData(year: number, month: number): void {
    this.http.get<any>(this.apiUrl, { params: { year: year != null ? year.toString() : '', month: month != null ? month.toString() : '' } })
      .subscribe({
        next: (response) => {
          let normalized: MaintenanceData;
          let targetData = null;

          if (response && Array.isArray(response)) {
            targetData = response.find((item: any) => Number(item.year) === Number(year) && Number(item.month) === Number(month));
          } else if (response && !Array.isArray(response) && Number(response.year) === Number(year) && Number(response.month) === Number(month)) {
            targetData = response;
          }

          if (targetData) {
            normalized = this.normalizeData(targetData, year, month);
          } else {
            // DB empty; use pristine defaults
            normalized = this.getDefaultData(year, month);
          }
          this.maintenanceDataSubject.next(normalized);
        },
        error: (err) => console.error('Error fetching data from API', err)
      });

    // Fetch all historical data simultaneously to keep overall balance accurate
    this.refreshHistoricalData();
  }

  testDbConnection(year: number, month: number): Observable<any> {
    const testDbUrl = this.apiUrl.replace('maintenance', 'test-db');
    return this.http.get(testDbUrl, { params: { year: year != null ? year.toString() : '', month: month != null ? month.toString() : '' } });
  }

  clearData(): void {
    const current = this.maintenanceDataSubject.value;
    this.maintenanceDataSubject.next(this.getDefaultData(current.year, current.month));
  }
}
