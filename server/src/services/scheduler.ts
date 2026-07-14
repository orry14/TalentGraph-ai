import cron from 'node-cron';
import { db, ScheduledReport } from '../db/dbClient.js';
import { fetchExportData, generateCSV } from '../utils/exporter.js';
import { marketAnalysisService } from './marketAnalysis.js';
import { emailService } from './emailService.js';

export const initScheduler = () => {
  console.log('⏰ Initializing Scheduled Reports Cron Job (running every minute)...');
  
  // Runs every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const allReports = await db.getScheduledReports();
      
      const reportsToRun = allReports.filter(r => new Date(r.next_run_at) <= now);
      
      for (const report of reportsToRun) {
        console.log(`[Scheduler] Processing scheduled report: ${report.report_type} for user: ${report.user_id}`);
        
        try {
          const { title, rows } = await fetchExportData(report.report_type, report.filters, {
            id: report.user_id,
            role: 'manager' // Assume manager context for scheduler running
          });
          
          const csvData = generateCSV(rows);
          
          console.log(`✉️ Sending Scheduled Report: "${title}" via Ethereal`);
          for (const email of report.recipient_emails) {
            await emailService.sendDigestEmail(email, {
              title,
              frequency: report.frequency,
              count: rows.length,
              type: report.report_type
            });
          }
          
          // Calculate next run date
          const nextRun = new Date();
          if (report.frequency === 'weekly') {
            nextRun.setDate(nextRun.getDate() + 7);
          } else {
            nextRun.setDate(nextRun.getDate() + 30);
          }
          
          const updatedReport: ScheduledReport = {
            ...report,
            next_run_at: nextRun.toISOString()
          };
          
          await db.saveScheduledReport(updatedReport);
          console.log(`[Scheduler] Updated next_run_at for report ${report.id} to ${nextRun.toISOString()}`);
        } catch (innerErr) {
          console.error(`[Scheduler] Failed to process scheduled report ID ${report.id}:`, innerErr);
        }
      }
    } catch (err) {
      console.error('[Scheduler] Error scanning scheduled reports:', err);
    }
  });

  // Run weekly market analysis on Sunday at midnight
  cron.schedule('0 0 * * 0', async () => {
    try {
      console.log('⏰ [Scheduler] Running weekly market skill analysis...');
      await marketAnalysisService.runMarketAnalysis();
    } catch (err) {
      console.error('[Scheduler] Error running market analysis:', err);
    }
  });
};
