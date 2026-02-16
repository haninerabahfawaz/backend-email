const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Create transporter ONCE (better performance)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,           // try 587 if 465 fails
  secure: true,        // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 20000, // avoid hanging
});

// Verify SMTP connection at startup
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready");
  }
});

// POST /send endpoint
app.post('/send', async (req, res) => {
  const { fullName, email, message } = req.body;

  if (!fullName || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  try {
    const mailOptions = {
      from: `"${fullName}" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `Contact Form Submission from ${fullName}`,
      html: `
        <p><b>Sender Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully!'
    });

  } catch (error) {
    console.error("SendMail Error:", error);

    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
