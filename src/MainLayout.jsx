import React from 'react';
import { Outlet } from 'react-router';
import EiiSearchContextProvider from './contextapi/eiiSearch/EiiSearchContextProvider';
import NoticeContextProvider from './contextapi/notice/NoticeContextProvider';
import PostContextProvider from './contextapi/post/PostContextProvider';
import PostModalContextProvider from './contextapi/postModal/PostModalContextProvider';

const MainLayout = () => {
    return (
        // Context to handle PostModal
        <PostModalContextProvider>
         {/* Context for Post */}
        <PostContextProvider>
            {/* Context for Notice */}
            <NoticeContextProvider>
                {/* Context for Search */}
                <EiiSearchContextProvider>
                    <Outlet />
                </EiiSearchContextProvider>
            </NoticeContextProvider>
        </PostContextProvider>
        </PostModalContextProvider>
    );
};

export default MainLayout;