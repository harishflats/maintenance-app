import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rupee',
  standalone: true
})
export class RupeePipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value == null || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return String(value);

    const formattedAmount = Math.abs(num).toLocaleString('en-IN', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });

    return num < 0 ? `-₹${formattedAmount}` : `₹${formattedAmount}`;
  }
}