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
  totalBalance: number = 0;

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
            monthBalance
          };
        }).sort((a, b) => b.year - a.year || b.monthIndex - a.monthIndex); // Sort by year desc, then month desc
        this.calculateTotalBalance();
      },
      (error) => {
        console.error('Error fetching summary data:', error);
      }
    );
  }

  calculateTotalBalance(): void {
    this.totalBalance = this.summaryData.reduce((sum, item) => sum + item.monthBalance, 0);
  }

  goBack(): void {
    this.router.navigate(['/user']);
  }
}