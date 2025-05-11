# VitaReach Payment Server

A dedicated Node.js server for handling Razorpay payment processing for the VitaReach Telehealth Platform.

## Features

- Create Razorpay payment orders
- Verify payment signatures
- Secure handling of payment transactions
- Detailed logging for debugging

## Technologies Used

- Node.js & Express
- Razorpay API
- CORS for cross-domain requests
- Crypto for signature verification

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Razorpay account with API keys

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/pawaspy/Vitareach-Payment-Server.git
   cd Vitareach-Payment-Server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. Start the server:
   ```
   npm start
   ```

For development with auto-reload:
```
npm run dev
```

## API Endpoints

### Health Check
- `GET /`
  - Response: `{ "status": "Payment server is running" }`

### Create Order
- `POST /create-order`
  - Request Body: `{ "amount": number }`
  - Response: Razorpay order object

### Verify Payment
- `POST /verify`
  - Request Body: 
    ```
    {
      "razorpay_order_id": "order_id",
      "razorpay_payment_id": "payment_id",
      "razorpay_signature": "signature"
    }
    ```
  - Response: `{ "status": "success" }` or `{ "status": "failure" }`

## Deployment

This server can be deployed to any Node.js hosting platform like Render, Heroku, or Vercel.

### Example for Render:

1. Create a new Web Service
2. Connect your GitHub repository
3. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables for `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

## License

MIT

## Contact

For questions or support, please contact the repository owner. 