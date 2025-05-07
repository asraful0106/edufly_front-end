import React from 'react';
import { Outlet } from 'react-router';
import EiiSearchContextProvider from './contextapi/eiiSearch/EiiSearchContextProvider';
import NoticeContextProvider from './contextapi/notice/NoticeContextProvider';

const MainLayout = () => {
    return (
        // Context for Notice
        <NoticeContextProvider>
            {/* Context for Search */}
            <EiiSearchContextProvider>
                <Outlet />
            </EiiSearchContextProvider>
        </NoticeContextProvider>
    );
};

export default MainLayout;