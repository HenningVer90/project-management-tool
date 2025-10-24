const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter;

// Check if we should use real Gmail or mock emails
const USE_MOCK_EMAIL = process.env.USE_MOCK_EMAIL === 'true' || !process.env.EMAIL_PASSWORD;

if (!USE_MOCK_EMAIL) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

const sendEmail = async (to, subject, html) => {
  try {
    // If mocking emails, just log them
    if (USE_MOCK_EMAIL) {
      console.log('\n===============================================');
      console.log('📧 MOCK EMAIL (Not Actually Sent)');
      console.log('===============================================');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Body:', html);
      console.log('===============================================\n');
      return true;
    }

    // Check if email config is set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not configured. Using mock email mode.');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    };

    console.log('Attempting to send email to:', to);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email to', to, ':', error.message);
    console.log('\n⚠️  Email sending failed. To use real emails:');
    console.log('   1. Enable 2FA on your Gmail account');
    console.log('   2. Generate an App Password at: https://myaccount.google.com/apppasswords');
    console.log('   3. Update your .env file with the 16-character App Password');
    console.log('   4. Set USE_MOCK_EMAIL=false in your .env');
    console.log('\nFor now, emails are being logged to console.\n');
    return false;
  }
};

const emailTemplates = {
  projectCreated: (projectName, userName) => `
    <h2>New Project Created</h2>
    <p>Hi ${userName},</p>
    <p>A new project <strong>${projectName}</strong> has been created.</p>
    <p>Log in to the Project Management Tool to view and manage your projects.</p>
  `,

  taskCreated: (projectName, taskName, userName) => `
    <h2>New Task Created</h2>
    <p>Hi ${userName},</p>
    <p>A new task <strong>${taskName}</strong> has been created in project <strong>${projectName}</strong>.</p>
  `,

  itemCreated: (projectName, taskName, itemName, userName) => `
    <h2>New Item Created</h2>
    <p>Hi ${userName},</p>
    <p>A new item <strong>${itemName}</strong> has been added to task <strong>${taskName}</strong> in project <strong>${projectName}</strong>.</p>
  `,

  itemCompleted: (projectName, taskName, itemName, userName) => `
    <h2>Item Marked as Done</h2>
    <p>Hi ${userName},</p>
    <p>Item <strong>${itemName}</strong> in task <strong>${taskName}</strong> (project <strong>${projectName}</strong>) has been marked as done.</p>
  `,

  projectClosed: (projectName, userName) => `
    <h2>Project Closed</h2>
    <p>Hi ${userName},</p>
    <p>Project <strong>${projectName}</strong> has been closed.</p>
    <p>View the project details in the Project Management Tool.</p>
  `,
};

module.exports = {
  sendEmail,
  emailTemplates,
};
