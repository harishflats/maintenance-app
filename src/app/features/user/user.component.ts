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
      });
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
}
