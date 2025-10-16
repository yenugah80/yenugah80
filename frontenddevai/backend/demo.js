#!/usr/bin/env node

/**
 * Demo script to showcase FrontendDevAI functionality
 * This script runs a demo without requiring MongoDB
 */

const BaseScraper = require('./src/scrapers/BaseScraper');
const GitHubTrendingScraper = require('./src/scrapers/GitHubTrendingScraper');
const { ValidationService, DeduplicationService } = require('./src/services/ComponentService');

console.log('\n' + '='.repeat(70));
console.log('FrontendDevAI - Automated Component Discovery System Demo');
console.log('='.repeat(70) + '\n');

// Demo 1: Validation Service
console.log('📋 Demo 1: Validation Service\n');

const validComponent = {
  name: 'React UI Components',
  description: 'A comprehensive collection of production-ready React components for modern web applications',
  category: 'ui-component',
  source: {
    name: 'github-trending',
    url: 'https://github.com/example/react-ui'
  }
};

const invalidComponent = {
  name: 'Test',
  description: 'Too short',
  category: 'invalid-type',
  source: {
    name: 'github-trending',
    url: 'https://github.com/example/test'
  }
};

console.log('Testing valid component:');
const validResult = ValidationService.validate(validComponent);
console.log(`  ✅ Valid: ${validResult.isValid}`);
console.log(`  Errors: ${validResult.errors.length === 0 ? 'None' : validResult.errors.join(', ')}\n`);

console.log('Testing invalid component:');
const invalidResult = ValidationService.validate(invalidComponent);
console.log(`  ❌ Valid: ${invalidResult.isValid}`);
console.log(`  Errors: ${invalidResult.errors.join(', ')}\n`);

// Demo 2: Deduplication Service
console.log('🔍 Demo 2: Deduplication Service\n');

const testCases = [
  ['React Component Library', 'React Components Library'],
  ['Vue.js Dashboard', 'Angular Dashboard'],
  ['JavaScript Utilities', 'JavaScript Utils'],
  ['CSS Framework', 'CSS Framework']
];

testCases.forEach(([str1, str2]) => {
  const similarity = DeduplicationService.calculateSimilarity(str1, str2);
  const percentage = (similarity * 100).toFixed(1);
  const icon = similarity >= 0.85 ? '🔴' : similarity >= 0.7 ? '🟡' : '🟢';
  console.log(`${icon} "${str1}" vs "${str2}"`);
  console.log(`   Similarity: ${percentage}% ${similarity >= 0.85 ? '(DUPLICATE)' : ''}\n`);
});

// Demo 3: Data Source Configuration
console.log('🌐 Demo 3: Data Sources Configuration\n');

const sourcesConfig = require('./src/config/sources');
const sources = sourcesConfig.sources;

console.log('Configured data sources:\n');
Object.entries(sources).forEach(([key, config]) => {
  const status = config.enabled ? '✅' : '❌';
  console.log(`${status} ${config.name}`);
  console.log(`   URL: ${config.url}`);
  console.log(`   Frequency: ${config.frequency}`);
  console.log(`   Trusted: ${config.trusted ? 'Yes' : 'No'}`);
  console.log(`   Categories: ${config.categories.join(', ')}\n`);
});

// Demo 4: Sample API Endpoints
console.log('🔌 Demo 4: Available API Endpoints\n');

const endpoints = [
  { method: 'GET', path: '/api/components', desc: 'Get all components (with filters)' },
  { method: 'GET', path: '/api/components/pending', desc: 'Get pending components' },
  { method: 'POST', path: '/api/components/:id/approve', desc: 'Approve a component' },
  { method: 'POST', path: '/api/components/:id/reject', desc: 'Reject a component' },
  { method: 'POST', path: '/api/scraper/run', desc: 'Trigger scraper run' },
  { method: 'GET', path: '/api/scraper/status', desc: 'Get scraper status' },
  { method: 'GET', path: '/api/stats', desc: 'Get statistics' },
  { method: 'GET', path: '/health', desc: 'Health check' }
];

endpoints.forEach(ep => {
  console.log(`  ${ep.method.padEnd(6)} ${ep.path.padEnd(35)} - ${ep.desc}`);
});

// Demo 5: Sample Component Data
console.log('\n📦 Demo 5: Sample Component Structure\n');

const sampleComponent = {
  componentId: 'abc-123-xyz',
  name: 'React Awesome Components',
  description: 'A comprehensive collection of production-ready React components including buttons, forms, modals, and more.',
  category: 'ui-component',
  tags: ['react', 'ui', 'components', 'javascript'],
  source: {
    name: 'github-trending',
    url: 'https://github.com/example/react-awesome',
    fetchedAt: new Date()
  },
  repository: {
    url: 'https://github.com/example/react-awesome',
    stars: 15420,
    forks: 1200,
    lastUpdated: new Date()
  },
  status: 'approved',
  isTrusted: true,
  verifiedBy: 'admin',
  verifiedAt: new Date(),
  popularity: {
    score: 95,
    views: 25000,
    lastCalculated: new Date()
  }
};

console.log(JSON.stringify(sampleComponent, null, 2));

// Demo 6: Workflow Overview
console.log('\n🔄 Demo 6: Update Workflow\n');

const workflow = [
  '1. ⏰ Scheduler triggers scraper run (every 6 hours)',
  '2. 🌐 Scrapers fetch data from multiple sources',
  '3. 📝 Data is parsed and normalized',
  '4. ✅ Components are validated',
  '5. 🔍 Deduplication check performed',
  '6. 💾 Valid components saved to database',
  '7. 📋 Components added to review queue (status: pending)',
  '8. 👤 Admin reviews and approves/rejects',
  '9. 🚀 Approved components visible to users via API'
];

workflow.forEach(step => console.log(`  ${step}`));

console.log('\n' + '='.repeat(70));
console.log('Demo completed! Start the server to see it in action:');
console.log('  1. Setup MongoDB: docker run -d -p 27017:27017 mongo:latest');
console.log('  2. Configure .env file');
console.log('  3. Run: npm start');
console.log('  4. Visit: http://localhost:3000');
console.log('='.repeat(70) + '\n');
