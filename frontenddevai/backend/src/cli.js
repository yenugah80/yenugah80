#!/usr/bin/env node

/**
 * CLI tool for FrontendDevAI management
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

async function getComponents(filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_URL}/components?${params}`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching components:', error.message);
  }
}

async function getPending() {
  try {
    const response = await axios.get(`${API_URL}/components/pending`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching pending components:', error.message);
  }
}

async function approveComponent(componentId, verifiedBy) {
  try {
    const response = await axios.post(`${API_URL}/components/${componentId}/approve`, {
      verifiedBy
    });
    console.log('Component approved:', response.data);
  } catch (error) {
    console.error('Error approving component:', error.message);
  }
}

async function rejectComponent(componentId, reason) {
  try {
    const response = await axios.post(`${API_URL}/components/${componentId}/reject`, {
      reason
    });
    console.log('Component rejected:', response.data);
  } catch (error) {
    console.error('Error rejecting component:', error.message);
  }
}

async function runScraper(source = null) {
  try {
    const response = await axios.post(`${API_URL}/scraper/run`, 
      source ? { source } : {}
    );
    console.log('Scraper run results:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error running scraper:', error.message);
  }
}

async function getStats() {
  try {
    const response = await axios.get(`${API_URL}/stats`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching stats:', error.message);
  }
}

async function getStatus() {
  try {
    const [scraperStatus, schedulerStatus] = await Promise.all([
      axios.get(`${API_URL}/scraper/status`),
      axios.get(`${API_URL}/scheduler/status`)
    ]);
    
    console.log('=== Scraper Status ===');
    console.log(JSON.stringify(scraperStatus.data, null, 2));
    console.log('\n=== Scheduler Status ===');
    console.log(JSON.stringify(schedulerStatus.data, null, 2));
  } catch (error) {
    console.error('Error fetching status:', error.message);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'list':
    getComponents({ status: args[1] || 'approved' });
    break;
  case 'pending':
    getPending();
    break;
  case 'approve':
    if (!args[1] || !args[2]) {
      console.error('Usage: cli.js approve <componentId> <verifiedBy>');
    } else {
      approveComponent(args[1], args[2]);
    }
    break;
  case 'reject':
    if (!args[1]) {
      console.error('Usage: cli.js reject <componentId> [reason]');
    } else {
      rejectComponent(args[1], args[2] || 'No reason provided');
    }
    break;
  case 'run':
    runScraper(args[1]);
    break;
  case 'stats':
    getStats();
    break;
  case 'status':
    getStatus();
    break;
  default:
    console.log(`
FrontendDevAI CLI Tool

Usage: node cli.js <command> [options]

Commands:
  list [status]                    List components (default: approved)
  pending                          List pending components
  approve <id> <verifiedBy>        Approve a component
  reject <id> [reason]             Reject a component
  run [source]                     Run scrapers (all or specific source)
  stats                            Show statistics
  status                           Show system status

Environment:
  API_URL                          API endpoint (default: http://localhost:3000/api)

Examples:
  node cli.js list approved
  node cli.js pending
  node cli.js approve abc123 admin
  node cli.js reject xyz789 "Not relevant"
  node cli.js run github-trending
  node cli.js stats
  node cli.js status
`);
}
