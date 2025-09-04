import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import MainLayout from '../MainLayout';
import SearchPage from '../pages/searchPage/SearchPage';
import ErrorPage from '../pages/errorPage/ErrorPage';
import Registration from '../pages/registrationPage/Registration';
import HomePage from '../pages/homePage/HomePage';
import HomeComponent from '../sharedComponent/homeComponent/HomeComponent';
import TeacherComponent from '../sharedComponent/teachersComponent/TeacherComponent';
import NoticeComponent from '../sharedComponent/notice/NoticeComponent';
import ContactUsComponent from '../sharedComponent/contactUs/ContactUsComponent';
import DashboardComponent from '../sharedComponent/dashboard/DashboardComponent';
import GalleryCompnent from '../sharedComponent/gallery/GalleryCompnent';
import DashboardComponentChild from '../sharedComponent/dashboardComponent/DashboardComponentChild';
import DashTeacherComponent from '../sharedComponent/dashTeacher/DashTeacherComponent';
import DashStudentComponent from '../sharedComponent/dashStudentCreateAdmin/DashStudentComponent';
import AcademicSetup from '../sharedComponent/academicSetup/AcademicSetup';
import ManageStudent from '../sharedComponent/manageStudent/ManageStudent';
import ResultsPublish from '../sharedComponent/resultPublish/ResultPublish';
import StudenceAttandance from '../sharedComponent/dashAttandence/StudentAttandence';

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
                        <Route path='/:id/notice' element={<NoticeComponent />} />
                        <Route path='/:id/contact-us' element={<ContactUsComponent />} />
                        <Route path='/:id/gallery' element={<GalleryCompnent />} />
                        <Route path='/:id/dashboard' element={<DashboardComponent />}>
                            <Route path='/:id/dashboard' element={<DashboardComponentChild/>}/>
                            <Route path='/:id/dashboard/teacher' element={<DashTeacherComponent/>}/>
                            <Route path='/:id/dashboard/student' element={<DashStudentComponent/>}/>
                            <Route path='/:id/dashboard/academic-setup' element={<AcademicSetup />} />
                            <Route path='/:id/dashboard/manage-tudents' element={<ManageStudent />} />
                            <Route path='/:id/dashboard/publish-result' element={<ResultsPublish />} />
                            <Route path='/:id/dashboard/attandence' element={<StudenceAttandance />} />
                        </Route>
                    </Route>
                </Route>
                <Route path='*' element={<ErrorPage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;