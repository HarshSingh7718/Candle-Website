import React, { useState } from 'react';
import Profile from './Profile';
import StoreSettings from './StoreSettings';

/**
 * Setting — Tabbed settings page that replaces the old standalone /profile route.
 * Tab 1: "Admin Profile" — Reuses the existing Profile component (with OTP flow).
 * Tab 2: "Store Settings" — Manages delivery and customisation pricing variables.
 */
const TABS = [
    { id: 'profile', label: 'Admin Profile', icon: 'person' },
    { id: 'store', label: 'Store Settings', icon: 'tune' },
];

const Setting = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <main className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full">
            {/* Page Header */}
            <div className="mb-8">
                <h2 className="font-heading text-headline-xl text-on-background mb-2">Settings</h2>
                <p className="font-body-md text-body-md text-text-muted">
                    Manage your profile and store configuration.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-8 bg-bg-canvas rounded-xl p-1.5 w-fit">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                            activeTab === tab.id
                                ? 'bg-bg-surface text-text-base shadow-sm'
                                : 'text-text-muted hover:text-text-base hover:bg-bg-muted/50'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-[20px] ${activeTab === tab.id ? 'fill' : ''}`}>
                            {tab.icon}
                        </span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in duration-300">
                {activeTab === 'profile' && <Profile />}
                {activeTab === 'store' && <StoreSettings />}
            </div>
        </main>
    );
};

export default Setting;
