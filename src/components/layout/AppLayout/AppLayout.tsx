import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import './AppLayout.css';

export interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="ams-app-layout">
      <Sidebar />
      <div className="ams-app-main">
        <Header />
        <div className="ams-app-body">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
