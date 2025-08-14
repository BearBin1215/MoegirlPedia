import React, { type FC } from 'react';
import { Button, ButtonGroup } from 'oojs-ui-react';
import intl from '../../components/intl';

const ButtonPage: FC = () => {
  return (
    <>
      <h1>
        {intl({
          'zh-cn': 'Button - 按钮',
          en: 'Button',
        })}
      </h1>

      <Button flags={[]}>Normal</Button>
      <Button disabled>disabled</Button>

      <h2>
        {intl({
          'zh-cn': '样式',
          en: 'Flags',
        })}
      </h2>
      <p>
        {intl({
          'zh-cn': <>根据<code>flags</code>控制样式。</>,
          en: <>Change style with <code>flags</code>.</>,
        })}
      </p>
      <h3>progressive</h3>
      <Button flags={['progressive']}>progressive</Button>
      <Button flags={['primary', 'progressive']}>primary, progressive</Button>

      <h3>destructive</h3>
      <Button flags={['destructive']}>destructive</Button>
      <Button flags={['primary', 'destructive']}>primary, destructive</Button>

      <h2>{intl({ 'zh-cn': '图标', en: 'With icon' })}</h2>
      <Button icon='edit'>icon=edit</Button>
      <Button icon='check'>icon=check</Button>
      <Button icon='help'>icon=help</Button>
      <Button indicator='clear'>indicator=clear</Button>
      <Button indicator='required'>indicator=required</Button>
      <h2>{intl({ 'zh-cn': '仅图标', en: 'Icon only' })}</h2>
      <Button icon='edit' />
      <Button icon='check' />
      <Button icon='help' />
      <Button indicator='clear' />
      <Button indicator='required' />

      <h2>{intl({ 'zh-cn': '无边框', en: 'Frameless' })}</h2>
      <Button framed={false}>framed=false</Button>
      <Button framed={false} disabled>framed=false, disabled</Button>
      <Button framed={false} flags={['progressive']}>framed=false, progressive</Button>
      <Button framed={false} flags={['destructive']}>framed=false, destructive</Button>

      <h2>AccessKey</h2>
      <p>
        {intl({
          'zh-cn': <><code>accessKey</code>参数可以通过<kbd>alt</kbd>+对应键聚焦到按钮上，然后可以通过回车点击。</>,
          en: <><code>accessKey</code> parameter can be focused to the button with <kbd>alt</kbd>+corresponding key, and then click with <kbd>enter</kbd>.</>,
        })}
      </p>
      <Button accessKey='b'>accessKey=b: <kbd>alt</kbd>+<kbd>B</kbd></Button>
      <Button accessKey='q'>accessKey=q: <kbd>alt</kbd>+<kbd>Q</kbd></Button>

      <h2>ButtonGroup</h2>
      <ButtonGroup
        buttons={[
          { key: 1, children: 'One', icon: 'tag' },
          { key: 2, children: 'Two' },
          { key: 3, children: 'Three', disabled: true },
        ]}
      />
      <h3>disabled</h3>
      <ButtonGroup
        disabled
        buttons={[
          { key: 1, children: 'One', icon: 'tag' },
          { key: 2, children: 'Two' },
          { key: 3, children: 'Three' },
        ]}
      />
    </>
  );
};

ButtonPage.displayName = 'ButtonPage';

export default ButtonPage;
