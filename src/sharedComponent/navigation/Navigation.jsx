// import React, { useContext } from 'react';
// import { NavLink, useLocation } from 'react-router';
// import EiiContext from '../../contextapi/eiiSearch/EiiSearchContext';
// import './navigation.css';

// const Navigation = ({ name, location }) => {
//     // console.log("Navigation location: ", location);
//     const { data, setData } = useContext(EiiContext);
//     const currentLocation = useLocation();
//     return (
//         <nav>
//             <div className="navbar bg-base-100" style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}>
//                 <div className="navbar-start">
//                     <div className="dropdown">
//                         <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
//                         </div>
//                         {/* Menu in Navigation bar */}
//                         {
//                             (location !== '/' && location !== '/registration') &&
//                             <ul
//                                 tabIndex={0}
//                                 className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-6 w-52 p-2 shadow">
//                                 <li><a>Item 1</a></li>
//                                 <li>
//                                     <a>Parent</a>
//                                     <ul className="p-2">
//                                         <li><a>Submenu 1</a></li>
//                                         <li><a>Submenu 2</a></li>
//                                     </ul>
//                                 </li>
//                                 <li><a>Item 3</a></li>
//                             </ul>
//                         }
//                     </div>
//                     {/* Company name or institution name */}
//                     {/* (location !== '/' && location !== '/registration') && */}
//                     <a className="btn btn-ghost text-xl">{(location !== '/' && location !== '/registration') ? data?.name_eng : name ? name : "Edufly"}</a>
//                 </div>
//                 <div className="navbar-center hidden lg:flex">
//                     {/* Navigation bar links  Desktop*/}
//                     {
//                         (location !== '/' && location !== '/registration') &&
//                         <ul className="menu menu-horizontal px-1">
//                             <li><NavLink to={`/${data?.eiin}`} end className={currentLocation.pathname === `/${data?.eiin}` ? 'activeNav' : ''}>Home</NavLink></li>
//                             {/* {console.log("Current Location: ", currentLocation)} */}
//                             {/* <li>
//                                 <details>
//                                     <summary>Parent</summary>
//                                     <ul className="p-2">
//                                         <li><a>Submenu 1</a></li>
//                                         <li><a>Submenu 2</a></li>
//                                     </ul>
//                                 </details>
//                             </li> */}
//                             <li><NavLink to={`/${data?.eiin}/teacher`} className={currentLocation.pathname === `/${data?.eiin}/teacher` ? 'activeNav' : ''}> Teachers</NavLink></li>
//                             <li><NavLink to={`/${data?.eiin}/notice`} className={currentLocation.pathname === `/${data?.eiin}/notice` ? 'activeNav' : ''}>Notice</NavLink></li>
//                             <li><NavLink to={`/${data?.eiin}/contact-us`} className={currentLocation.pathname === `/${data?.eiin}/contact-us` ? 'activeNav' : ''}>Contact Us</NavLink></li>
//                             <li><NavLink to={`/${data?.eiin}/gallery`} className={currentLocation.pathname === `/${data?.eiin}/gallery` ? 'activeNav' : ''}>Gallery</NavLink></li>
//                             {/* <li><NavLink to={`/${data?.eiin}/dashboard`} className={currentLocation.pathname === `/${data?.eiin}/dashboard` ? 'activeNav' : ''}>Dashbord</NavLink></li> */}
//                                 <li><NavLink to={`/${data?.eiin}/dashboard`} className={currentLocation.pathname.toString().includes('dashboard') ? 'activeNav' : ''}>Dashbord</NavLink></li>
//                         </ul>
//                     }
//                 </div>
//                 <div className="navbar-end">
//                     {
//                         location === '/' ?
//                             <NavLink className="btn" to={'/registration'}>Register</NavLink>
//                             :
//                             <NavLink className="btn" onClick={() => setData(null)} to={'/'}>Search</NavLink>
//                     }

//                     {/* For Profile */}
//                     <div className="dropdown dropdown-end ml-2">
//                         <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
//                             <div className="w-10 rounded-full">
//                                 <img
//                                     alt="Tailwind CSS Navbar component"
//                                     src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
//                             </div>
//                         </div>
//                         <ul
//                             tabIndex={0}
//                             className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow mt-4">
//                             <li><NavLink to={"/login"}>Login</NavLink></li>
//                         </ul>
//                     </div>
//                 </div>
//             </div>
//         </nav>
//     );
// };

// export default Navigation;


// src/components/navigation/Navigation.jsx
import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import EiiContext from '../../contextapi/eiiSearch/EiiSearchContext';
import { useAuth } from '../../contextapi/AuthContext'; // adjust the path if yours differs
import './navigation.css';

const Navigation = ({ name, location }) => {
    const { data, setData } = useContext(EiiContext);
    const { isAuthenticated, profile, logout } = useAuth(); // <-- auth
    const currentLocation = useLocation();
    // const navigate = useNavigate();

    const institutionId = profile?.institution_id ?? data?.eiin;

    const handleLogout = async () => {
        await logout();             // clears cookie (server) + localStorage (client)
        // navigate('/login', { replace: true });
    };

    // Helper to mark active items
    const isActive = (path) => currentLocation.pathname === path;
    const contains = (segment) => currentLocation.pathname.toString().includes(segment);

    return (
        <nav>
            <div className="navbar bg-base-100" style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}>
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                        </div>

                        {/* Mobile menu (only when not on home/registration) */}
                        {(location !== '/' && location !== '/registration') && (
                            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-6 w-52 p-2 shadow">
                                <li><NavLink to={`/${data?.eiin}`} className={isActive(`/${data?.eiin}`) ? 'activeNav' : ''}>Home</NavLink></li>
                                <li><NavLink to={`/${data?.eiin}/teacher`} className={isActive(`/${data?.eiin}/teacher`) ? 'activeNav' : ''}>Teachers</NavLink></li>
                                <li><NavLink to={`/${data?.eiin}/notice`} className={isActive(`/${data?.eiin}/notice`) ? 'activeNav' : ''}>Notice</NavLink></li>
                                <li><NavLink to={`/${data?.eiin}/contact-us`} className={isActive(`/${data?.eiin}/contact-us`) ? 'activeNav' : ''}>Contact Us</NavLink></li>
                                <li><NavLink to={`/${data?.eiin}/gallery`} className={isActive(`/${data?.eiin}/gallery`) ? 'activeNav' : ''}>Gallery</NavLink></li>
                                {isAuthenticated && (
                                    <li>
                                        <NavLink
                                            to={`/${institutionId}/dashboard`}
                                            className={contains('dashboard') ? 'activeNav' : ''}
                                        >
                                            Dashboard
                                        </NavLink>
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>

                    {/* Brand / Institution name */}
                    <a className="btn btn-ghost text-xl">
                        {(location !== '/' && location !== '/registration') ? (data?.name_eng || 'Edufly') : (name || 'Edufly')}
                    </a>
                </div>

                <div className="navbar-center hidden lg:flex">
                    {/* Desktop nav */}
                    {(location !== '/' && location !== '/registration') && (
                        <ul className="menu menu-horizontal px-1">
                            <li><NavLink to={`/${data?.eiin}`} end className={isActive(`/${data?.eiin}`) ? 'activeNav' : ''}>Home</NavLink></li>
                            <li><NavLink to={`/${data?.eiin}/teacher`} className={isActive(`/${data?.eiin}/teacher`) ? 'activeNav' : ''}>Teachers</NavLink></li>
                            <li><NavLink to={`/${data?.eiin}/notice`} className={isActive(`/${data?.eiin}/notice`) ? 'activeNav' : ''}>Notice</NavLink></li>
                            <li><NavLink to={`/${data?.eiin}/contact-us`} className={isActive(`/${data?.eiin}/contact-us`) ? 'activeNav' : ''}>Contact Us</NavLink></li>
                            <li><NavLink to={`/${data?.eiin}/gallery`} className={isActive(`/${data?.eiin}/gallery`) ? 'activeNav' : ''}>Gallery</NavLink></li>

                            {/* Dashboard only when logged in */}
                            {isAuthenticated && (
                                <li>
                                    <NavLink
                                        to={`/${institutionId}/dashboard`}
                                        className={contains('dashboard') ? 'activeNav' : ''}
                                    >
                                        Dashboard
                                    </NavLink>
                                </li>
                            )}
                        </ul>
                    )}
                </div>

                <div className="navbar-end">
                    {location === '/'
                        ? <NavLink className="btn" to="/registration">Register</NavLink>
                        : <NavLink className="btn" onClick={() => setData(null)} to="/">Search</NavLink>
                    }

                    {/* Profile / Auth menu */}
                    <div className="dropdown dropdown-end ml-2">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                <img
                                    alt="Tailwind CSS Navbar component"
                                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                                />
                            </div>
                        </div>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow mt-4">
                            {!isAuthenticated ? (
                                <li><NavLink to="/login">Login</NavLink></li>
                            ) : (
                                <>
                                    {/* Optional quick jump to user’s dashboard */}
                                    <li>
                                        <NavLink to={`/${institutionId}/dashboard`} className={contains('dashboard') ? 'activeNav' : ''}>
                                            My Dashboard
                                        </NavLink>
                                    </li>
                                    <li>
                                        <button onClick={handleLogout}>Logout</button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
