import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { AppRouter } from './router/AppRouter';
import { SessionRestorer } from '@/features/auth/components/SessionRestorer';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <SessionRestorer />
      <AppRouter />
    </Provider>
  );
};

export default App;
