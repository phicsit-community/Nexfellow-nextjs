const cron = require('node-cron');
const Admin = require('../models/Admin');
const ScheduledEmail = require('../models/ScheduledEmail');
const { sendEmail } = require('../utils/emailUtils');
const activeJobs = new Map();  
const emailDetails = new Map(); 
 
const scheduleEmailJob = (emailId, to, subject, text, cronExpression, status, attachments) => {
    if (activeJobs.has(emailId)) {
        throw new Error('Email is already scheduled.');
    }

    console.log(`Scheduling email to: ${to} at ${cronExpression}, Status: ${status}`);

    const job = cron.schedule(cronExpression, async () => {
        try {
            await sendEmail({ to, subject, text, attachments });
            console.log(`Email sent: ${emailId}`);

            if (status === 'scheduled') {
                await ScheduledEmail.updateOne(
                    { _id: emailId },
                    { status: 'sent', active: false }
                );
                job.stop(); // Stop the cron job after execution
                activeJobs.delete(emailId);
                emailDetails.delete(emailId);
            }
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    activeJobs.set(emailId, job);
    emailDetails.set(emailId, { to, subject, text, cronExpression, attachments });
};
 
const sendImmediateEmail = async (adminId, to, subject, text, attachments = []) => {
    console.log(`Sending email immediately to: ${to}`);
  
    await sendEmail({ to, subject, text, attachments });
  
    const email = new ScheduledEmail({
      adminId,
      to,
      subject,
      text,
      schedule: 'immediate',
      active: 'false',
      status: 'sent',
      attachments 
    });
  
    await email.save(); 
    console.log('Email details saved to the database.');
  
    return { to, subject, text, status: 'sent', attachments };
};

const scheduleEmail = async (adminId, to, subject, text, cronExpression, status = 'scheduled', attachments = []) => {
    
    const newEmail = new ScheduledEmail({
        adminId,
        to: Array.isArray(to) ? to : [to], 
        subject,
        text,
        schedule: cronExpression,
        status,
        active: status === 'scheduled' || status === 'repeat',
        attachments
    });

    const savedEmail = await newEmail.save();

    scheduleEmailJob(savedEmail._id, to, subject, text, cronExpression, status, attachments);

    return savedEmail;
};

 
const getEmailById = async (id) => {
    const details = await ScheduledEmail.findById(id);
    if (details) {
        return details;
    } else {
        throw new Error('No such scheduled email.');
    }
};
 
const getEmailsByAdminId = async (adminId) => {
    const emails = await ScheduledEmail.find({ adminId });
    if (emails.length > 0) {
        return emails;
    } else {
        throw new Error('No emails found for this admin.');
    }
};

const getEmailsByAdminIdCount = async (adminId) => {
    const emails = await ScheduledEmail.find({ adminId });
    return emails.length;
};
 
const getAllActiveJobs = async () => {
    const jobs = Array.from(activeJobs.keys());
    if (jobs.length > 0) {
        return jobs.map(id => ({ id, details: emailDetails.get(id) }));
    } else {
        throw new Error('No active jobs found.');
    }
};

const getAllActiveJobsCount = async () => {
    const jobs = Array.from(activeJobs.keys());
    return jobs.map(id => ({ id, details: emailDetails.get(id) })).length;
};

// Service to get all emails
const getAllEmails = async () => {
    return await ScheduledEmail.find();  // This fetches all emails from the database
};

// Service to delete an email by ID
const deleteEmailByIdService = async (id) => {
    const email = await ScheduledEmail.findById(id);
    if (!email) {
        throw new Error('Email not found');
    }

    // Remove the scheduled job if it exists
    const job = activeJobs.get(id);
    if (job) {
        job.stop();
        activeJobs.delete(id);
        emailDetails.delete(id);
    }

    // Delete the email from the database
    await ScheduledEmail.findByIdAndDelete(id);
};

// Service function to mark an email job as inactive
const markEmailAsInactive = async (id) => {

  try {
    // Find the email in the database
    const email = await ScheduledEmail.findById(id);


    if (!email) {
        throw new Error('Email not found.');
    }

    // Check if the email is already inactive
    if (!email.active) {
        throw new Error('Email is already inactive.');
    }

    // Mark the email as inactive in the database
    email.active = false;
    email.status = 'inactive'; // Optionally update the status as well
    await email.save();


    // Check if there is an active job for this email and remove it
    const job = activeJobs.get(id);

    if (job) {
        job.stop();  // Stop the cron job
        activeJobs.delete(id);  // Remove the job from activeJobs map
        emailDetails.delete(id);
        console.log(`Job for email ID ${id} has been stopped and marked as inactive.`);
    }

    return { message: 'Email job marked as inactive.' };
} catch (error) {
    throw new Error(error.message);
}
};

module.exports = {
    scheduleEmailJob,
    scheduleEmail,
    sendImmediateEmail,
    getEmailById,
    getEmailsByAdminId,
    getEmailsByAdminIdCount,
    getAllActiveJobs,
    getAllActiveJobsCount,
    getAllEmails,
    deleteEmailByIdService,
    markEmailAsInactive,
};