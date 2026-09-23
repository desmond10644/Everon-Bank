# MyBank Banking Website

## Overview

MyBank is a full-stack banking website built with React, Vite, Express, and MySQL. The frontend communicates with the backend through REST API endpoints, and the backend reads and writes banking data in MySQL.

The application uses this flow:

```text
React frontend -> Express API -> MySQL database
```

## Frontend

### Technology

- React 19
- Vite
- React Router
- CSS modules and page-specific stylesheets
- Axios and Fetch-based API services
- Local storage for authentication persistence and fallback demo data

### Main pages

- Home page
- Login
- Registration
- Dashboard
- Accounts
- Transactions
- Transfers
- Cards
- Loans
- Investments
- Profile
- Settings and notifications
- Help
- Not found page

### Navigation and layout

- Shared application layout with navbar, sidebar, and footer
- Protected routes for authenticated banking pages
- Sidebar is the main page navigation
- Duplicate top navigation links were removed from the navbar
- Theme toggle with light and dark theme support
- Responsive layouts for desktop, tablet, and mobile screens

## Authentication

The authentication system includes:

- User registration
- User login
- Password hashing with `bcryptjs`
- JWT authentication
- Protected frontend routes
- Auth state stored in React context
- Token and user persistence in local storage
- Logout functionality
- Profile updates
- Password change API support

### Seeded demo account

```text
Email: john@example.com
Password: Password123!
```

A second seeded user is also available:

```text
Email: jane@example.com
Password: Password123!
```

## Dashboard

The dashboard includes:

- Welcome header
- Total account balance and banking overview
- Quick actions
- Transfer money shortcut
- Deposit shortcut
- Pay bills shortcut
- Buy airtime/data shortcut
- View statements shortcut
- Account summary cards
- Recent transactions
- Notifications list
- Unread notification count
- Mark-all-as-read action
- View-all notifications action

## Accounts

Account functionality includes:

- List of user accounts
- Current and savings account display
- Account balances
- Account numbers
- Account status
- Account type information
- Account details retrieval from the backend
- Local storage fallback for demo account data

## Transactions

Transaction functionality includes:

- User transaction history
- Transaction descriptions and titles
- Transaction dates
- Transaction type
- Transaction status
- Transaction amounts
- Positive and negative amount display
- CSV activity export
- Backend transaction retrieval
- Local storage fallback support

## Transfers

The transfer centre supports:

- Transfers between the user's own accounts
- Bank transfers to another recipient
- Transfer form validation
- Account selection
- Available balance validation
- Recipient name, account number, bank, amount, and description
- Immediate transfers
- Scheduled transfers
- Saved beneficiaries
- Recent recipients
- Transfer history
- Confirmation step before submission
- Success state after a completed transfer
- Database transaction handling on the backend
- Insufficient funds validation
- Ownership checks for sending accounts

### Transfer API operations

- `GET /api/transfers/data`
- `POST /api/transfers/beneficiaries`
- `POST /api/transfers`

## Cards

Card functionality includes:

- View the user's cards
- Physical and virtual card display
- Card number masking
- Card holder and expiry details
- Card balance
- Card status
- Freeze and unfreeze card
- Enable or disable online payments
- Enable or disable international payments
- Change spending limit
- Change card PIN
- Request card replacement
- Create physical or virtual cards
- PIN hashing with `bcryptjs`
- Card ownership validation

### Card database fields

Cards support:

- Card kind
- Frozen state
- Spending limit
- Online payment setting
- International payment setting
- Replacement request state
- Hashed PIN
- PIN change timestamp

## Loans

The loan area includes:

- User loan retrieval
- Loan type display
- Loan amount
- Outstanding balance
- Loan status
- Loan-related dashboard display

## Investments

Investment functionality includes:

- Portfolio value
- Total invested amount
- Total returns
- Profit and loss
- Investment categories
- Risk level calculation
- Performance chart
- Investment holdings
- Investment history
- Buy investment flow
- Sell investment flow
- Investment activity records
- Demo investment options including balanced growth, treasury bills, fixed income, and global equity

### Investment API operations

- `GET /api/investments`
- `GET /api/investments/user/:userId`
- `POST /api/investments`
- `POST /api/investments/:id/sell`

## Notifications and settings

Notification functionality includes:

- User notification list
- Notification type and title
- Notification message and timestamp
- Read and unread state
- Mark one notification as read
- Mark all notifications as read
- Notification filtering
- Email notification preference
- SMS notification preference
- Persistent notification preferences in MySQL

### Notification API operations

- `GET /api/notifications/user/:userId`
- `PATCH /api/notifications/:notificationId/read`
- `PATCH /api/notifications/read-all`
- `GET /api/notifications/preferences`
- `PATCH /api/notifications/preferences`

## Profile

The profile page includes:

- Profile identity section
- User initials avatar
- Full name
- Email address
- Phone number
- Address
- Account information summary
- Email and phone verification display
- Profile editing form
- Profile update request
- Local user data refresh after saving
- Responsive two-column desktop layout
- Responsive single-column mobile layout
- Security information panel

## Backend

### Technology

- Node.js
- Express
- MySQL2
- JWT
- bcryptjs
- CORS
- dotenv

### Backend API areas

- `/api/auth`
- `/api/users`
- `/api/accounts`
- `/api/transactions`
- `/api/cards`
- `/api/loans`
- `/api/investments`
- `/api/notifications`
- `/api/transfers`

### Security and validation

- JWT middleware protects private routes
- Users can only access their own accounts, cards, transactions, notifications, investments, and transfers
- Passwords are hashed before storage
- Card PINs are hashed before storage
- Transfer amounts are validated
- Insufficient account balances are rejected
- Database transactions are used for money transfers
- SQL queries use parameterized values for user input

## Database

The backend uses MySQL with these environment variables in `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bank
JWT_SECRET=mybank_secret_key
```

The seed script creates and populates the banking database with:

- Users
- Accounts
- Transactions
- Cards
- Loans
- Investments
- Investment activity
- Notifications
- Notification preferences
- Beneficiaries
- Scheduled transfers

The server also ensures required tables and newer columns exist when it starts.

## Running the project

### Start the backend

```powershell
Push-Location backend
npm install
npm start
Pop-Location
```

The backend runs at:

```text
http://localhost:5000
```

### Seed the database

```powershell
Push-Location backend
node seed-data.js
Pop-Location
```

### Start the frontend

```powershell
npm install
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

## Verification completed

The following checks were completed during development:

- Frontend Vite production build succeeds
- Workspace diagnostics report no errors in the edited pages and API modules
- Backend JavaScript syntax checks pass
- Backend root endpoint responds successfully
- Frontend server responds successfully
- MySQL connection and `SELECT 1` query succeed
- Database-backed login succeeds with the seeded demo account
- Login returns the expected user and JWT token

## Important implementation fixes completed

The following missing frontend API exports were added and aligned with backend routes:

- Transfer data and transfer submission helpers
- Beneficiary creation helper
- Card creation and card update helpers
- Card PIN change helper
- Card replacement helper
- Investment creation helper
- Investment selling helper
- Notification preference helpers
- Notification read and read-all route corrections

The profile page was also reorganized to match its responsive stylesheet, and duplicate top navigation links were removed so the sidebar is the primary navigation.

## Project status

The project currently has a working full-stack banking flow with a React frontend, Express API, and MySQL database. The core user journeys are implemented across authentication, accounts, transactions, transfers, cards, loans, investments, notifications, settings, and profile management.
