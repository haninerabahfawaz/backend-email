const express = require('express');
const cors = require('cors');
require('dotenv').config();

const SibApiV3Sdk = require('sib-api-v3-sdk');

const app = express();

app.use(cors());
app.use(express.json());

// Brevo API setup
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

// POST /send endpoint
app.post('/send', async (req, res) => {
  const { fullName, email, message } = req.body;

  if (!fullName || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields required"
    });
  }

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = {
    sender: {
      email: process.env.SMTP_USER, // verified sender
      name: fullName
    },
    to: [{
      email: process.env.SMTP_USER // where you receive messages
    }],
    subject: `New message from ${fullName}`,
    htmlContent: `
      <p><b>Sender:</b> ${email}</p>
      <p><b>Message:</b></p>
      <p>${message}</p>
    `
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    res.json({
      success: true,
      message: "Message sent successfully!"
    });

  } catch (error) {
    console.error("Brevo error:", error);
    res.status(500).json({
      success: false,
      message: "Email failed to send"
    });
  }
});

// start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
