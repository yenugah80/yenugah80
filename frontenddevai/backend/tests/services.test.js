const { ValidationService, DeduplicationService } = require('../src/services/ComponentService');

describe('ValidationService', () => {
  test('should validate a valid component', () => {
    const component = {
      name: 'Test Component',
      description: 'This is a test component with enough description text',
      category: 'ui-component',
      source: {
        name: 'github-trending',
        url: 'https://github.com/test/repo'
      }
    };

    const result = ValidationService.validate(component);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject component with short description', () => {
    const component = {
      name: 'Test Component',
      description: 'Too short',
      category: 'ui-component',
      source: {
        name: 'github-trending',
        url: 'https://github.com/test/repo'
      }
    };

    const result = ValidationService.validate(component);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should reject component with invalid category', () => {
    const component = {
      name: 'Test Component',
      description: 'This is a test component with enough description text',
      category: 'invalid-category',
      source: {
        name: 'github-trending',
        url: 'https://github.com/test/repo'
      }
    };

    const result = ValidationService.validate(component);
    expect(result.isValid).toBe(false);
  });
});

describe('DeduplicationService', () => {
  test('should calculate similarity correctly', () => {
    const similarity1 = DeduplicationService.calculateSimilarity('hello', 'hello');
    expect(similarity1).toBe(1);

    const similarity2 = DeduplicationService.calculateSimilarity('hello', 'world');
    expect(similarity2).toBeLessThan(0.5);

    const similarity3 = DeduplicationService.calculateSimilarity('React Component Library', 'React Components Library');
    expect(similarity3).toBeGreaterThan(0.8);
  });

  test('should handle empty strings', () => {
    const similarity = DeduplicationService.calculateSimilarity('', '');
    expect(similarity).toBe(0);
  });

  test('should handle null values', () => {
    const similarity = DeduplicationService.calculateSimilarity(null, 'test');
    expect(similarity).toBe(0);
  });
});
