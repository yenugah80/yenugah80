/**
 * Configuration for component data sources
 * Each source defines how to fetch and parse frontend component data
 */

module.exports = {
  sources: {
    'github-trending': {
      enabled: process.env.ENABLE_GITHUB_TRENDING === 'true',
      name: 'GitHub Trending',
      url: 'https://github.com/trending/javascript',
      frequency: '0 */6 * * *', // Every 6 hours
      trusted: true,
      categories: ['library', 'framework', 'ui-component'],
      parser: 'githubTrendingParser'
    },
    
    'dev-to': {
      enabled: process.env.ENABLE_DEV_TO === 'true',
      name: 'Dev.to',
      url: 'https://dev.to/api/articles',
      apiParams: {
        tag: 'webdev',
        per_page: 30,
        top: 7
      },
      frequency: '0 */12 * * *', // Every 12 hours
      trusted: true,
      categories: ['pattern', 'best-practice'],
      parser: 'devToParser'
    },
    
    'css-tricks': {
      enabled: process.env.ENABLE_CSS_TRICKS === 'true',
      name: 'CSS-Tricks',
      url: 'https://css-tricks.com/feed/',
      frequency: '0 0 */2 * *', // Every 2 days
      trusted: true,
      categories: ['pattern', 'ui-component', 'best-practice'],
      parser: 'rssFeedParser'
    },
    
    'smashing-magazine': {
      enabled: process.env.ENABLE_SMASHING_MAGAZINE === 'true',
      name: 'Smashing Magazine',
      url: 'https://www.smashingmagazine.com/feed/',
      frequency: '0 0 */2 * *', // Every 2 days
      trusted: true,
      categories: ['pattern', 'best-practice', 'ui-component'],
      parser: 'rssFeedParser'
    }
  },
  
  // Deduplication configuration
  deduplication: {
    similarityThreshold: 0.85, // 85% similarity threshold
    checkFields: ['name', 'description', 'repository.url']
  },
  
  // Validation rules
  validation: {
    minDescriptionLength: 20,
    maxDescriptionLength: 500,
    requiredFields: ['name', 'description', 'source'],
    allowedCategories: ['ui-component', 'pattern', 'library', 'framework', 'tool', 'best-practice']
  },
  
  // Approval workflow
  approval: {
    requireAdminApproval: process.env.REQUIRE_ADMIN_APPROVAL === 'true',
    autoApproveFromTrustedSources: process.env.AUTO_APPROVE_FROM_TRUSTED_SOURCES === 'true',
    trustedSources: ['github-trending', 'css-tricks', 'smashing-magazine']
  }
};
