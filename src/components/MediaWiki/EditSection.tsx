import React, { type ReactNode, type FC, type PropsWithChildren } from 'react';

interface EditSectionProps {
  buttons: ReactNode[];
}

export const EditSectionWrapper: FC<PropsWithChildren> = ({ children }) => {
  return <span className='mw-editsection'>{children}</span>;
};

export const BracketStart: FC = () => {
  return <span className='mw-editsection-bracket'>[</span>;
};

export const BracketEnd: FC = () => {
  return <span className='mw-editsection-bracket'>]</span>;
};

export const Divider: FC = () => {
  return <span className='mw-editsection-divider'> | </span>;
};

const EditSection: FC<EditSectionProps> = ({ buttons }) => {
  return (
    <EditSectionWrapper>
      <BracketStart />
      {buttons.map((button, index) => (
        <React.Fragment key={index}>
          {button}
          {index < buttons.length - 1 && <Divider />}
        </React.Fragment>
      ))}
      <BracketEnd />
    </EditSectionWrapper>
  );
};

export default EditSection;
