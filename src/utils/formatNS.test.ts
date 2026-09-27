import { describe, expect, it } from 'vitest';
import { formatNS14, formatNS3 } from './formatNS';

describe('formatNS3（用户讨论名字空间）', () => {
  it.each([
    ['张三', 'User_talk:张三'],
    ['User talk:张三', 'User_talk:张三'],
    ['User_talk:张三', 'User_talk:张三'],
    ['User:张三', 'User_talk:张三'],
    ['U:张三', 'User_talk:张三'],
    ['用户讨论:张三', 'User_talk:张三'],
    ['用戶討論:张三', 'User_talk:张三'],
    ['使用者討論:张三', 'User_talk:张三'],
    ['user:张三', 'User_talk:张三'],
    ['  张三', 'User_talk:张三'],
  ])('%s → %s', (input, expected) => {
    expect(formatNS3(input)).toBe(expected);
  });
});

describe('formatNS14（分类名字空间）', () => {
  it.each([
    ['日本动画', 'Category:日本动画'],
    ['Category:日本动画', 'Category:日本动画'],
    ['CAT:日本动画', 'Category:日本动画'],
    ['分类:日本动画', 'Category:日本动画'],
    ['分類:日本动画', 'Category:日本动画'],
    ['  日本动画', 'Category:日本动画'],
  ])('%s → %s', (input, expected) => {
    expect(formatNS14(input)).toBe(expected);
  });
});
