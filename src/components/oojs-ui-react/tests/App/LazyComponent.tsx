import React, { lazy, type FC } from 'react';
import type { RouterItem } from '../config/router';

const LazyComponent: FC<{ route: RouterItem }> = ({ route }) => {
  const Component = 'section' in route ? () => '' : lazy(() => route.Component());

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Component />
    </React.Suspense>
  );
};

LazyComponent.displayName = 'LazyComponent';

export default LazyComponent;
