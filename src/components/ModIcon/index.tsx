import React, { type FC } from 'react';
import Approved from './Approved.svg';
import Rejected from './Rejected.svg';
import Pending from './Pending.svg';

export type ModerationStatus = 0 | 1 | 2 | 3 | 4;

interface ModIconProps {
  status: ModerationStatus;
}

const ModIcon: FC<ModIconProps> = ({ status }) => {
  switch (status) {
    case 1:
      return (
        <i className='mod-icon' title='Approved'>
          <Approved />
        </i>
      );
    case 2:
      return (
        <i className='mod-icon' title='Rejected'>
          <Rejected />
        </i>
      );
    default:
      return (
        <i className='mod-icon' title='Pending'>
          <Pending />
        </i>
      );
  }
};

export default ModIcon;
