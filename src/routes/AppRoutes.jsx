import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import MainLayout from '../MainLayout';
import SearchPage from '../pages/searchPage/SearchPage';
import ErrorPage from '../pages/errorPage/ErrorPage';
import Registration from '../pages/registrationPage/Registration';
import HomePage from '../pages/homePage/HomePage';
import HomeComponent from '../sharedComponent/homeComponent/HomeComponent';
import TeacherComponent from '../sharedComponent/teachersComponent/TeacherComponent';

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<MainLayout />}>
                    <Route path='/' element={<SearchPage />} />
                    <Route path='/registration' element={<Registration />} />
                    <Route path='/:id' element={<HomePage />}>
                        <Route path='/:id' element={<HomeComponent />} />
                        <Route path='/:id/teacher' element={<TeacherComponent />} />
                    </Route>
                </Route>
                <Route path='*' element={<ErrorPage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;