const Component = require('../models/Component');
const sourcesConfig = require('../config/sources');

/**
 * Service for component validation
 */
class ValidationService {
  /**
   * Validate a component against configured rules
   */
  static validate(component) {
    const errors = [];
    const config = sourcesConfig.validation;

    // Check required fields
    config.requiredFields.forEach(field => {
      if (!this.getNestedProperty(component, field)) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate description length
    if (component.description) {
      if (component.description.length < config.minDescriptionLength) {
        errors.push(`Description too short (min ${config.minDescriptionLength} characters)`);
      }
      if (component.description.length > config.maxDescriptionLength) {
        errors.push(`Description too long (max ${config.maxDescriptionLength} characters)`);
      }
    }

    // Validate category
    if (component.category && !config.allowedCategories.includes(component.category)) {
      errors.push(`Invalid category: ${component.category}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get nested property from object using dot notation
   */
  static getNestedProperty(obj, path) {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}

/**
 * Service for deduplication
 */
class DeduplicationService {
  /**
   * Calculate similarity between two strings using Levenshtein distance
   */
  static calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();

    if (str1 === str2) return 1;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  static levenshteinDistance(str1, str2) {
    const costs = [];
    for (let i = 0; i <= str1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= str2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[str2.length] = lastValue;
    }
    return costs[str2.length];
  }

  /**
   * Check if component is duplicate of existing components
   */
  static async checkDuplicate(component) {
    try {
      const config = sourcesConfig.deduplication;
      
      // Find existing components with similar names
      const existingComponents = await Component.find({
        isDuplicate: false,
        status: { $ne: 'rejected' }
      });

      for (const existing of existingComponents) {
        // Check name similarity
        const nameSimilarity = this.calculateSimilarity(
          component.name, 
          existing.name
        );

        // Check URL similarity if repository URLs exist
        let urlMatch = false;
        if (component.repository?.url && existing.repository?.url) {
          urlMatch = component.repository.url === existing.repository.url;
        }

        // Check description similarity
        const descSimilarity = this.calculateSimilarity(
          component.description,
          existing.description
        );

        // Determine if it's a duplicate
        if (urlMatch || 
            nameSimilarity >= config.similarityThreshold ||
            (nameSimilarity >= 0.7 && descSimilarity >= config.similarityThreshold)) {
          return {
            isDuplicate: true,
            duplicateOf: existing._id,
            reason: urlMatch ? 'Same repository URL' : 
                   `High similarity (name: ${(nameSimilarity * 100).toFixed(1)}%, desc: ${(descSimilarity * 100).toFixed(1)}%)`
          };
        }
      }

      return {
        isDuplicate: false,
        duplicateOf: null,
        reason: null
      };
    } catch (error) {
      console.error('Error checking for duplicates:', error.message);
      return {
        isDuplicate: false,
        duplicateOf: null,
        reason: null
      };
    }
  }
}

/**
 * Main Component Service
 */
class ComponentService {
  /**
   * Process and save a new component
   */
  static async processComponent(componentData) {
    try {
      // Validate component
      const validation = ValidationService.validate(componentData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Check for duplicates
      const duplicationCheck = await DeduplicationService.checkDuplicate(componentData);
      
      if (duplicationCheck.isDuplicate) {
        console.log(`Skipping duplicate component: ${componentData.name} (${duplicationCheck.reason})`);
        return {
          success: false,
          error: 'Duplicate component',
          duplicate: true
        };
      }

      // Auto-approve from trusted sources if configured
      const approvalConfig = sourcesConfig.approval;
      if (approvalConfig.autoApproveFromTrustedSources && 
          componentData.isTrusted) {
        componentData.status = 'approved';
        componentData.verifiedAt = new Date();
        componentData.verifiedBy = 'auto-approval';
      }

      // Create and save component
      const component = new Component(componentData);
      await component.save();

      return {
        success: true,
        component: component
      };
    } catch (error) {
      console.error('Error processing component:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get components with filters
   */
  static async getComponents(filters = {}) {
    try {
      const query = { isDuplicate: false };

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.trustedOnly) {
        query.isTrusted = true;
      }
      if (filters.category) {
        query.category = filters.category;
      }
      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      const components = await Component.find(query)
        .sort({ 'popularity.score': -1, createdAt: -1 })
        .limit(filters.limit || 50);

      return components;
    } catch (error) {
      console.error('Error fetching components:', error.message);
      throw error;
    }
  }

  /**
   * Approve a component
   */
  static async approveComponent(componentId, verifiedBy) {
    try {
      const component = await Component.findOne({ componentId });
      
      if (!component) {
        throw new Error('Component not found');
      }

      component.status = 'approved';
      component.verifiedBy = verifiedBy;
      component.verifiedAt = new Date();
      
      await component.save();

      return component;
    } catch (error) {
      console.error('Error approving component:', error.message);
      throw error;
    }
  }

  /**
   * Reject a component
   */
  static async rejectComponent(componentId, reason) {
    try {
      const component = await Component.findOne({ componentId });
      
      if (!component) {
        throw new Error('Component not found');
      }

      component.status = 'rejected';
      await component.save();

      return component;
    } catch (error) {
      console.error('Error rejecting component:', error.message);
      throw error;
    }
  }
}

module.exports = {
  ComponentService,
  ValidationService,
  DeduplicationService
};
