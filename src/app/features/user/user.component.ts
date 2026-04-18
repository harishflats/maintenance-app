import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService, MaintenanceData, Summary } from '../../core/services/data.service';
import { AuthService } from '../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {
  maintenanceData: MaintenanceData;
  summary: Summary;
  balance: number = 0;
  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
  years: number[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.maintenanceData = this.dataService.getCurrentData();
    this.summary = this.dataService.getSummary();
    this.generateYears();
  }

  ngOnInit(): void {
    // React to query parameters and fetch data accordingly
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const monthParam = params['month'];
      let fetchMonth = this.maintenanceData.month;

      if (monthParam) {
        const foundMonth = this.months.find(m => m.label.toLowerCase() === String(monthParam).toLowerCase());
        if (foundMonth) {
          fetchMonth = foundMonth.value;
          if (fetchMonth !== this.maintenanceData.month) {
            this.dataService.setMonth(this.maintenanceData.year, fetchMonth);
          }
        }
      }

      // Fetch real data from backend
      this.dataService.fetchData(this.maintenanceData.year, fetchMonth);
    });

    this.dataService.maintenanceData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: MaintenanceData) => {
        this.maintenanceData = data;
        this.summary = this.dataService.getSummary();
        this.calculateBalance();
      });

    this.calculateBalance();
  }

  calculateBalance(): void {
    let totalCollected = 0;
    let totalSpent = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('maintenance_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          const collected = (Number(data.amountPerPerson) || 0) * (Number(data.paidMembers) || 0);

          let spent = 0;
          if (data.expenses) {
            if (Array.isArray(data.expenses)) {
              spent = data.expenses.reduce((sum: number, exp: any) => sum + (Number(exp.amount) || 0), 0);
            } else {
              spent = Object.values(data.expenses).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
            }
          }
          totalCollected += collected;
          totalSpent += spent;
        } catch (e) {
          console.error('Error parsing maintenance data from localStorage', e);
        }
      }
    }
    this.balance = totalCollected - totalSpent;
  }
 
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private generateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      this.years.push(i);
    }
  }

  getMonthLabel(): string {
    const month = this.months.find(m => m.value === this.maintenanceData.month);
    return month ? month.label : '';
  }

  onDateChange(change: { year?: number; month?: number }): void {
    const newYear = change.year !== undefined ? change.year : this.maintenanceData.year;
    const newMonth = change.month !== undefined ? change.month : this.maintenanceData.month;
    if (newYear !== this.maintenanceData.year || newMonth !== this.maintenanceData.month) {
      this.dataService.setMonth(newYear, newMonth);
    }
  }

  isCurrentMonth(): boolean {
    const now = new Date();
    return this.maintenanceData.year === now.getFullYear() && this.maintenanceData.month === now.getMonth() + 1;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  navigateToSummary(): void {
    this.router.navigate(['/summary']);
  }
}
