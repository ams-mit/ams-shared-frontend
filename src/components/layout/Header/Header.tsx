import React from 'react';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { logout } from '@/features/auth/store/authSlice';
import Button from '@/components/ui/Button';
import { LogOut, User as UserIcon } from 'lucide-react';
import './Header.css';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <header className="ams-header">
      <div className="ams-header-left">
        <span className="ams-header-title">Apartment Management System</span>
      </div>

      <div className="ams-header-right">
        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="ams-user-badge">
              <div className="ams-user-avatar">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="ams-user-details">
                <span className="ams-user-name">{user.name}</span>
                <span className="ams-user-role">{user.role}</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => dispatch(logout())}
              leftIcon={<LogOut size={14} />}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="ams-user-badge">
              <UserIcon size={16} color="var(--color-secondary)" />
              <span className="ams-user-name">Guest Mode</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
