import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { closeMenu } from '@/app/store/uiSlice';

export const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isMenuOpen } = useAppSelector((state) => state.ui);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        dispatch(closeMenu());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, dispatch]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        position: 'relative',
        overflowX: 'hidden',
        width: '100%',
      }}
    >
      {/* Dimmed Blur Backdrop Overlay */}
      {isMenuOpen && (
        <div
          onClick={() => dispatch(closeMenu())}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 90,
            animation: 'fadeInOverlay 0.22s ease-out',
            cursor: 'pointer',
          }}
        />
      )}

      {/* Slide-over Off-canvas Navigation Drawer */}
      <Sidebar />

      {/* Header Bar */}
      <Header />

      {/* Main Content Area (Full 100% Width) */}
      <main
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};
