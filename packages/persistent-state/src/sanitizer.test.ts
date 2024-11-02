import type { StateTree } from 'pinia';
import { HtmlSanitizer } from 'src/sanitizer';
import { describe, expect, it } from 'vitest';

describe('HtmlSanitizer', () => {
  const sanitizer: HtmlSanitizer<StateTree> = new HtmlSanitizer();

  describe('sanitize()', () => {
    it('should escape HTML tags when called with plain strings', () => {
      const state: StateTree = { content: '<script>alert("xss")</script>' };
      expect(sanitizer.sanitize(state)).toEqual({
        content: '&lt;script&gt;alert("xss")&lt;/script&gt;',
      });
    });

    it('should preserve non-HTML content when called with plain strings', () => {
      const state: StateTree = { text: 'Hello, World!' };
      expect(sanitizer.sanitize(state)).toEqual({ text: 'Hello, World!' });
    });

    it('should sanitize nested strings when called with with nested objects', () => {
      const state: StateTree = {
        nested: {
          html: '<p>test</p>',
          text: 'safe',
        },
      };
      expect(sanitizer.sanitize(state)).toEqual({
        nested: {
          html: '&lt;p&gt;test&lt;/p&gt;',
          text: 'safe',
        },
      });
    });

    it('should preserve non-string types when called with non-string values', () => {
      const state: StateTree = {
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        null: null,
      };
      expect(sanitizer.sanitize(state)).toEqual(state);
    });
  });
});
