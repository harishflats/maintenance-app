# Apartment Maintenance Tracking System

A minimal, mobile-friendly Angular application for tracking apartment maintenance expenses and collections. Built with role-based access control (Admin/User).

## Features

### 🔐 Authentication
- Simple login screen with role selection
- No complex authentication required
- Role-based navigation (Admin/User)
- Session persistence using localStorage

### 👨‍💼 Admin Features
- **Month Selection**: Choose any month/year to view or edit data
- **Collection Management**:
  - Set amount per person
  - Track paid members with +/- buttons
  - Real-time calculation of total collected
- **Expense Tracking**:
  - Maid expenses
  - Electricity Bill (EB)
  - Other miscellaneous expenses
- **Auto-calculated Summary**:
  - Total Collected = Amount per Person × Paid Members
  - Total Spent = Sum of all expenses
  - Balance = Collected - Spent
- **Data Persistence**: Save/load data from localStorage

### 👁️ User Features (View-Only)
- View current month's data
- Select different months/years
- See expense breakdown:
  - Maid costs
  - EB Bill costs
  - Other expenses
- View collection information
- Understand financial status within 5 seconds

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   └── data.service.ts          # Centralized state management
│   │   ├── guards/
│   │   │   └── auth.guard.ts            # Route protection
│   │   └── core.module.ts               # Core module
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login.component.ts
│   │   │   ├── login.component.html
│   │   │   ├── login.component.css
│   │   │   ├── auth.service.ts          # Role management
│   │   │   ├── auth-routing.module.ts
│   │   │   └── auth.module.ts
│   │   ├── admin/
│   │   │   ├── admin.component.ts
│   │   │   ├── admin.component.html
│   │   │   ├── admin.component.css
│   │   │   ├── admin-routing.module.ts
│   │   │   └── admin.module.ts
│   │   └── user/
│   │       ├── user.component.ts
│   │       ├── user.component.html
│   │       ├── user.component.css
│   │       ├── user-routing.module.ts
│   │       └── user.module.ts
│   ├── shared/                          # Shared components/directives
│   ├── app.module.ts
│   ├── app-routing.module.ts
│   └── app.component.ts
├── styles.css                           # Global styles
└── main.ts                              # Bootstrap file
```

## Technical Stack

- **Framework**: Angular (latest stable)
- **Forms**: Template-driven forms (FormsModule)
- **State Management**: RxJS BehaviorSubject + localStorage
- **Routing**: Lazy loading with route guards
- **Styling**: CSS3 with mobile-first responsive design
- **Type Safety**: TypeScript strict mode

## Installation

### Prerequisites
- Node.js (v18.x or higher)
- npm (v8.x or higher)
- Angular CLI (v16.x or higher)

```bash
npm install -g @angular/cli
```

### Setup

1. Clone or navigate to the project directory:
```bash
cd maintenance-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
# or
ng serve
```

4. Open your browser and navigate to:
```
http://localhost:4200
```

## Usage

### First Time Setup

1. **Login Screen**: Select your role
   - Click "Admin" to manage finances
   - Click "User" to view data only

### As Admin

1. **Select Month**: Choose year and month from dropdowns
2. **Enter Collection Details**:
   - Set "Amount per Person" (e.g., ₹1000)
   - Adjust "Paid Members" using +/- buttons
3. **Enter Expenses**:
   - Maid: Monthly maid cost
   - EB Bill: Electricity bill
   - Others: Any additional expenses
4. **Review Summary**: Automatically calculates:
   - Total Collected
   - Total Spent
   - Balance
5. **Save**: Click "Save Data" to persist changes
6. **Switch Months**: Change month to manage different periods

### As User

1. **Select Month**: Choose year and month from dropdowns
2. **View Summary**: See at a glance:
   - Total collected this month
   - Total spent this month
   - Current balance
3. **View Expenses**: See itemized breakdown by category
4. **View Collection Info**: Amount per member and paid count

## Data Storage

- Data is stored locally in browser's localStorage
- Each month has its own storage entry: `maintenance_YYYY_M`
- User role persists across sessions: `user_role`
- No server required - fully offline capable

### Clear Data

To clear stored data:
1. Open browser Developer Tools (F12)
2. Go to Application → Local Storage
3. Remove entries like `maintenance_2026_4` or `user_role`
4. Refresh the page

## Responsive Design

### Desktop (> 768px)
- Full-width cards with optimal spacing
- Multi-column layouts where applicable
- Hover effects on interactive elements

### Tablet (481px - 768px)
- Single column layout with adjusted padding
- Optimized touch targets
- Readable font sizes

### Mobile (≤ 480px)
- Full-width interface with 15px padding
- Stacked form controls
- Large touch-friendly buttons (44px minimum)
- Viewport meta tag for proper scaling

## Styling Features

- **Color Scheme**:
  - Primary: Purple gradient (#667eea → #764ba2)
  - Secondary: Cyan gradient (#48c6ef → #06aed5)
  - Success: Green (#4ade80)
  - Alert: Red (#ff6b6b)

- **Cards**: Clean white cards with subtle shadows
- **Forms**: Focus states with colored outlines
- **Numbers**: Large, bold financial values
- **Icons**: Unicode emojis for visual clarity

## Feature Usage Tips

### Admin Quick Entry (< 30 seconds)
1. Month auto-loads current month
2. Tab between fields
3. Use +/- buttons for quick member count
4. All calculations are real-time
5. Save with one click

### User Quick View (< 5 seconds)
1. Login → view current month instantly
2. Large numbers show key metrics at a glance
3. Expense breakdown is color-coded
4. Switch months with two dropdown selections

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Build for Production

```bash
ng build --configuration production
```

Output will be in the `dist/maintenance-app` directory.

## Performance

- **Lazy Loading**: Auth, Admin, and User modules load only when needed
- **Tree Shaking**: Unused code removed in production builds
- **Bundle Size**: < 200KB (with bundling and compression)
- **Lighthouse Score**: Optimized for mobile performance

## Accessibility

- Semantic HTML structure
- ARIA labels on form inputs
- Keyboard navigation support
- Color contrast meets WCAG AA standards
- Mobile viewport properly configured

## Future Enhancements

- [ ] Multi-apartment support
- [ ] Member management page
- [ ] Monthly reports/history
- [ ] Export to CSV
- [ ] Email notifications
- [ ] Photo receipts for expenses
- [ ] Budget forecasting
- [ ] Dark mode support

## Troubleshooting

### Data not persisting
- Check if localStorage is enabled in browser
- Verify localStorage hasn't exceeded quota
- Clear cache and try again

### Login not working
- Ensure you're selecting a role (Admin or User)
- Check browser console for errors
- Clear localStorage and restart

### Styles not loading
- Clear browser cache (Ctrl+Shift+Delete)
- Restart the development server
- Check that `styles.css` is referenced in `angular.json`

## License

This project is provided as-is for apartment maintenance management.

## Support

For issues or feature requests, please check the browser console for error messages and ensure all dependencies are correctly installed.

---

**Made with ❤️ for apartment management**
