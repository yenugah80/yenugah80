const BaseScraper = require('./BaseScraper');

/**
 * Scraper for Dev.to articles
 */
class DevToScraper extends BaseScraper {
  constructor(config) {
    super('dev-to', config);
  }

  /**
   * Parse Dev.to API response
   */
  parseArticles(articles) {
    const components = [];

    articles.forEach(article => {
      try {
        // Filter for relevant frontend content
        const tags = article.tag_list || [];
        const relevantTags = ['javascript', 'react', 'vue', 'angular', 'css', 'html', 
                              'frontend', 'webdev', 'ui', 'ux', 'design'];
        
        const hasRelevantTag = tags.some(tag => 
          relevantTags.includes(tag.toLowerCase())
        );

        if (!hasRelevantTag) return;

        // Determine category based on tags and content
        let category = 'best-practice';
        const lowerTitle = article.title.toLowerCase();
        
        if (tags.includes('ui') || lowerTitle.includes('component')) {
          category = 'ui-component';
        } else if (lowerTitle.includes('pattern') || lowerTitle.includes('design pattern')) {
          category = 'pattern';
        }

        components.push({
          name: article.title,
          description: article.description || article.title,
          category: category,
          tags: tags.filter(tag => relevantTags.includes(tag.toLowerCase())),
          url: article.url,
          repository: {
            url: article.url,
            stars: article.positive_reactions_count || 0,
            lastUpdated: new Date(article.published_at)
          }
        });
      } catch (error) {
        console.error('Error parsing Dev.to article:', error.message);
      }
    });

    return components;
  }

  /**
   * Scrape Dev.to articles
   */
  async scrape() {
    try {
      console.log(`Scraping Dev.to: ${this.config.url}`);
      
      // Build API URL with parameters
      const params = new URLSearchParams(this.config.apiParams);
      const apiUrl = `${this.config.url}?${params.toString()}`;
      
      const articles = await this.fetchData(apiUrl);
      const rawComponents = this.parseArticles(articles);
      
      const components = rawComponents.map(raw => this.normalizeComponent(raw));
      
      console.log(`Found ${components.length} relevant Dev.to articles`);
      return components;
    } catch (error) {
      console.error('Error in DevToScraper:', error.message);
      return [];
    }
  }
}

module.exports = DevToScraper;
