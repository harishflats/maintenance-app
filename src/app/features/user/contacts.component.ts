import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent {
  contacts = [
    { service: 'Cooper Lift Support', person: '', number: '9600122505' },
    { service: 'Cooper Lift Office', person: 'Keerthana', number: '9176876589' },
    { service: 'Plumber', person: 'Ramesh', number: '9600986773' },
    { service: 'Apartment Maid', person: '', number: '917358586945' },
    { service: 'Septic tank and drainage clean', person: 'Jagan', number: '917358586945' }
  ];

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}