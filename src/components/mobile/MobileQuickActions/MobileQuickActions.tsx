import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, UserPlus, X, Bell } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAppSelector } from '@/app/store/hooks';
import './MobileQuickActions.css';

export const MobileQuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { activeRole } = useAppSelector((state) => state.auth);
  const isStaffOrAdmin = activeRole === 'STAFF' || activeRole === 'ADMIN';

  const handleAction = (route: string) => {
    setIsOpen(false);
    navigate(route);
  };

  return (
    <>
      {/* Backdrop overlay when speed dial is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 74,
          }}
        />
      )}

      <div className="ams-mobile-fab-container">
        {isOpen && (
          <div className="ams-mobile-fab-menu">
            <button
              className="ams-mobile-fab-action-item"
              onClick={() => handleAction(ROUTES.FACILITIES)}
            >
              <span className="ams-mobile-fab-action-label">Book Amenity</span>
              <div className="ams-mobile-fab-action-icon" style={{ color: 'var(--color-accent)' }}>
                <Building2 size={20} />
              </div>
            </button>

            <button
              className="ams-mobile-fab-action-item"
              onClick={() => handleAction(ROUTES.VISITORS)}
            >
              <span className="ams-mobile-fab-action-label">
                {isStaffOrAdmin ? 'Log Visitor' : 'Pre-Register Guest'}
              </span>
              <div className="ams-mobile-fab-action-icon" style={{ color: '#0284C7' }}>
                <UserPlus size={20} />
              </div>
            </button>
          </div>
        )}

        <button
          className={`ams-mobile-fab-main-btn ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          title="Quick Community Actions"
          aria-label="Toggle Quick Actions"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </div>
    </>
  );
};
