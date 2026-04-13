# Quick Reference Guide

## 🚀 60-Second Start

```bash
cd d:\Projects\maintenance-app
npm install      # First time only
npm start        # Opens http://localhost:4200
```

**Default Port**: http://localhost:4200

---

## 🔐 Login Options

| Role | Can Do | Cannot Do |
|------|--------|-----------|
| **Admin** | Enter amounts, expenses, save data | None - full access |
| **User** | View all data, change months | Edit data |

---

## 💻 Admin Quick Guide

### Data Entry Fields
1. **Month/Year**: Select from dropdowns
2. **Amount per Person**: Enter monthly amount (₹)
3. **Paid Members**: Click +/- buttons (shows count)
4. **Maid**: Enter expense amount (₹)
5. **EB Bill**: Enter electricity bill (₹)
6. **Others**: Enter miscellaneous expenses (₹)
7. **Save**: Click button to persist

### Calculations (Automatic)
- **Collected** = Amount × Paid Members
- **Spent** = Maid + EB + Others
- **Balance** = Collected - Spent

### Tips
- All changes calculate instantly
- Save button required to persist
- Different months stored separately
- Edit any past month anytime

---

## 👁️ User Quick Guide

### What You Can See
- Total amount collected this month
- Total amount spent this month
- Current balance (positive/negative)
- Breakdown: Maid + EB + Others
- Members count and per-person amount

### What You Cannot Do
- Edit any fields
- Change expenses
- Modify members or amounts
- Delete data

### Tips
- Use month dropdown to view history
- Large numbers show key metrics
- Emoji shows balance status
- Read-only view (nothing changes)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── core/            ← Services and Guards
│   ├── features/        ← Auth, Admin, User Modules
│   ├── shared/          ← Shared Components
│   └── app.module.ts    ← Root Module
├── styles.css           ← Global Styles
└── main.ts              ← Bootstrap
```

---

## 🛠️ Common Tasks

### Add New Expense Type

**File**: `src/app/core/services/data.service.ts`

```typescript
// In MaintenanceData interface:
expenses: {
  maid: 0,
  ebBill: 0,
  others: 0,
  water: 0,  // ← Add this
}
```

**File**: `src/app/features/admin/admin.component.html`

```html
<!-- Add input field:-->
<div class="form-group">
  <label>Water (₹)</label>
  <input type="number" [(ngModel)]="maintenanceData.expenses.water"
    (change)="onWaterChange($event)" step="0.01" min="0" />
</div>
```

**File**: `src/app/features/admin/admin.component.ts`

```typescript
// Add handler:
onWaterChange(event: any): void {
  const value = parseFloat(event.target.value) || 0;
  this.dataService.updateExpense('water', value);
}
```

### Change Colors

**File**: `src/app/features/admin/admin.component.css`

```css
/* Change header gradient */
.admin-header {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); /* Red-Orange */
}

/* Change summary card */
.summary-card {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
}

/* Change buttons */
.btn-save {
  background-color: #FF6B6B;
}
```

### Change Month Selector default

**File**: `src/app/core/services/data.service.ts`

```typescript
private defaultData: MaintenanceData = {
  year: new Date().getFullYear(),
  month: 1,  // Change this (1-12)
  ...
}
```

### Connect to Backend

**File**: `src/app/core/services/data.service.ts`

```typescript
import { HttpClient } from '@angular/common/http';

constructor(private http: HttpClient) { }

// Replace localStorage with API
saveData(): void {
  this.http.post('/api/maintenance', this.getCurrentData())
    .subscribe(response => console.log('Saved!'));
}

// Load data from API
loadData(): void {
  this.http.get('/api/maintenance')
    .subscribe(data => this.setCurrentData(data));
}
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "ng not found" | `npm install -g @angular/cli` |
| Port 4200 busy | `ng serve --port 4201` |
| Styles missing | `Ctrl+Shift+R` (hard refresh) |
| Data gone | Check localStorage: F12 → Application → Local Storage |
| Build errors | Delete `node_modules`, run `npm install` |
| Can't login | Avoid special characters, use simple role names |

---

## 📊 Data Storage Locations

### Browser Storage (F12 → Application)

```
Local Storage:
├── user_role              → "admin" or "user"
└── maintenance_YYYY_M     → { year, month, amounts, expenses }

Examples:
├── maintenance_2026_4     → April 2026 data
├── maintenance_2026_5     → May 2026 data
└── maintenance_2025_12    → December 2025 data
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Tab | Move to next field |
| Shift+Tab | Move to previous field |
| Enter | Submit form (if focused on input) |
| F12 | Open Developer Tools |
| Ctrl+Shift+R | Hard refresh (clear cache) |

---

## 📱 Responsive Breakpoints

| Device | Size | Layout |
|--------|------|--------|
| Mobile | ≤480px | Single column, large buttons |
| Tablet | 481-768px | Adjusted padding, readable |
| Desktop | >768px | Full width, hover effects |

---

## ✅ Feature Checklist

### Admin Features
- ✅ Month selector
- ✅ Amount input
- ✅ Members +/- buttons
- ✅ 3 expense inputs
- ✅ Auto-calculated summary
- ✅ Save button
- ✅ Data persistence
- ✅ Multi-month support

### User Features
- ✅ Month selector
- ✅ Summary display (3 cards)
- ✅ Expense breakdown
- ✅ Collection info
- ✅ Logout
- ✅ Read-only interface

### Technical Features
- ✅ Lazy loading
- ✅ Route guards
- ✅ localStorage
- ✅ RxJS Observables
- ✅ Responsive design
- ✅ TypeScript strict mode

---

## 🚀 Production Checklist

- [ ] Run `npm run build` (creates dist/)
- [ ] Test build in browser
- [ ] Test on mobile devices
- [ ] Check console for errors (F12)
- [ ] Verify localStorage working
- [ ] Test all features
- [ ] Deploy dist/ folder
- [ ] Set up CI/CD (optional)

---

## 📝 File Reference

| File | Purpose | Edit For |
|------|---------|----------|
| `data.service.ts` | State & storage | Add fields, logic |
| `admin.component.ts` | Admin logic | Admin behavior |
| `admin.component.html` | Admin UI | Inputs, layout |
| `admin.component.css` | Admin styles | Colors, spacing |
| `user.component.ts` | User logic | User behavior |
| `user.component.html` | User UI | Display fields |
| `user.component.css` | User styles | User colors |
| `auth.service.ts` | Role management | Login logic |
| `app-routing.module.ts` | Routes | Add routes |
| `styles.css` | Global styles | App-wide changes |

---

## 🎨 CSS Color Variables

Add to `styles.css` for easy theming:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #48c6ef;
  --success-color: #4ade80;
  --danger-color: #ff6b6b;
  --text-color: #333;
  --border-color: #ddd;
  --background-color: #f5f7fa;
}

/* Then use */
.btn { background: var(--primary-color); }
```

---

## 📚 Documentation Files

| File | Content |
|------|---------|
| `README.md` | Features & installation |
| `SETUP.md` | Step-by-step setup |
| `ARCHITECTURE.md` | Design decisions |
| `PROJECT_SUMMARY.md` | Completion & stats |
| `QUICK_REFERENCE.md` | This file |

---

## 💡 Pro Tips

1. **Use +/- Buttons**: Faster than typing member count
2. **Tab Navigation**: Move between fields with Tab key
3. **Check localStorage**: F12 → Application to verify saves
4. **Copy Data Structure**: Use existing patterns for new fields
5. **Mobile Testing**: Use DevTools Device Toolbar (Ctrl+Shift+M)
6. **Clear Cache**: Ctrl+Shift+Delete for stuck styles
7. **Responsive Design**: View in multiple screen sizes
8. **Code Comments**: Each file has explanatory comments

---

## 🔄 Development Workflow

```bash
# 1. Start dev server
npm start

# 2. Make changes, auto-reloads

# 3. Test in DevTools (F12)
# 4. Check localStorage for data
# 5. Test on mobile (responsive mode)

# 6. Build for production
npm run build

# 7. Output in dist/ folder
# 8. Deploy dist/ contents
```

---

## 📞 Getting Help

1. **Errors in console?** → F12 → Console tab
2. **Data not saving?** → Check localStorage
3. **Styles broken?** → Hard refresh Ctrl+Shift+R
4. **Build failed?** → Check `npm install` complete
5. **Port busy?** → Use `ng serve --port 4201`

---

## 🎯 Next Steps

1. **Setup**: Follow `SETUP.md`
2. **Run**: `npm start`
3. **Test**: Try both roles
4. **Read**: Full docs in `README.md`
5. **Customize**: Follow `ARCHITECTURE.md`
6. **Deploy**: Build and host `dist/` folder

---

**Last Updated**: April 13, 2026
**Version**: 1.0.0
**Status**: Ready to Use

Quick Reference v1.0 ✨
