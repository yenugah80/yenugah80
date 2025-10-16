const sourcesConfig = require('../config/sources');
const GitHubTrendingScraper = require('../scrapers/GitHubTrendingScraper');
const DevToScraper = require('../scrapers/DevToScraper');
const RSSFeedScraper = require('../scrapers/RSSFeedScraper');
const { ComponentService } = require('./ComponentService');

/**
 * Service to orchestrate all scrapers and update components
 */
class ScraperService {
  constructor() {
    this.scrapers = this.initializeScrapers();
  }

  /**
   * Initialize all enabled scrapers
   */
  initializeScrapers() {
    const scrapers = [];
    const sources = sourcesConfig.sources;

    // Initialize each enabled scraper
    for (const [sourceKey, config] of Object.entries(sources)) {
      if (!config.enabled) {
        console.log(`Scraper for ${config.name} is disabled`);
        continue;
      }

      let scraper;
      switch (sourceKey) {
        case 'github-trending':
          scraper = new GitHubTrendingScraper(config);
          break;
        case 'dev-to':
          scraper = new DevToScraper(config);
          break;
        case 'css-tricks':
          scraper = new RSSFeedScraper('css-tricks', config);
          break;
        case 'smashing-magazine':
          scraper = new RSSFeedScraper('smashing-magazine', config);
          break;
        default:
          console.warn(`Unknown scraper type: ${sourceKey}`);
          continue;
      }

      scrapers.push({
        key: sourceKey,
        name: config.name,
        scraper: scraper,
        frequency: config.frequency
      });

      console.log(`Initialized scraper: ${config.name}`);
    }

    return scrapers;
  }

  /**
   * Run all scrapers
   */
  async runAllScrapers() {
    console.log('\n=== Starting scraper run ===');
    const startTime = Date.now();
    
    const results = {
      totalFetched: 0,
      totalSaved: 0,
      totalDuplicates: 0,
      totalErrors: 0,
      sources: {}
    };

    for (const { key, name, scraper } of this.scrapers) {
      try {
        console.log(`\nRunning scraper: ${name}`);
        
        // Fetch components from source
        const components = await scraper.scrape();
        results.totalFetched += components.length;
        
        // Process and save each component
        let saved = 0;
        let duplicates = 0;
        let errors = 0;

        for (const component of components) {
          const result = await ComponentService.processComponent(component);
          
          if (result.success) {
            saved++;
          } else if (result.duplicate) {
            duplicates++;
          } else {
            errors++;
          }
        }

        results.totalSaved += saved;
        results.totalDuplicates += duplicates;
        results.totalErrors += errors;
        
        results.sources[key] = {
          fetched: components.length,
          saved: saved,
          duplicates: duplicates,
          errors: errors
        };

        console.log(`${name}: Fetched ${components.length}, Saved ${saved}, Duplicates ${duplicates}, Errors ${errors}`);
      } catch (error) {
        console.error(`Error running scraper ${name}:`, error.message);
        results.sources[key] = {
          error: error.message
        };
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n=== Scraper run completed in ${duration}s ===`);
    console.log(`Total: Fetched ${results.totalFetched}, Saved ${results.totalSaved}, Duplicates ${results.totalDuplicates}, Errors ${results.totalErrors}`);
    
    return results;
  }

  /**
   * Run a specific scraper by key
   */
  async runScraper(sourceKey) {
    const scraperInfo = this.scrapers.find(s => s.key === sourceKey);
    
    if (!scraperInfo) {
      throw new Error(`Scraper not found: ${sourceKey}`);
    }

    console.log(`Running scraper: ${scraperInfo.name}`);
    const components = await scraperInfo.scraper.scrape();
    
    let saved = 0;
    let duplicates = 0;
    let errors = 0;

    for (const component of components) {
      const result = await ComponentService.processComponent(component);
      
      if (result.success) {
        saved++;
      } else if (result.duplicate) {
        duplicates++;
      } else {
        errors++;
      }
    }

    return {
      source: scraperInfo.name,
      fetched: components.length,
      saved: saved,
      duplicates: duplicates,
      errors: errors
    };
  }

  /**
   * Get scraper status
   */
  getScraperStatus() {
    return this.scrapers.map(({ key, name, frequency }) => ({
      key,
      name,
      frequency,
      enabled: true
    }));
  }
}

module.exports = ScraperService;
