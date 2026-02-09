import { TestBed } from '@angular/core/testing';
import { HighlightPipe } from './highlight.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('HighlightPipe', () => {
  let pipe: HighlightPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new HighlightPipe(sanitizer);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should highlight single occurrence', () => {
    // Arrange
    const text = 'Buy milk from store';
    const query = 'milk';

    // Act
    const result = pipe.transform(text, query);

    // Assert
    expect(result.toString()).toContain('<mark class="search-highlight">milk</mark>');
  });

  it('should highlight multiple occurrences case-insensitively', () => {
    // Arrange
    const text = 'Milk is good. Buy milk today and MILK tomorrow';
    const query = 'milk';

    // Act
    const result = pipe.transform(text, query);

    // Assert
    const resultStr = result.toString();
    expect(resultStr).toContain('<mark class="search-highlight">Milk</mark>');
    expect(resultStr).toContain('<mark class="search-highlight">milk</mark>');
    expect(resultStr).toContain('<mark class="search-highlight">MILK</mark>');
  });

  it('should return original text when no query provided', () => {
    // Arrange
    const text = 'Buy milk from store';

    // Act
    const result = pipe.transform(text, '');

    // Assert
    expect(result).toBe(text);
  });

  it('should return original text when query is null or undefined', () => {
    // Arrange
    const text = 'Buy milk from store';

    // Act
    const resultNull = pipe.transform(text, null as any);
    const resultUndefined = pipe.transform(text, undefined as any);

    // Assert
    expect(resultNull).toBe(text);
    expect(resultUndefined).toBe(text);
  });

  it('should escape special regex characters', () => {
    // Arrange
    const text = 'Learn C++ programming';
    const query = 'C++';

    // Act
    const result = pipe.transform(text, query);

    // Assert
    expect(result.toString()).toContain('<mark class="search-highlight">C++</mark>');
  });

  it('should handle empty text', () => {
    // Arrange
    const text = '';
    const query = 'test';

    // Act
    const result = pipe.transform(text, query);

    // Assert
    expect(result).toBe('');
  });

  it('should handle special characters in search', () => {
    // Arrange
    const text = 'Email: user@example.com';
    const query = 'user@example.com';

    // Act
    const result = pipe.transform(text, query);

    // Assert
    expect(result.toString()).toContain('<mark class="search-highlight">user@example.com</mark>');
  });
});
