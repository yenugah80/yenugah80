const BaseScraper = require('./BaseScraper');
const cheerio = require('cheerio');

/**
 * Scraper for GitHub Trending repositories
 */
class GitHubTrendingScraper extends BaseScraper {
  constructor(config) {
    super('github-trending', config);
  }

  /**
   * Parse GitHub Trending page
   */
  parseTrendingPage(html) {
    const $ = cheerio.load(html);
    const components = [];

    $('article.Box-row').each((index, element) => {
      try {
        const $article = $(element);
        
        // Extract repository name and URL
        const repoLink = $article.find('h2 a').attr('href');
        const repoName = $article.find('h2 a').text().trim().replace(/\s+/g, ' ');
        
        if (!repoLink || !repoName) return;

        // Extract description
        const description = $article.find('p').text().trim() || 'No description available';

        // Extract stars
        const starsText = $article.find('svg.octicon-star').parent().text().trim();
        const stars = parseInt(starsText.replace(/,/g, '')) || 0;

        // Extract language/tags
        const language = $article.find('[itemprop="programmingLanguage"]').text().trim();
        const tags = language ? [language.toLowerCase()] : [];

        // Determine category based on repository characteristics
        let category = 'library';
        const lowerName = repoName.toLowerCase();
        const lowerDesc = description.toLowerCase();
        
        if (lowerName.includes('ui') || lowerDesc.includes('component') || lowerDesc.includes('ui')) {
          category = 'ui-component';
        } else if (lowerName.includes('framework') || lowerDesc.includes('framework')) {
          category = 'framework';
        }

        components.push({
          name: repoName,
          description: description,
          category: category,
          tags: tags,
          url: `https://github.com${repoLink}`,
          repository: {
            url: `https://github.com${repoLink}`,
            stars: stars,
            lastUpdated: new Date()
          }
        });
      } catch (error) {
        console.error('Error parsing GitHub trending item:', error.message);
      }
    });

    return components;
  }

  /**
   * Scrape GitHub Trending
   */
  async scrape() {
    try {
      console.log(`Scraping GitHub Trending: ${this.config.url}`);
      const html = await this.fetchData(this.config.url);
      const rawComponents = this.parseTrendingPage(html);
      
      const components = rawComponents.map(raw => this.normalizeComponent(raw));
      
      console.log(`Found ${components.length} trending repositories`);
      return components;
    } catch (error) {
      console.error('Error in GitHubTrendingScraper:', error.message);
      return [];
    }
  }
}

module.exports = GitHubTrendingScraper;
