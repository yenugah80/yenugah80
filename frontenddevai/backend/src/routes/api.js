const express = require('express');
const { ComponentService } = require('../services/ComponentService');
const ScraperService = require('../services/ScraperService');
const Scheduler = require('../utils/scheduler');

const router = express.Router();
const scraperService = new ScraperService();

/**
 * GET /api/components
 * Get all components with optional filters
 */
router.get('/components', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      trustedOnly: req.query.trustedOnly === 'true',
      category: req.query.category,
      search: req.query.search,
      limit: parseInt(req.query.limit) || 50
    };

    const components = await ComponentService.getComponents(filters);
    
    res.json({
      success: true,
      count: components.length,
      components: components
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/components/pending
 * Get components pending review
 */
router.get('/components/pending', async (req, res) => {
  try {
    const components = await ComponentService.getComponents({
      status: 'pending',
      limit: 100
    });
    
    res.json({
      success: true,
      count: components.length,
      components: components
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/components/:componentId/approve
 * Approve a component
 */
router.post('/components/:componentId/approve', async (req, res) => {
  try {
    const { componentId } = req.params;
    const { verifiedBy } = req.body;

    if (!verifiedBy) {
      return res.status(400).json({
        success: false,
        error: 'verifiedBy is required'
      });
    }

    const component = await ComponentService.approveComponent(componentId, verifiedBy);
    
    res.json({
      success: true,
      component: component
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/components/:componentId/reject
 * Reject a component
 */
router.post('/components/:componentId/reject', async (req, res) => {
  try {
    const { componentId } = req.params;
    const { reason } = req.body;

    const component = await ComponentService.rejectComponent(componentId, reason);
    
    res.json({
      success: true,
      component: component
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/scraper/run
 * Manually trigger scraper run
 */
router.post('/scraper/run', async (req, res) => {
  try {
    const { source } = req.body;

    let results;
    if (source) {
      results = await scraperService.runScraper(source);
    } else {
      results = await scraperService.runAllScrapers();
    }
    
    res.json({
      success: true,
      results: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scraper/status
 * Get scraper status
 */
router.get('/scraper/status', (req, res) => {
  try {
    const status = scraperService.getScraperStatus();
    
    res.json({
      success: true,
      scrapers: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scheduler/status
 * Get scheduler status
 */
router.get('/scheduler/status', (req, res) => {
  try {
    // Get scheduler from app locals (set in index.js)
    const scheduler = req.app.locals.scheduler;
    const status = scheduler ? scheduler.getStatus() : { isRunning: false };
    
    res.json({
      success: true,
      status: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/stats
 * Get statistics about components
 */
router.get('/stats', async (req, res) => {
  try {
    const Component = require('../models/Component');
    
    const stats = await Component.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ],
          bySource: [
            { $group: { _id: '$source.name', count: { $sum: 1 } } }
          ],
          trusted: [
            { $match: { isTrusted: true } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        total: stats[0].total[0]?.count || 0,
        byStatus: stats[0].byStatus,
        byCategory: stats[0].byCategory,
        bySource: stats[0].bySource,
        trusted: stats[0].trusted[0]?.count || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
