import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService, MaintenanceData, Summary } from '../../core/services/data.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
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
  savedMessage = '';
  dbStatusMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router
  ) {
    this.maintenanceData = this.dataService.getCurrentData();
    this.summary = this.dataService.getSummary();
    this.generateYears();
  }

  ngOnInit(): void {
   

    // Fetch real data from backend on load
    this.dataService.fetchData(this.maintenanceData.year, this.maintenanceData.month);

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

  onMonthChange(): void {
    this.dataService.setMonth(this.maintenanceData.year, this.maintenanceData.month);
  }

  onAmountChange(value: number): void {
    this.dataService.updateAmountPerPerson(value);
  }

  onAmountPerPersonInput(event: any): void {
    const value = parseFloat(event.target.value) || 0;
    this.dataService.updateAmountPerPerson(value);
  }

  onPaidMembersInput(event: any): void {
    const value = parseInt(event.target.value) || 0;
    this.dataService.updatePaidMembers(value);
  }

  incrementMembers(): void {
    this.dataService.incrementPaidMembers();
  }

  decrementMembers(): void {
    this.dataService.decrementPaidMembers();
  }

  onExpenseTypeChange(id: string, amount: number, event: any): void {
    const type = event.target.value || '';
    this.dataService.updateExpense(id, type, amount);
  }

  onExpenseAmountChange(id: string, type: string, event: any): void {
    const amount = parseFloat(event.target.value) || 0;
    this.dataService.updateExpense(id, type, amount);
  }

  addExpense(): void {
    this.dataService.addExpense();
  }

  removeExpense(id: string): void {
    this.dataService.removeExpense(id);
  }

  save(): void {
    this.dataService.saveData().subscribe({
      next: () => {
        this.savedMessage = 'Data saved successfully!';
        setTimeout(() => {
          this.savedMessage = '';
        }, 2000);
        
        // Fetch newly updated data for this period
        this.dataService.fetchData(this.maintenanceData.year, this.maintenanceData.month);
      },
      error: (err) => {
        console.error('Error saving to MongoDB', err);
        this.savedMessage = 'Failed to save to database!';
      }
    });
  }

  sendWhatsAppMessage(): void {
    const amount = this.maintenanceData.amountPerPerson || 10;
    const monthName = this.months.find(m => m.value === this.maintenanceData.month)?.label || '';
    const year = this.maintenanceData.year;
    
    // Construct the WhatsApp message body
    const message = `Hello,\n\nPlease pay the maintenance amount of ₹${amount} for ${monthName} ${year}.`;
    
    // Redirect to WhatsApp with the pre-filled message text
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
