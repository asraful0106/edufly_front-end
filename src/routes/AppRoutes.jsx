import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import MainLayout from '../MainLayout';
import SearchPage from '../pages/searchPage/SearchPage';

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<MainLayout/>}>
                    <Route path='/' element={<SearchPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;