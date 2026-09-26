import React from 'react';
import './MobileFilterTabs.css';

export interface MobileTabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface MobileFilterTabsProps {
  tabs: MobileTabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const MobileFilterTabs: React.FC<MobileFilterTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="ams-mobile-filter-tabs" role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            className={`ams-mobile-filter-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ams-mobile-tab-badge">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
