import { describe, expect, it } from 'vitest';
import {
  flaggedElementClasses,
  getWidgetClassName,
  hasLabel,
  iconElementClasses,
  indicatorElementClasses,
  labelElementClasses,
  mergeInvalidFlag,
  toFlagArray,
  widgetClasses,
  widgetNameClasses,
} from './utils';

/**
 * 类生成模块的契约测试：各mixin贡献器与折叠层的输出即站点上OOUI主题CSS的选择器契约，
 * 逐项对齐原版oojs-ui的类派生规则（见docs/comparison-guide.md共享抽象一节）。
 * 修改任何期望值前先核对原版对应mixin的实现。
 */
describe('widgetClasses（Widget基类贡献）', () => {
  it('缺省输出根类与enabled态', () => {
    expect(widgetClasses({})).toBe('oo-ui-widget oo-ui-widget-enabled');
  });

  it('disabled=false与缺省同为enabled', () => {
    expect(widgetClasses({ disabled: false })).toBe('oo-ui-widget oo-ui-widget-enabled');
  });

  it('disabled=true输出disabled态，与enabled互斥', () => {
    const result = widgetClasses({ disabled: true });
    expect(result).toBe('oo-ui-widget oo-ui-widget-disabled');
    expect(result).not.contain('oo-ui-widget-enabled');
  });
});

describe('iconElementClasses（IconElement mixin贡献）', () => {
  it('icon有值输出oo-ui-iconElement', () => {
    expect(iconElementClasses({ icon: 'help' })).toBe('oo-ui-iconElement');
  });

  it('icon缺省或空串不输出', () => {
    expect(iconElementClasses({})).toBe('');
    expect(iconElementClasses({ icon: '' })).toBe('');
  });
});

describe('indicatorElementClasses（IndicatorElement mixin贡献）', () => {
  it('indicator有值输出oo-ui-indicatorElement', () => {
    expect(indicatorElementClasses({ indicator: 'down' })).toBe('oo-ui-indicatorElement');
  });

  it('indicator缺省不输出', () => {
    expect(indicatorElementClasses({})).toBe('');
  });
});

describe('labelElementClasses（LabelElement mixin贡献）', () => {
  it('有效标签输出oo-ui-labelElement', () => {
    expect(labelElementClasses({ label: '标签' })).toBe('oo-ui-labelElement');
  });

  it('数字0等有效ReactNode视为有标签', () => {
    expect(labelElementClasses({ label: 0 })).toBe('oo-ui-labelElement');
  });

  it.each([undefined, null, false, ''] as const)('label=%p视为无标签', (label) => {
    expect(labelElementClasses({ label })).toBe('');
  });

  it('invisibleLabel时视同无标签（对齐原版setInvisibleLabel的Pretend that there is no label语义）', () => {
    expect(labelElementClasses({ label: '标签', invisibleLabel: true })).toBe('');
  });

  it('invisibleLabel=false不抑制', () => {
    expect(labelElementClasses({ label: '标签', invisibleLabel: false })).toBe('oo-ui-labelElement');
  });
});

describe('flaggedElementClasses（FlaggedElement mixin贡献）', () => {
  it('单个flag输出oo-ui-flaggedElement-{flag}', () => {
    expect(flaggedElementClasses('progressive')).toBe('oo-ui-flaggedElement-progressive');
  });

  it('多flag按序全部输出', () => {
    expect(flaggedElementClasses(['progressive', 'destructive']))
      .toBe('oo-ui-flaggedElement-progressive oo-ui-flaggedElement-destructive');
  });

  it('无flag输出空串', () => {
    expect(flaggedElementClasses()).toBe('');
    expect(flaggedElementClasses([])).toBe('');
  });
});

describe('widgetNameClasses（组件名称类）', () => {
  it('按原版继承链叠加oo-ui-{name}Widget', () => {
    expect(widgetNameClasses('input', 'textInput', 'numberInput'))
      .toBe('oo-ui-inputWidget oo-ui-textInputWidget oo-ui-numberInputWidget');
  });

  it('无名称输出空串', () => {
    expect(widgetNameClasses()).toBe('');
  });
});

describe('getWidgetClassName（折叠层）', () => {
  it('仅基础类：oo-ui-widget + enabled态', () => {
    expect(getWidgetClassName({})).toBe('oo-ui-widget oo-ui-widget-enabled');
  });

  it('折叠各贡献器并保持稳定顺序（mixin类在前、名称类在后）', () => {
    expect(getWidgetClassName(
      { disabled: true, icon: 'help', indicator: 'down', label: '标签' },
      'input',
      'textInput',
    )).toBe(
      'oo-ui-widget oo-ui-widget-disabled oo-ui-iconElement oo-ui-indicatorElement oo-ui-labelElement oo-ui-inputWidget oo-ui-textInputWidget',
    );
  });

  it('invisibleLabel抑制经折叠层同样生效', () => {
    const result = getWidgetClassName({ label: '标签', invisibleLabel: true }, 'button');
    expect(result).not.contain('oo-ui-labelElement');
  });

  it('名称类按继承链叠加（NumberInput三层链）', () => {
    const result = getWidgetClassName({ disabled: true }, 'input', 'textInput', 'numberInput');
    expect(result).toContain('oo-ui-inputWidget oo-ui-textInputWidget oo-ui-numberInputWidget');
    expect(result).toContain('oo-ui-widget-disabled');
  });
});

describe('基础工具（贡献器的依赖）', () => {
  it.each([undefined, null, false, ''] as const)('hasLabel将%p视为无标签', (label) => {
    expect(hasLabel(label)).toBe(false);
  });

  it.each(['x', 0, true] as const)('hasLabel将%p视为有标签', (label) => {
    expect(hasLabel(label)).toBe(true);
  });

  it('toFlagArray归一化字符串/数组/undefined', () => {
    expect(toFlagArray('progressive')).toEqual(['progressive']);
    expect(toFlagArray(['progressive', 'destructive'])).toEqual(['progressive', 'destructive']);
    expect(toFlagArray()).toEqual([]);
  });

  it.each([true, false] as const)('mergeInvalidFlag校验非法时叠加invalid（输入%p）', (invalid) => {
    expect(mergeInvalidFlag(['progressive'], invalid))
      .toEqual(invalid ? ['progressive', 'invalid'] : ['progressive']);
  });

  it('mergeInvalidFlag配置已含invalid时不重复', () => {
    expect(mergeInvalidFlag(['invalid'], true)).toEqual(['invalid']);
  });
});
