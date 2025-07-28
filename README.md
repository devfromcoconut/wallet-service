# Coconut Wallet Service

This is an independent wallet service extracted from the main Coconut backend services. It runs on a separate port and handles all wallet-related operations.

## Features

- Create wallets
- Process payments
- Transfer funds to banks
- Bani transfers
- Get wallet balances
- Fetch transactions
- Update BVN
- Get all banks

## Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the `.env` file with your configuration values.

4. Run the service:
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## API Endpoints

The wallet service runs on port 5001 by default and provides the following endpoints:

- `GET /api/v1/wallets/data` - Get all wallets (admin)
- `GET /api/v1/wallets/transactions` - Get all transactions (admin)
- `POST /api/v1/wallets/bani` - Bani transfer to bank
- `POST /api/v1/wallets` - Create a new wallet
- `GET /api/v1/wallets/banks` - Get all banks
- `GET /api/v1/wallets/:businessId` - Get business wallets
- `GET /api/v1/wallets/verify` - Verify transaction
- `GET /api/v1/wallets/balance/:walletId` - Get wallet balance
- `POST /api/v1/wallets/pay` - Process payment
- `POST /api/v1/wallets/transfer` - Transfer to bank
- `POST /api/v1/wallets/update-bvn` - Update BVN
- `GET /api/v1/wallets/transactions/:walletId` - Get wallet transactions

## Environment Variables

See `.env.example` for required environment variables.

## Dependencies

This service only includes the minimal dependencies required for wallet operations:
- Express.js for the web framework
- Mongoose for MongoDB operations
- Axios for HTTP requests
- JWT for authentication
- Zod for validation
- And other essential packages
