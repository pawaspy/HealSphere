const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");

// Initialize Express app
const app = express();

// Enable CORS for frontend domains
app.use(cors({
  origin: ["https://heal-sphere.vercel.app", "http://localhost:8080"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Username", "X-Role"]
}));

// Parse JSON request body
app.use(bodyParser.json());

// Get Razorpay credentials from environment variables or use defaults for testing
const razorpay_key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_Pts9yxxuweuA1u";
const razorpay_key_secret = process.env.RAZORPAY_KEY_SECRET || "CrhHrTu8aJa3tyRS4ecWvYi7";

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: razorpay_key_id,
  key_secret: razorpay_key_secret,
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "Payment server is running" });
});

// Create order endpoint
app.post("/create-order", async (req, res) => {
  try {
    console.log("Create order request received:", req.body);
    
    const { amount } = req.body;
    if (!amount || amount < 1) {
      return res.status(400).json({ error: "Invalid amount. Must be at least 1." });
    }

    // Convert amount to paise (Razorpay requires amount in smallest currency unit)
    const amountPaise = Math.floor(amount * 100);
    
    // Create order options
    const options = {
      amount: amountPaise,
      currency: "INR",
      receipt: "order_rcptid_" + Math.random().toString(36).substring(2, 15),
      notes: {
        purpose: "Medical Consultation"
      }
    };
    
    console.log("Creating order with options:", options);

    // Create order with Razorpay
    const order = await razorpay.orders.create(options);
    console.log("Order created successfully:", order);
    
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ 
      error: "Error creating order", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Verify payment endpoint
app.post("/verify", (req, res) => {
  try {
    console.log("Verify payment request received:", req.body);
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    
    // Create signature verification data
    const sigData = razorpay_order_id + "|" + razorpay_payment_id;
    console.log("Signature verification data:", sigData);
    
    // Create HMAC SHA256 signature
    const generated_signature = crypto
      .createHmac("sha256", razorpay_key_secret)
      .update(sigData)
      .digest("hex");
    
    console.log("Generated signature:", generated_signature);
    console.log("Received signature:", razorpay_signature);
    
    // Verify the signature
    if (generated_signature === razorpay_signature) {
      console.log("Signature verification successful");
      res.json({ status: "success" });
    } else {
      console.log("Signature verification failed");
      res.json({ status: "failure", reason: "signature_mismatch" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ 
      error: "Error verifying payment", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Payment server running on http://localhost:${PORT}`);
}); 