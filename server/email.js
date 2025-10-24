const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
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
