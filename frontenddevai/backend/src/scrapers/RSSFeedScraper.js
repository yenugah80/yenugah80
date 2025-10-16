const BaseScraper = require('./BaseScraper');
const cheerio = require('cheerio');

/**
 * Generic RSS Feed Scraper for CSS-Tricks, Smashing Magazine, etc.
 */
class RSSFeedScraper extends BaseScraper {
  constructor(sourceName, config) {
    super(sourceName, config);
  }

  /**
   * Parse RSS/Atom feed
   */
  parseFeed(xml) {
    const $ = cheerio.load(xml, { xmlMode: true });
    const components = [];

    // Try RSS format first
    let items = $('item');
    
    // If no RSS items, try Atom format
    if (items.length === 0) {
      items = $('entry');
    }

    items.each((index, element) => {
      try {
        const $item = $(element);
        
        // Extract title
        const title = $item.find('title').text().trim();
        
        // Extract description/content
        let description = $item.find('description').text().trim() 
                       || $item.find('summary').text().trim()
                       || $item.find('content').text().trim();
        
        // Clean HTML from description
        const $desc = cheerio.load(description);
        description = $desc.text().trim().substring(0, 500);

        // Extract URL
        const url = $item.find('link').text().trim() 
                 || $item.find('link').attr('href');

        // Extract published date
        const pubDate = $item.find('pubDate').text().trim()
                     || $item.find('published').text().trim()
                     || new Date().toISOString();

        // Filter for frontend-related content
        const lowerTitle = title.toLowerCase();
        const lowerDesc = description.toLowerCase();
        const keywords = ['css', 'javascript', 'html', 'component', 'ui', 'ux', 
                         'frontend', 'web', 'design', 'pattern', 'react', 'vue', 'angular'];
        
        const isRelevant = keywords.some(keyword => 
          lowerTitle.includes(keyword) || lowerDesc.includes(keyword)
        );

        if (!isRelevant || !title || !url) return;

        // Determine category
        let category = 'best-practice';
        if (lowerTitle.includes('component') || lowerTitle.includes('ui')) {
          category = 'ui-component';
        } else if (lowerTitle.includes('pattern')) {
          category = 'pattern';
        }

        // Extract tags from keywords
        const tags = keywords.filter(keyword => 
          lowerTitle.includes(keyword) || lowerDesc.includes(keyword)
        );

        components.push({
          name: title,
          description: description,
          category: category,
          tags: tags,
          url: url,
          repository: {
            url: url,
            lastUpdated: new Date(pubDate)
          }
        });
      } catch (error) {
        console.error('Error parsing RSS feed item:', error.message);
      }
    });

    return components;
  }

  /**
   * Scrape RSS feed
   */
  async scrape() {
    try {
      console.log(`Scraping RSS feed from ${this.sourceName}: ${this.config.url}`);
      const xml = await this.fetchData(this.config.url);
      const rawComponents = this.parseFeed(xml);
      
      const components = rawComponents.map(raw => this.normalizeComponent(raw));
      
      console.log(`Found ${components.length} relevant items from ${this.sourceName}`);
      return components;
    } catch (error) {
      console.error(`Error in RSSFeedScraper for ${this.sourceName}:`, error.message);
      return [];
    }
  }
}

module.exports = RSSFeedScraper;
