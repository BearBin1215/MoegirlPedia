import React, { type ReactNode, type PropsWithChildren } from 'react';

interface EditSectionProps {
  buttons: ReactNode[];
}

export function EditSectionWrapper({ children }: PropsWithChildren) {
  return <span className='mw-editsection'>{children}</span>;
}

export function BracketStart() {
  return <span className='mw-editsection-bracket'>[</span>;
}

export function BracketEnd() {
  return <span className='mw-editsection-bracket'>]</span>;
}

export function Divider() {
  return <span className='mw-editsection-divider'> | </span>;
}

function EditSection({ buttons }: EditSectionProps) {
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
}

export default EditSection;
