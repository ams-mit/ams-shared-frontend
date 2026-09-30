import { Suspense } from 'react';

import { BrowserRouter, useRoutes } from 'react-router-dom';

import { routes } from './routeConfig';

const RouteTree = () => useRoutes(routes);

export const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<p>Loading…</p>}>
      <RouteTree />
    </Suspense>
  </BrowserRouter>
);
