// src/utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove HTML tags and potentially malicious content
  const sanitized = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [] // No attributes allowed
  });
  
  // Additional cleanup for movie titles
  return sanitized
    .trim()
    .replace(/[<>]/g, '') // Remove any remaining angle brackets
    .substring(0, 200); // Limit length to prevent abuse
}

/**
 * Validate movie title format
 */
export function validateMovieTitle(title: string): boolean {
  if (!title || title.length < 1 || title.length > 200) {
    return false;
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /data:/i
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(title));
}
