import React, { lazy, type FC } from 'react';
import type { RouterItem } from '../config/router';

const LazyComponent: FC<{ route: RouterItem }> = ({ route }) => {
  const Component = lazy(() => route.Component());

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <title>{`${route.title} - oojs-ui-react`}</title>
      <Component />
    </React.Suspense>
  );
};

export default LazyComponent;
