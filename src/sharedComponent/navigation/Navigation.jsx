import React from 'react';
import { NavLink } from 'react-router';

const Navigation = ({ name, location }) => {
    console.log("Navigation location: ", location);
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
                            (!location === '/' || !location === '/registration') &&
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
                    {/* Company name or instuation name */}
                    <a className="btn btn-ghost text-xl">{name ? name : "Edufly"}</a>
                </div>
                <div className="navbar-center hidden lg:flex">
                    {/* Navigation bar links */}
                    {
                        (!location === '/' || !location === '/registration') &&
                        <ul className="menu menu-horizontal px-1">
                            <li><a>Item 1</a></li>
                            <li>
                                <details>
                                    <summary>Parent</summary>
                                    <ul className="p-2">
                                        <li><a>Submenu 1</a></li>
                                        <li><a>Submenu 2</a></li>
                                    </ul>
                                </details>
                            </li>
                            <li><a>Item 3</a></li>
                        </ul>
                    }
                </div>
                <div className="navbar-end">
                    {
                        location === '/' ?
                            <NavLink className="btn" to={'/registration'}>Register</NavLink>
                            :
                            <NavLink className="btn" to={'/'}>Search</NavLink>
                    }
                </div>
            </div>
        </nav>
    );
};

export default Navigation;