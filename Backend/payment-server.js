const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Razorpay with your credentials
const razorpay = new Razorpay({
  key_id: "rzp_test_Pts9yxxuweuA1u",
  key_secret: "CrhHrTu8aJa3tyRS4ecWvYi7",
});

// Create order endpoint
app.post("/create-order", async (req, res) => {
  const { amount } = req.body;
  const options = {
    amount: amount * 100, // Convert rupees to paise for Razorpay
    currency: "INR",
    receipt: "order_rcptid_" + Math.random(),
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Error creating order" });
  }
});

// Verify payment endpoint
app.post("/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const key_secret = "CrhHrTu8aJa3tyRS4ecWvYi7";
  
  // Create signature
  const hmac = crypto.createHmac("sha256", key_secret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest("hex");
  
  // Verify signature
  if (generated_signature === razorpay_signature) {
    res.json({ status: "success" });
  } else {
    res.json({ status: "failure" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Payment server running on http://localhost:${PORT}`);
}); 