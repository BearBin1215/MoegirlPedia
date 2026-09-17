import { describe, expect, it } from 'vitest';
import {
  buttonElementClasses,
  flaggedElementClasses,
  getButtonIconClasses,
  getWidgetClassName,
  hasLabel,
  iconElementClasses,
  imageVariantClasses,
  indicatorElementClasses,
  labelElementClasses,
  mergeAriaLabelledBy,
  mergeInvalidFlag,
  optionWidgetClasses,
  pendingElementClasses,
  resolveRequiredIndicator,
  resolveTabIndex,
  resolveTitle,
  toFlagArray,
  widgetClasses,
  widgetNameClasses,
} from './mixins';

/**
 * mixin纯函数层的契约测试：各mixin贡献器与折叠层的输出即站点上OOUI主题CSS的选择器契约，
 * 逐项对齐原版oojs-ui的类派生规则（见docs/comparison-guide.md共享抽象一节）。
 * 修改任何期望值前先核对原版对应mixin的实现。
 */
describe('widgetClasses（Widget基类贡献）', () => {
  it.each([undefined, false] as const)('缺省或disabled=%p输出根类与enabled态', (disabled) => {
    expect(widgetClasses({ disabled })).toBe('oo-ui-widget oo-ui-widget-enabled');
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

describe('buttonElementClasses（ButtonElement mixin贡献）', () => {
  it('缺省输出buttonElement与framed', () => {
    expect(buttonElementClasses({})).toBe('oo-ui-buttonElement oo-ui-buttonElement-framed');
  });

  it('framed=false输出frameless', () => {
    expect(buttonElementClasses({ framed: false })).toBe('oo-ui-buttonElement oo-ui-buttonElement-frameless');
  });

  it('active/pressed输出激活与按压态', () => {
    expect(buttonElementClasses({ active: true, pressed: true }))
      .toBe('oo-ui-buttonElement oo-ui-buttonElement-framed oo-ui-buttonElement-active oo-ui-buttonElement-pressed');
  });

  it('disabled抑制按压类（对齐原版isDisabled下不输出pressed），其余类不受影响', () => {
    expect(buttonElementClasses({ disabled: true, pressed: true, flags: 'primary' }))
      .toBe('oo-ui-buttonElement oo-ui-buttonElement-framed oo-ui-flaggedElement-primary');
  });

  it('多flag按序全部输出（含非image位）', () => {
    expect(buttonElementClasses({ flags: ['progressive', 'primary'] }))
      .toBe('oo-ui-buttonElement oo-ui-buttonElement-framed oo-ui-flaggedElement-progressive oo-ui-flaggedElement-primary');
  });
});

describe('optionWidgetClasses（OptionWidget状态类贡献）', () => {
  it('三个状态均输出（对应原版static三者皆true的形态，如MenuOptionWidget）', () => {
    expect(optionWidgetClasses({ selected: true, highlighted: true, pressed: true }))
      .toBe('oo-ui-optionWidget-selected oo-ui-optionWidget-highlighted oo-ui-optionWidget-pressed');
  });

  it('未置位的状态不输出', () => {
    expect(optionWidgetClasses({ selected: true })).toBe('oo-ui-optionWidget-selected');
    expect(optionWidgetClasses({})).toBe('');
  });

  it('门槛关闭时即使收到状态也不输出（对齐原版static门控：RadioOptionWidget不可高亮/按压）', () => {
    expect(optionWidgetClasses({
      selected: true,
      highlighted: true,
      pressed: true,
      highlightable: false,
      pressable: false,
    })).toBe('oo-ui-optionWidget-selected');
  });

  it('selectable门槛关闭时不输出选中类（对齐原版static门控：MenuSectionOptionWidget不可选）', () => {
    expect(optionWidgetClasses({ selected: true, selectable: false })).toBe('');
  });
});

describe('pendingElementClasses（PendingElement mixin贡献）', () => {
  it('pending为真输出pending类', () => {
    expect(pendingElementClasses(true)).toBe('oo-ui-pendingElement-pending');
  });

  it('false或缺省不输出', () => {
    expect(pendingElementClasses(false)).toBe('');
    expect(pendingElementClasses(undefined)).toBe('');
  });
});

describe('imageVariantClasses（image变体类）', () => {
  it('ICON_FLAGS全集逐位输出image类', () => {
    expect(imageVariantClasses(['progressive', 'destructive', 'invert', 'error', 'warning', 'success']))
      .toBe('oo-ui-image-progressive oo-ui-image-destructive oo-ui-image-invert oo-ui-image-error oo-ui-image-warning oo-ui-image-success');
  });

  it('保持入参次序', () => {
    expect(imageVariantClasses(['success', 'progressive']))
      .toBe('oo-ui-image-success oo-ui-image-progressive');
  });

  it('非image变体位不产生类（ButtonFlag的primary/safe/back/close、Message的notice）', () => {
    expect(imageVariantClasses(['primary', 'safe', 'back', 'close'])).toBe('');
    expect(imageVariantClasses(['notice'])).toBe('');
  });
});

describe('getButtonIconClasses（按钮内图标/指示器变体）', () => {
  it('边框按钮在激活、禁用或primary时整体反色（invert）', () => {
    expect(getButtonIconClasses({ framed: true, active: true, flags: [] })).toBe('oo-ui-image-invert');
    expect(getButtonIconClasses({ framed: true, disabled: true, flags: [] })).toBe('oo-ui-image-invert');
    expect(getButtonIconClasses({ framed: true, flags: ['primary'] })).toBe('oo-ui-image-invert');
  });

  it('无边框按钮禁用时不出变体', () => {
    expect(getButtonIconClasses({ framed: false, disabled: true, flags: ['progressive'] })).toBe('');
  });

  it('其余按标志叠加image变体（无边框非禁用同样出变体），非image位不产生类', () => {
    expect(getButtonIconClasses({ framed: true, flags: ['progressive', 'destructive'] }))
      .toBe('oo-ui-image-progressive oo-ui-image-destructive');
    expect(getButtonIconClasses({ framed: true, flags: ['safe', 'close'] })).toBe('');
    expect(getButtonIconClasses({ framed: false, flags: ['progressive'] })).toBe('oo-ui-image-progressive');
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
});

describe('resolveTabIndex（TabIndexedElement mixin）', () => {
  it('disabled覆盖显式值（原版Do not index over disabled elements）', () => {
    expect(resolveTabIndex(3, true)).toBe(-1);
    expect(resolveTabIndex(undefined, true)).toBe(-1);
  });

  it('启用时取显式值，缺省0', () => {
    expect(resolveTabIndex(3, false)).toBe(3);
    expect(resolveTabIndex(undefined, false)).toBe(0);
    expect(resolveTabIndex(undefined, undefined)).toBe(0);
  });
});

describe('mergeAriaLabelledBy（LabelElement的setLabelledBy通道）', () => {
  it('多个来源以空格并列', () => {
    expect(mergeAriaLabelledBy('a', 'b')).toBe('a b');
  });

  it('缺省项被剔除，全部为空时返回undefined', () => {
    expect(mergeAriaLabelledBy(undefined, 'b')).toBe('b');
    expect(mergeAriaLabelledBy(undefined, undefined)).toBeUndefined();
  });
});

describe('resolveRequiredIndicator（RequiredElement mixin）', () => {
  it('显式indicator优先（原版只在当前指示器是对应位时才改写）', () => {
    expect(resolveRequiredIndicator('down', true)).toBe('down');
    expect(resolveRequiredIndicator('clear', false)).toBe('clear');
  });

  it('未声明indicator且required时回退required指示器', () => {
    expect(resolveRequiredIndicator(undefined, true)).toBe('required');
  });

  it('未声明indicator且非required时无指示器', () => {
    expect(resolveRequiredIndicator(undefined, false)).toBeUndefined();
    expect(resolveRequiredIndicator(undefined, undefined)).toBeUndefined();
  });
});

describe('resolveTitle（TitledElement + AccessKeyedElement mixin）', () => {
  it('显式title原样输出', () => {
    expect(resolveTitle({ title: '删除' })).toBe('删除');
  });

  it('未给title且标签不可见时以字符串label兜底（原版invisibleLabel的fallback title）', () => {
    expect(resolveTitle({ label: '删除', invisibleLabel: true })).toBe('删除');
  });

  it('标签可见或label非字符串时不兜底', () => {
    expect(resolveTitle({ label: '删除', invisibleLabel: false })).toBeUndefined();
    expect(resolveTitle({ label: 0, invisibleLabel: true })).toBeUndefined();
  });

  it('title非空且存在accessKey时附加快捷键提示（原版formatTitleWithAccessKey）', () => {
    expect(resolveTitle({ title: '删除', accessKey: 'd' })).toBe('删除 [d]');
    expect(resolveTitle({ label: '删除', invisibleLabel: true, accessKey: 'd' })).toBe('删除 [d]');
  });

  it('无title时即使有accessKey也不输出', () => {
    expect(resolveTitle({ accessKey: 'd' })).toBeUndefined();
  });

  it('空串title照原样输出（对齐原版setTitle的title=""），并参与键位后缀', () => {
    expect(resolveTitle({ title: '' })).toBe('');
    expect(resolveTitle({ title: '', accessKey: 'd' })).toBe(' [d]');
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
