const cron = require('node-cron');
const ScheduledEmail = require('../models/ScheduledEmail');
const { sendEmail } = require('../utils/emailUtils');
const { scheduleEmailJob } = require('../services/emailService');

const activeJobs = new Map();  
const emailDetails = new Map();  
 
 
const loadAndScheduleActiveEmails = async () => {
    try { 
        const activeEmails = await ScheduledEmail.find({ status: 'repeat' || 'scheduled', active: true });

        if (activeEmails.length === 0) {
            console.log('No active emails found to schedule.');
            return;
        }
 
        for (const email of activeEmails) {
            const { _id, to, subject, text, schedule, status } = email;
            console.log(`Rescheduling email (ID: ${_id})...`);
             
            scheduleEmailJob(_id, to, subject, text, schedule, status);
        }

        console.log('All active emails have been rescheduled.');
    } catch (error) {
        console.error('Error loading and scheduling active emails:', error);
    }
};

module.exports = { loadAndScheduleActiveEmails };
