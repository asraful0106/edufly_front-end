import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router';
import EiiContext from '../../contextapi/eiiSearch/EiiSearchContext';
import './navigation.css';

const Navigation = ({ name, location }) => {
    // console.log("Navigation location: ", location);
    const { data, setData } = useContext(EiiContext);
    const currentLocation = useLocation();
    return (
        <nav>
            <div className="navbar bg-base-100" style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}>
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
                        </div>
                        {/* Menu in Navigation bar */}
                        {
                            (location !== '/' && location !== '/registration') &&
                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-6 w-52 p-2 shadow">
                                <li><a>Item 1</a></li>
                                <li>
                                    <a>Parent</a>
                                    <ul className="p-2">
                                        <li><a>Submenu 1</a></li>
                                        <li><a>Submenu 2</a></li>
                                    </ul>
                                </li>
                                <li><a>Item 3</a></li>
                            </ul>
                        }
                    </div>
                    {/* Company name or institution name */}
                    {/* (location !== '/' && location !== '/registration') && */}
                    <a className="btn btn-ghost text-xl">{(location !== '/' && location !== '/registration') ? data?.name_eng : name ? name : "Edufly"}</a>
                </div>
                <div className="navbar-center hidden lg:flex">
                    {/* Navigation bar links  Desktop*/}
                    {
                        (location !== '/' && location !== '/registration') &&
                        <ul className="menu menu-horizontal px-1">
                            <li><NavLink to={`/${data?.eiin}`} end className={currentLocation.pathname === `/${data?.eiin}` ? 'activeNav' : ''}>Home</NavLink></li>
                            {/* {console.log("Current Location: ", currentLocation)} */}
                            {/* <li>
                                <details>
                                    <summary>Parent</summary>
                                    <ul className="p-2">
                                        <li><a>Submenu 1</a></li>
                                        <li><a>Submenu 2</a></li>
                                    </ul>
                                </details>
                            </li> */}
                            <li><NavLink to={`/${data?.eiin}/teacher`} className={currentLocation.pathname === `/${data?.eiin}/teacher` ? 'activeNav' : ''}> Teachers</NavLink></li>
                            <li><NavLink to={`/${data?.eiin}/notice`} className={currentLocation.pathname === `/${data?.eiin}/notice` ? 'activeNav' : ''}>Notice</NavLink></li>
                            <li><NavLink to={`/${data?.eiin}/contact-us`} className={currentLocation.pathname === `/${data?.eiin}/contact-us` ? 'activeNav' : ''}>Contact Us</NavLink></li>
                            <li><NavLink to={`/${data?.eiin}/gallery`} className={currentLocation.pathname === `/${data?.eiin}/gallery` ? 'activeNav' : ''}>Gallery</NavLink></li>
                            <li><NavLink to={`/${data?.eiin}/dashboard`} className={currentLocation.pathname === `/${data?.eiin}/dashboard` ? 'activeNav' : ''}>Dashbord</NavLink></li>
                        </ul>
                    }
                </div>
                <div className="navbar-end">
                    {
                        location === '/' ?
                            <NavLink className="btn" to={'/registration'}>Register</NavLink>
                            :
                            <NavLink className="btn" onClick={() => setData(null)} to={'/'}>Search</NavLink>
                    }

                    {/* For Profile */}
                    <div className="dropdown dropdown-end ml-2">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                <img
                                    alt="Tailwind CSS Navbar component"
                                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                            </div>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow mt-4">
                            <li><a>Login</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;