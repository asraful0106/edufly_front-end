import React, { useContext } from 'react';
import './Dashboard.css';
import { NavLink, Outlet, useLocation } from 'react-router';
import { FaChalkboardTeacher } from "react-icons/fa";
import EiiContext from '../../contextapi/eiiSearch/EiiSearchContext';

const DashboardComponent = () => {
    const { data } = useContext(EiiContext);
    const currentLocation = useLocation();
    return (
        <div>
            <div className="container min-w-full max-h-screen">
                <div className="main-container max-h-screen">
                    <Outlet />
                </div>
                {/* Side Bar */}
                <div className="side-navigation max-h-screen">
                    <aside
                        id="default-sidebar"
                        className="h-screen transition-transform -translate-x-full sm:translate-x-0"
                        aria-label="Sidebar"
                    >
                        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-800">
                            <ul className="space-y-2 font-medium">
                                {/* Dashboard */}
                                <li>
                                    <NavLink to={`/${data?.eiin}/dashboard`} 
                                        className={`flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group ${/^\/\d+\/dashboard$/.test(currentLocation?.pathname.toString()) ? "bg-gray-700" : ""}`}
                                    >
                                        <svg
                                            className={`w-5 h-5 text-gray-500 transition duration-75 group-hover:text-white ${currentLocation?.pathname.toString().includes("dashboard") ? "text-white" : ""}`}
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
                                    <NavLink to={`/${data?.eiin}/dashboard/teacher`} 
                                        className={`flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group ${currentLocation?.pathname.toString().includes("teacher") ? "bg-gray-700" : ""}`}
                                    >
                                        <FaChalkboardTeacher className={`w-5 h-5 text-gray-500 transition duration-75 group-hover:text-white ${currentLocation?.pathname.toString().includes("teacher") ? "text-white" : ""}`} />
                                        <span className="flex-1 ms-3 whitespace-nowrap">Teacher</span>
                                    </NavLink>
                                </li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default DashboardComponent;