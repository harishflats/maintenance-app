import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService, MaintenanceData, Summary } from '../../core/services/data.service';
import { AuthService } from '../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
  selectedFile: File | null = null;
  uploadProgress: number | null = null;
  uploadURL: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.maintenanceData = this.dataService.getCurrentData();
    this.summary = this.dataService.getSummary();
    this.generateYears();
  }

  ngOnInit(): void {
    // Ensure only an admin can access this page.
    // This check is a safeguard; the AuthGuard should be the primary protection.
    if (localStorage.getItem('user_role') !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }

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

  onDateChange(change: { year?: number; month?: number }): void {
    const newYear = change.year !== undefined ? change.year : this.maintenanceData.year;
    const newMonth = change.month !== undefined ? change.month : this.maintenanceData.month;
    if (newYear !== this.maintenanceData.year || newMonth !== this.maintenanceData.month) {
      this.dataService.setMonth(newYear, newMonth);
    }
  }

  onAmountChange(value: number): void {
    this.dataService.updateAmountPerPerson(value);
  }

  onCommentsChange(value: string): void {
    this.dataService.updateComments(value);
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

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
    this.uploadURL = null;
    this.uploadProgress = null;
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      return;
    }
    const fileToUpload = this.selectedFile;
    const url = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/auto/upload`;
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);
    formData.append('folder', `uploads/${this.maintenanceData.year}/${this.maintenanceData.month}`);

    this.uploadProgress = 0;
    this.http.post(url, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * event.loaded / (event.total || event.loaded));
        } else if (event.type === HttpEventType.Response) {
          this.uploadURL = event.body.secure_url;
          this.savedMessage = 'File uploaded successfully!';

          // Store in the maintenance data and auto-save to DB
          const data = this.maintenanceData as any;
          if (!data.uploadedFiles) {
            data.uploadedFiles = [];
          }
          data.uploadedFiles.push({
            name: fileToUpload.name,
            url: event.body.secure_url
          });
          this.save();

          setTimeout(() => (this.savedMessage = ''), 3000);
          this.selectedFile = null;
        }
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.savedMessage = 'File upload failed!';
        this.uploadProgress = null;
        this.selectedFile = null;
      }
    });
  }

  removeFile(index: number): void {
    const data = this.maintenanceData as any;
    if (data.uploadedFiles) {
      data.uploadedFiles.splice(index, 1);
      this.save(); // Automatically save to DB after removing
    }
  }

  sendWhatsAppMessage(): void {
    const amount = this.maintenanceData.amountPerPerson || 1000;
    
    let targetMonthValue = this.maintenanceData.month - 1;
    if (targetMonthValue === 0) {
      targetMonthValue = 12; // Wrap around to December if current month is January
    }
    const targetMonthLabel = this.months.find(m => m.value === targetMonthValue)?.label || '';

    // Construct the WhatsApp message body
    const message = `Dear all,\nHope you’re all doing good! Please send the maintenance amount of ₹${amount} for the month of ${targetMonthLabel} Once received we’ll share the expense split-up sheet with you all. Thanks everyone! 🙌`;
    
    // Redirect to WhatsApp with the pre-filled message text
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
