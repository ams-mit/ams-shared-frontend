import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './routeConfig';
import LoadingState from '@/components/feedback/LoadingState';

export const AppRouter: React.FC = () => {
  const element = useRoutes(routes);

  return (
    <Suspense fallback={<LoadingState message="Loading module..." size="lg" />}>
      {element}
    </Suspense>
  );
};

export default AppRouter;
