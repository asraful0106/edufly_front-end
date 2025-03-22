import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import MainLayout from '../MainLayout';
import SearchPage from '../pages/searchPage/SearchPage';
import ErrorPage from '../pages/errorPage/ErrorPage';

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<MainLayout/>}>
                    <Route path='/' element={<SearchPage />} />
                </Route>
                <Route path='*' element={<ErrorPage/>}/>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;