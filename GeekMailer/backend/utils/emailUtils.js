const nodemailer = require('nodemailer');

exports.sendEmail = async ({ to, subject, text, attachments = [] }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    html: text,
    attachments: attachments.length ? attachments.map(att => ({
      filename: att.filename,
      path: att.path,
      contentType: att.contentType
    })) : undefined,  // Include attachments if provided
  };

  try {
    // Send the email using nodemailer
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
