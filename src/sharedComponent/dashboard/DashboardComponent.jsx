// src/pages/dashboard/DashboardComponent.jsx
import React, { useContext } from 'react';
import './Dashboard.css';
import { NavLink, Outlet, useLocation } from 'react-router-dom'; // <-- fix
import { FaChalkboardTeacher } from "react-icons/fa";
import EiiContext from '../../contextapi/eiiSearch/EiiSearchContext';
import { PiStudent } from "react-icons/pi";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { MdManageAccounts } from "react-icons/md";
import { MdOutlinePublishedWithChanges } from "react-icons/md";
import { BsFileSpreadsheetFill } from "react-icons/bs";
import { FcAcceptDatabase } from "react-icons/fc";
import { useAuth } from '../../contextapi/AuthContext'; // <-- uses profile.role, institution_eiin

const DashboardComponent = () => {
    const { data } = useContext(EiiContext);
    const { profile } = useAuth();
    const currentLocation = useLocation();

    const role = profile?.role || JSON.parse(localStorage.getItem('edufly_profile') || '{}')?.role || null;
    const institutionEIIN =
        profile?.institution_eiin ||
        JSON.parse(localStorage.getItem('edufly_profile') || '{}')?.institution_eiin ||
        data?.eiin ||
        '';

    const isActiveExact = (re) => re.test(currentLocation?.pathname?.toString() || '');
    const contains = (segment) => (currentLocation?.pathname?.toString() || '').includes(segment);

    return (
        <div>
            <div className="container max-w-screen h-full">
                <div className="main-container min-h-screen">
                    <Outlet />
                </div>

                {/* Side Bar */}
                <div className="side-navigation h-full">
                    <aside
                        id="default-sidebar"
                        className="h-full transition-transform -translate-x-full sm:translate-x-0"
                        aria-label="Sidebar"
                    >
                        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-800">
                            <ul className="space-y-2 font-medium">

                                {/* ==================== Admin (Institution) ==================== */}
                                {role === 'institution' && (
                                    <>
                                        {/* Dashboard */}
                                        <li>
                                            <NavLink
                                                to={`/${institutionEIIN}/dashboard`}
                                                className={`flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group ${isActiveExact(/^\/[^/]+\/dashboard$/) ? 'bg-gray-700' : ''
                                                    }`}
                                            >
                                                <svg
                                                    className={`w-5 h-5 text-gray-500 transition duration-75 group-hover:text-white ${contains('dashboard') ? 'text-white' : ''
                                                        }`}
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="currentColor"
                                                    viewBox="0 0 22 21"
                                                >
                                                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                                                </svg>
                                                <span className="ms-3">Dashboard</span>
                                            </NavLink>
                                        </li>

                                        {/* Teacher */}
                                        <li>
                                            <NavLink
                                                to={`/${institutionEIIN}/dashboard/teacher`}
                                                className={`flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group ${contains('teacher') ? 'bg-gray-700' : ''
                                                    }`}
                                            >
                                                <FaChalkboardTeacher
                                                    className={`w-5 h-5 text-gray-500 transition duration-75 group-hover:text-white ${contains('teacher') ? 'text-white' : ''
                                                        }`}
                                                />
                                                <span className="flex-1 ms-3 whitespace-nowrap">Teacher</span>
                                            </NavLink>
                                        </li>

                                        {/* Student */}
                                        <li>
                                            <NavLink
                                                to={`/${institutionEIIN}/dashboard/student`}
                                                className={`flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group ${contains('student') ? 'bg-gray-700' : ''
                                                    }`}
                                            >
                                                <PiStudent
                                                    className={`w-5 h-5 text-gray-500 transition duration-75 group-hover:text-white ${contains('student') ? 'text-white' : ''
                                                        }`}
                                                />
                                                <span className="flex-1 ms-3 whitespace-nowrap">Student</span>
                                            </NavLink>
                                        </li>

                                        {/* Academic Setup */}
                                        <li>
                                            <NavLink
                                                to={`/${institutionEIIN}/dashboard/academic-setup`}
                                                className={`flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group ${contains('academic-setup') ? 'bg-gray-700' : ''
                                                    }`}
                                            >
                                                <HiOutlineAcademicCap
                                                    className={`w-5 h-5 text-gray-500 transition duration-75 group-hover:text-white ${contains('academic-setup') ? 'text-white' : ''
                                                        }`}
                                                />
                                                <span className="flex-1 ms-3 whitespace-nowrap">Academic Setup</span>
                                            </NavLink>
                                        </li>

                                        {/* Manage Student */}
                                        <li>
                                            <NavLink
                                                to={`/${institutionEIIN}/dashboard/manage-tudents`}
                                                className={`flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group ${contains('manage-tudents') ? 'bg-gray-700' : ''
                                                    }`}
                                            >
                                                <MdManageAccounts
                                                    className={`w-5 h-5 text-gray-500 transition duration-75 group-hover:text-white ${contains('manage-tudents') ? 'text-white' : ''
                                                        }`}
                                                />
                                                <span className="flex-1 ms-3 whitespace-nowrap">Manage Student</span>
                                            </NavLink>
                                        </li>

                                        {/* Publish Result */}
                                        <li>
                                            <NavLink
                                                to={`/${institutionEIIN}/dashboard/publish-result`}
                                                className={`flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group ${contains('publish-result') ? 'bg-gray-700' : ''
                                                    }`}
                                            >
                                                <MdOutlinePublishedWithChanges
                                                    className={`w-5 h-5 text-gray-500 transition duration-75 group-hover:text-white ${contains('publish-result') ? 'text-white' : ''
                                                        }`}
                                                />
                                                <span className="flex-1 ms-3 whitespace-nowrap">Publish Result</span>
                                            </NavLink>
                                        </li>
                                    </>
                                )}

                                {/* ==================== Teacher ==================== */}
                                {role === 'teacher' && (
                                    <>
                                        {/* Dashboard */}
                                        <li>
                                            <NavLink
                                                to={`/${institutionEIIN}/dashboard/teacher-dashboard`}
                                                className={`flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group ${isActiveExact(/^\/[^/]+\/teacher-dashboard$/) ? 'bg-gray-700' : ''
                                                    }`}
                                            >
                                                <svg
                                                    className={`w-5 h-5 text-gray-500 transition duration-75 group-hover:text-white ${contains('teacher-dashboard') ? 'text-white' : ''
                                                        }`}
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="currentColor"
                                                    viewBox="0 0 22 21"
                                                >
                                                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                                                </svg>
                                                <span className="ms-3">Dashboard</span>
                                            </NavLink>
                                        </li>

                                        {/* Attendance */}
                                        <li>
                                            <NavLink
                                                to={`/${institutionEIIN}/dashboard/attandence`}
                                                className={`flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group ${contains('attandence') ? 'bg-gray-700' : ''
                                                    }`}
                                            >
                                                <BsFileSpreadsheetFill
                                                    className={`w-5 h-5 text-gray-500 transition duration-75 group-hover:text-white ${contains('attandence') ? 'text-white' : ''
                                                        }`}
                                                />
                                                <span className="flex-1 ms-3 whitespace-nowrap">Attandence</span>
                                            </NavLink>
                                        </li>

                                        {/* Result Submission */}
                                        <li>
                                            <NavLink
                                                to={`/${institutionEIIN}/dashboard/teacherresult`}
                                                className={`flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group ${contains('teacherresult') ? 'bg-gray-700' : ''
                                                    }`}
                                            >
                                                <FcAcceptDatabase
                                                    className={`w-5 h-5 text-gray-500 transition duration-75 group-hover:text-white ${contains('teacherresult') ? 'text-white' : ''
                                                        }`}
                                                />
                                                <span className="flex-1 ms-3 whitespace-nowrap">Result</span>
                                            </NavLink>
                                        </li>
                                    </>
                                )}

                                {/* ==================== Student ==================== */}
                                {role === 'student' && (
                                    <>
                                        {/* Student gets their dashboard (same as your child component route) */}
                                        <li>
                                            <NavLink
                                                to={`/${institutionEIIN}/dashboard/student-dashboard`}
                                                className={`flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group ${contains('student-dashboard') ? 'bg-gray-700' : ''
                                                    }`}
                                            >
                                                <PiStudent
                                                    className={`w-5 h-5 text-gray-500 transition duration-75 group-hover:text-white ${contains('student-dashboard') ? 'text-white' : ''
                                                        }`}
                                                />
                                                <span className="flex-1 ms-3 whitespace-nowrap">My Dashboard</span>
                                            </NavLink>
                                        </li>
                                    </>
                                )}

                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default DashboardComponent;
