import React from "react";
import { Button } from '@itg/itg-react-ui';

const ButtonPage: React.FC = () => {
  return (
    <>
      <h1>基本使用</h1>
      <div style={{ gap: '8px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ gap: '8px', display: 'flex', flexWrap: 'wrap' }}>
          <Button>默认按钮</Button>
          <Button type="primary">主要按钮</Button>
          <Button type="success">成功按钮</Button>
          <Button type="danger">危险按钮</Button>
          <Button type="warning">警告按钮</Button>
          <Button type="dashed">虚线按钮</Button>
          <Button type="text">文本按钮</Button>
        </div>
        <div style={{ gap: '8px', display: 'flex', flexWrap: 'wrap' }}>
          <Button round>默认按钮</Button>
          <Button type="primary" round>主要按钮</Button>
          <Button type="success" round>成功按钮</Button>
          <Button type="danger" round>危险按钮</Button>
          <Button type="warning" round>警告按钮</Button>
          <Button type="dashed" round>虚线按钮</Button>
        </div>
        <div style={{ gap: '8px', display: 'flex', flexWrap: 'wrap' }}>
          <Button leftIcon="itg-icon-electronics" />
          <Button type="primary" leftIcon="itg-icon-edit" />
          <Button type="success" leftIcon="itg-icon-add-circle" disabled />
          <Button type="danger" leftIcon="itg-icon-home" disabled />
          <Button type="warning" leftIcon="itg-icon-calendar" />
          <Button type="dashed" leftIcon="itg-icon-upload" />
          <Button type="text" leftIcon="itg-icon-ashbin">删除</Button>
        </div>
      </div>

      <h1>禁用状态</h1>
      <div style={{ gap: '8px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ gap: '8px', display: 'flex', flexWrap: 'wrap' }}>
          <Button disabled>默认按钮</Button>
          <Button type="primary" disabled>主要按钮</Button>
          <Button type="success" disabled>成功按钮</Button>
          <Button type="danger" disabled>危险按钮</Button>
          <Button type="warning" disabled>警告按钮</Button>
          <Button type="dashed" disabled>虚线按钮</Button>
          <Button type="text" disabled>文本按钮</Button>
        </div>
        <div style={{ gap: '8px', display: 'flex', flexWrap: 'wrap' }}>
          <Button round disabled>默认按钮</Button>
          <Button type="primary" round disabled>主要按钮</Button>
          <Button type="success" round disabled>成功按钮</Button>
          <Button type="danger" round disabled>危险按钮</Button>
          <Button type="warning" round disabled>警告按钮</Button>
          <Button type="dashed" round disabled>虚线按钮</Button>
          <Button type="text" round disabled>文本按钮</Button>
        </div>
      </div>

      <h1>不同大小</h1>
      <div style={{ gap: '8px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ gap: '8px', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline' }}>
          <Button>默认大小</Button>
          <Button type="primary">默认大小</Button>
          <Button type="success" size="medium">中等大小</Button>
          <Button type="danger" size="medium">中等大小</Button>
          <Button type="warning" size="small">小型按钮</Button>
          <Button type="dashed" size="mini">超小按钮</Button>
          <Button type="text" size="mini">超小按钮</Button>
        </div>
        <div style={{ gap: '8px', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline' }}>
          <Button round>默认大小</Button>
          <Button type="primary" round>默认大小</Button>
          <Button type="success" round size="medium">中等大小</Button>
          <Button type="danger" round size="medium">中等大小</Button>
          <Button type="warning" round size="small">小型按钮</Button>
          <Button type="dashed" round size="mini">超小按钮</Button>
        </div>
      </div>

      <h1>自定义颜色</h1>
      <div style={{ gap: '8px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ gap: '8px', display: 'flex', flexWrap: 'wrap' }}>
          <Button type="custom" customColor="#9935f5">自定义颜色</Button>
          <Button type="custom" customColor="#1ba7dd">自定义颜色</Button>
          <Button type="custom" round customColor="#d33cc7">自定义颜色</Button>
          <Button type="custom" round customColor="#0008ff" leftIcon="itg-icon-loading1" loading disabled>自定义颜色</Button>
        </div>
      </div>
    </>
  );
};

export default ButtonPage;
