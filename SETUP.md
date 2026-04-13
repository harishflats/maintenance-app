# Setup Guide - Apartment Maintenance Tracking System

## Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js v18+ installed
- [ ] npm v8+ installed
- [ ] Angular CLI v16+ installed
- [ ] A code editor (VS Code recommended)

### Installation Commands

```bash
# Check Node version
node --version    # Should be v18.x or higher

# Check npm version
npm --version     # Should be v8.x or higher

# Install Angular CLI globally
npm install -g @angular/cli@latest

# Check Angular CLI version
ng version        # Should be v16.x or higher
```

## Project Setup Steps

### 1. Install Dependencies

Navigate to the project directory and install all required packages:

```bash
cd d:\Projects\maintenance-app
npm install
```

This will install all dependencies specified in `package.json`:
- Angular framework
- RxJS (reactive programming)
- TypeScript
- Build tools
- Development servers

### 2. Verify Installation

After npm install completes, verify everything is set up:

```bash
# Check the generated node_modules folder
ls node_modules    # Should show @angular, tslib, rxjs, etc.

# Verify Angular CLI is available
ng version         # Should display Angular version info
```

### 3. Development Server

Start the development server:

```bash
npm start
```

Or alternatively:

```bash
ng serve
```

Expected output:
```
✔ Compiled successfully.
✔ Built dev server.

Application bundle generated successfully.
Initial chunk sizes | Names         | Size
styles.css          |              | 4.5 kB
main                | main         | 150 kB
polyfills           | polyfills    | 120 kB

Application is served at http://localhost:4200
```

### 4. Open in Browser

Open your browser and navigate to:
```
http://localhost:4200
```

You should see the login screen with two role options:
- **Admin** (Manage finances)
- **User** (View only)

## Project Architecture Quick Overview

### File Structure

```
maintenance-app/
├── src/
│   ├── app/
│   │   ├── core/                    # Centralized services & guards
│   │   │   ├── services/
│   │   │   │   └── data.service.ts  # State management
│   │   │   └── guards/
│   │   │       └── auth.guard.ts    # Route protection
│   │   ├── features/                # Feature modules
│   │   │   ├── auth/                # Login module
│   │   │   ├── admin/               # Admin dashboard
│   │   │   └── user/                # User view-only
│   │   ├── app.module.ts            # Root module
│   │   ├── app-routing.module.ts    # Main routing
│   │   └── app.component.ts         # Root component
│   ├── styles.css                   # Global styles
│   ├── main.ts                      # Bootstrap file
│   └── index.html                   # HTML template
├── angular.json                     # Angular CLI config
├── tsconfig.json                    # TypeScript config
├── package.json                     # Dependencies
└── README.md                        # Full documentation
```

### Module Architecture

The app uses **lazy-loaded feature modules** for optimal performance:

```
AppModule (root)
├── CoreModule (provided once)
│   ├── DataService
│   └── AuthGuard
├── AuthModule (lazy - /login)
│   ├── LoginComponent
│   └── AuthService
├── AdminModule (lazy - /admin)
│   └── AdminComponent
└── UserModule (lazy - /user)
    └── UserComponent
```

## Key Features by Role

### Admin Features
1. **Month Selection**: Dropdown to choose month/year
2. **Amount per Person**: Input field (default: 0)
3. **Paid Members**: Button controls (+/-) to adjust
4. **Expense Inputs**:
   - Maid expense
   - EB Bill
   - Others (miscellaneous)
5. **Auto Summary**:
   - Total Collected = Amount × Paid Members
   - Total Spent = Sum of expenses
   - Balance = Collected - Spent
6. **Save Button**: Persists data to localStorage

### User Features
1. **Month Selection**: Same dropdown selector
2. **Summary View**: 3 large cards showing:
   - Collected amount
   - Spent amount
   - Current balance
3. **Expense Breakdown**: Itemized list of expenses
4. **Collection Info**: Amount per member and paid count
5. **Read-Only**: No editing capability

## Data Persistence

### How it Works

The app uses browser **localStorage** for data persistence:

1. **Login State**: Stores user role
   - Key: `user_role`
   - Value: `"admin"` or `"user"`

2. **Monthly Data**: Separate entry for each month
   - Key pattern: `maintenance_YYYY_M`
   - Example: `maintenance_2026_4` for April 2026
   - Contains: Amount, members, expenses

3. **Automatic Saving**: 
   - Data updates whenever you change fields
   - Admin must click "Save" for final confirmation
   - Changes persist across browser refreshes

### Storage Locations

**Chrome/Edge**: DevTools → Application → Local Storage
**Firefox**: Storage → Local Storage
**Safari**: Develop → Page → Local Storage

### Clear Data (if needed)

```javascript
// In browser console (F12)
localStorage.clear();  // Clear all
// or
localStorage.removeItem('maintenance_2026_4');  // Clear specific month
localStorage.removeItem('user_role');  // Clear role
```

## Testing the Application

### Test Admin Features
1. Login as Admin
2. Set Amount per Person: 1000
3. Set Paid Members: 5 (using +/- buttons)
4. Should see Collected: 5000
5. Add Maid: 2000, EB: 1500, Others: 500
6. Should show Spent: 4000, Balance: 1000
7. Click "Save Data"
8. Refresh page - data should persist

### Test User Features
1. Logout from Admin (if needed) or open incognito window
2. Login as User
3. View same data as Admin entered
4. Try to edit - should be read-only
5. Switch months - can view data from other months

### Test Responsiveness
1. Open DevTools (F12)
2. Click Device Toolbar icon
3. Test with:
   - iPhone 12 (390×844)
   - iPad (768×1024)
   - Desktop (1920×1080)

## Build for Production

### Production Build

```bash
ng build --configuration production
```

Output: `dist/maintenance-app/`

### Build Options

```bash
# Development build (faster, larger)
ng build

# Production build (slow, optimized)
ng build --configuration production

# Build with stats
ng build --stats-json

# Build for specific target
ng build -c production --output-hashing=all
```

## Troubleshooting

### Issue: "ng command not found"
**Solution**: Install Angular CLI globally
```bash
npm install -g @angular/cli
```

### Issue: Port 4200 already in use
**Solution**: Run on different port
```bash
ng serve --port 4201
```

### Issue: Cannot find module errors
**Solution**: Reinstall dependencies
```bash
rm -rf node_modules
npm install
```

### Issue: Data not persisting
**Solution**: 
1. Check if localStorage is enabled
2. Check browser storage limit
3. Clear cache: Ctrl+Shift+Delete

### Issue: Styles not loading
**Solution**:
1. Hard refresh: Ctrl+Shift+R
2. Check DevTools for CSS errors
3. Verify `styles.css` in angular.json

## Development Tips

### Hot Module Replacement (HMR)
The dev server automatically reloads when you save files. No manual refresh needed!

### Browser DevTools
Use Chrome DevTools to:
- Inspect elements
- Check console for errors
- Monitor localStorage
- Profile performance
- Debug TypeScript (with source maps)

### Code Formatting
```bash
# Format TypeScript files (if prettier installed)
npm run format

# Lint code
npm run lint
```

### Debug Mode
```bash
# Start with debugging
ng serve --poll=2000
```

## Performance Tips

### For Faster Development
```bash
# Build only for development (faster)
ng serve --poll=0

# Skip certain optimizations
ng serve --optimization=false
```

### For Production
- Bundle size typical: < 200KB (gzipped)
- Lazy loading ensures quick initial load
- CSS is minified
- JavaScript is minified and treeshaken

## Next Steps

1. **Read README.md**: Full feature documentation
2. **Explore the code**: Start with `src/app/app-routing.module.ts`
3. **Customize styles**: Edit files in `src/app/features/*/`
4. **Add features**: Follow existing module patterns

## Need Help?

1. **Check console errors**: F12 → Console
2. **Verify installation**: `npm install`
3. **Restart dev server**: Kill (Ctrl+C) and run `npm start`
4. **Clear everything**: Delete node_modules, reinstall
5. **Check package.json**: Verify Dependencies

## Environment Information

This project was created with:
- Angular CLI: 16.x+
- Node: 18.x+
- npm: 8.x+
- TypeScript: 5.x+

Compatible with:
- Windows, macOS, Linux
- All modern browsers
- Mobile browsers (iOS Safari, Chrome Mobile)

---

**Ready to start?** Run `npm start` and open `http://localhost:4200`
