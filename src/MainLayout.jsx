import React from 'react';
import { Outlet } from 'react-router';
import EiiSearchContextProvider from './contextapi/eiiSearch/EiiSearchContextProvider';

const MainLayout = () => {
    return (
        <EiiSearchContextProvider>
            <Outlet/>
        </EiiSearchContextProvider>
    );
};

export default MainLayout;