import React from 'react';
import { Outlet } from 'react-router';
import EiiSearchContextProvider from './contextapi/eiiSearch/EiiSearchContextProvider';
import NoticeContextProvider from './contextapi/notice/NoticeContextProvider';
import PostContextProvider from './contextapi/post/PostContextProvider';

const MainLayout = () => {
    return (
        // Context for Post
        <PostContextProvider>
            {/* Context for Notice */}
            <NoticeContextProvider>
                {/* Context for Search */}
                <EiiSearchContextProvider>
                    <Outlet />
                </EiiSearchContextProvider>
            </NoticeContextProvider>
        </PostContextProvider>
    );
};

export default MainLayout;