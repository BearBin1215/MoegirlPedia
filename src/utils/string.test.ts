import { describe, expect, it } from 'vitest';
import { splitList } from './string';

describe('splitList', () => {
  it('按换行分割', () => {
    expect(splitList('页面A\n页面B')).toEqual(['页面A', '页面B']);
  });

  it('过滤空行与纯空白行', () => {
    expect(splitList('页面A\n\n   \n页面B\n')).toEqual(['页面A', '页面B']);
  });

  it('保留条目前后的空白字符', () => {
    expect(splitList(' 页面A \n\t页面B\t')).toEqual([' 页面A ', '\t页面B\t']);
  });

  it('空字符串返回空数组', () => {
    expect(splitList('')).toEqual([]);
  });
});
