import React, { lazy } from 'react';
import type { RouterItem } from '../config/router';

function LazyComponent({ route }: { route: RouterItem }) {
  const Component = 'section' in route ? () => '' : lazy(() => route.Component());

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Component />
    </React.Suspense>
  );
}

LazyComponent.displayName = 'LazyComponent';

export default LazyComponent;
