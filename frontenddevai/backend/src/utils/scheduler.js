const cron = require('node-cron');
const ScraperService = require('../services/ScraperService');

/**
 * Scheduler for automated scraper runs
 */
class Scheduler {
  constructor() {
    this.jobs = [];
    this.scraperService = new ScraperService();
  }

  /**
   * Start the scheduler
   */
  start() {
    console.log('Starting scheduler...');

    // Get default cron schedule from environment or use default
    const defaultSchedule = process.env.SCRAPER_CRON_SCHEDULE || '0 */6 * * *';

    // Schedule the main scraper job
    const mainJob = cron.schedule(defaultSchedule, async () => {
      console.log('\n[SCHEDULED] Running automated scraper update');
      try {
        await this.scraperService.runAllScrapers();
      } catch (error) {
        console.error('Error in scheduled scraper run:', error.message);
      }
    });

    this.jobs.push({
      name: 'main-scraper',
      schedule: defaultSchedule,
      job: mainJob
    });

    console.log(`Scheduler started with cron: ${defaultSchedule}`);
    console.log('Active jobs:', this.jobs.map(j => `${j.name} (${j.schedule})`).join(', '));
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    console.log('Stopping scheduler...');
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`Stopped job: ${name}`);
    });
    this.jobs = [];
  }

  /**
   * Run scrapers manually
   */
  async runNow() {
    console.log('Running scrapers manually...');
    return await this.scraperService.runAllScrapers();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.jobs.length > 0,
      jobs: this.jobs.map(({ name, schedule }) => ({
        name,
        schedule
      })),
      scrapers: this.scraperService.getScraperStatus()
    };
  }
}

module.exports = Scheduler;
