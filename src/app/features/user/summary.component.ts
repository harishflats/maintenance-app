import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
  summaryData: any[] = [];
  totalBalance: string | number = 0;
  isTotalNegative: boolean = false;
  isTotalPositive: boolean = false;

  constructor(private http: HttpClient, private router: Router, private dataService: DataService) {}

  ngOnInit(): void {
    this.fetchSummaryData();
  }

  fetchSummaryData(): void {
    this.http.get<any[]>(`${this.dataService['apiUrl']}`).subscribe(
      (data) => {
        console.log('API Response:', data); // Debug log to inspect API response
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        this.summaryData = data.map(item => {
          const collectedAmount = (item.paidMembers || 0) * (item.amountPerPerson || 0);
          const spentAmount = (item.expenses || []).reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0);
          const monthBalance = collectedAmount - spentAmount;
          const monthName = monthNames[item.month - 1] || 'Unk';
          return {
            month: monthName,
            monthIndex: item.month, // Keep numeric month for sorting
            year: item.year,
            collectedAmount,
            spentAmount,
            monthBalance,
            isNegative: monthBalance < 0,
            isPositive: monthBalance > 0
          };
        }).sort((a, b) => b.year - a.year || b.monthIndex - a.monthIndex); // Sort by year desc, then month desc
        this.calculateTotalBalance();
        
        // Format the amounts with the rupees symbol and commas for the table
        this.summaryData = this.summaryData.map(item => ({
          ...item,
          collectedAmount: '₹' + item.collectedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          spentAmount: '₹' + item.spentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          monthBalanceRaw: item.monthBalance,
          monthBalance: (item.monthBalance < 0 ? '-' : '') + '₹' + Math.abs(item.monthBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }));
      },
      (error) => {
        console.error('Error fetching summary data:', error);
      }
    );
  }

  calculateTotalBalance(): void {
    const total = this.summaryData.reduce((sum, item) => sum + item.monthBalance, 0);
    this.isTotalNegative = total < 0;
    this.isTotalPositive = total > 0;
    this.totalBalance = (total < 0 ? '-' : '') + '₹' + Math.abs(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  goBack(): void {
    this.router.navigate(['/user']);
  }
}