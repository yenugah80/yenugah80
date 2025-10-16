const axios = require('axios');
const cheerio = require('cheerio');
const { v4: uuidv4 } = require('uuid');

/**
 * Base Scraper class with common functionality
 */
class BaseScraper {
  constructor(sourceName, config) {
    this.sourceName = sourceName;
    this.config = config;
  }

  /**
   * Fetch data from a URL
   */
  async fetchData(url, options = {}) {
    try {
      const response = await axios.get(url, {
        timeout: parseInt(process.env.SCRAPER_TIMEOUT || 30000),
        headers: {
          'User-Agent': 'FrontendDevAI-ComponentDiscovery/1.0',
          ...options.headers
        },
        ...options
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate a unique component ID
   */
  generateComponentId(name, sourceUrl) {
    return uuidv4();
  }

  /**
   * Normalize component data
   */
  normalizeComponent(rawData) {
    return {
      componentId: this.generateComponentId(rawData.name, rawData.url),
      name: rawData.name,
      description: rawData.description || '',
      category: rawData.category || 'ui-component',
      tags: rawData.tags || [],
      source: {
        name: this.sourceName,
        url: rawData.url,
        fetchedAt: new Date()
      },
      repository: rawData.repository || {},
      status: 'pending',
      isTrusted: this.config.trusted || false
    };
  }

  /**
   * Abstract method to be implemented by subclasses
   */
  async scrape() {
    throw new Error('scrape() method must be implemented by subclass');
  }
}

module.exports = BaseScraper;
