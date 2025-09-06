// src/components/navigation/Navigation.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import EiiContext from '../../contextapi/eiiSearch/EiiSearchContext';
import { useAuth } from '../../contextapi/AuthContext';
import './navigation.css';
import axios from 'axios';

const API = import.meta.env.VITE_BACKEND_LINK || 'http://localhost:3010';
const DEFAULT_AVATAR = '/no_image.png';

const Navigation = ({ name, location }) => {
    const { data, setData } = useContext(EiiContext);
    const { isAuthenticated, profile, logout } = useAuth();
    const currentLocation = useLocation();

    // Avatars (teacher/student/institution)
    const [tAvatarUrl, setTAvatarUrl] = useState('');
    const [sAvatarUrl, setSAvatarUrl] = useState('');
    const [iAvatarUrl, setIAvatarUrl] = useState('');

    // compute institution id for links
    const institutionId = profile?.institution_id ?? data?.eiin;

    // =============== Teacher avatar =================
    useEffect(() => {
        let ignore = false;
        async function fetchTeacherAvatar() {
            try {
                if (!isAuthenticated || !profile?.teacher_id) {
                    if (!ignore) setTAvatarUrl('');
                    return;
                }
                const { data: resp } = await axios.get(`${API}/teacher-profile/me`, {
                    params: { teacher_id: profile.teacher_id },
                });
                const img = resp?.data?.teacher?.image;
                if (!ignore) {
                    setTAvatarUrl(img ? `${API}/image/teacher/${img}` : '');
                }
            } catch {
                if (!ignore) setTAvatarUrl('');
            }
        }
        fetchTeacherAvatar();
        return () => { ignore = true; };
    }, [isAuthenticated, profile?.teacher_id]);

    // =============== Student avatar =================
    useEffect(() => {
        let ignore = false;
        async function fetchStudentAvatar() {
            try {
                if (!isAuthenticated || !profile?.student_id) {
                    if (!ignore) setSAvatarUrl('');
                    return;
                }
                // mirror teacher endpoint shape
                const { data: resp } = await axios.get(`${API}/student/me`, {
                    params: { student_id: profile.student_id },
                });
                const img = resp?.data?.image;
                if (!ignore) {
                    setSAvatarUrl(img ? `${API}/image/student/${img}` : '');
                }
            } catch {
                if (!ignore) setSAvatarUrl('');
            }
        }
        fetchStudentAvatar();
        return () => { ignore = true; };
    }, [isAuthenticated, profile?.student_id]);

    // =============== Institution avatar =================
    useEffect(() => {
        let ignore = false;
        async function fetchInstitutionAvatar() {
            try {
                // If logged in as institution/admin OR we at least have institution context (EiiContext)
                const iid = profile?.institution_id || profile?.eiin || data?.eiin;
                if (!iid) {
                    if (!ignore) setIAvatarUrl('');
                    return;
                }

                // If you already have institution loaded in EiiContext with logo, prefer it:
                const contextLogo = data?.logo;
                if (contextLogo) {
                    if (!ignore) {
                        const absolute = contextLogo.startsWith('http')
                            ? contextLogo
                            : `${API}/image/institution/${contextLogo}`;
                        setIAvatarUrl(absolute);
                    }
                    return;
                }

                // Otherwise hit a profile endpoint for institution
                const { data: resp } = await axios.get(`${API}/search/eiin/${iid}`);
                const logo = resp?.logo;
                if (!ignore) {
                    setIAvatarUrl(logo ? `${API}/image/institution/${logo}` : '/agrani_logo.png');
                }
            } catch {
                if (!ignore) setIAvatarUrl('');
            }
        }
        fetchInstitutionAvatar();
        // keep it reactive to profile + EiiContext changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, profile?.institution_id, profile?.eiin, data?.eiin, data?.logo]);

    // helpers
    const isActive = (path) => currentLocation.pathname === path;
    const contains = (segment) => currentLocation.pathname.includes(segment);

    // brand/institution name
    const brand = useMemo(() => {
        const onPublic = location === '/' || location === '/registration';
        return onPublic ? (name || 'Edufly') : (data?.name_eng || 'Edufly');
    }, [location, name, data?.name_eng]);

    const handleLogout = async () => {
        await logout();
    };

    // Which avatar to show?
    // Priority: teacher > student > institution > default
    const avatarSrc = tAvatarUrl || sAvatarUrl || iAvatarUrl || DEFAULT_AVATAR;

    return (
        <nav>
            <div
                className="navbar bg-base-100"
                style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
            >
                {/* START */}
                <div className="navbar-start">
                    {/* mobile menu */}
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                        </div>

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

                    {/* brand */}
                    <span className="btn btn-ghost text-xl">{brand}</span>
                </div>

                {/* CENTER (desktop menu) */}
                <div className="navbar-center hidden lg:flex">
                    {(location !== '/' && location !== '/registration') && (
                        <ul className="menu menu-horizontal px-1">
                            <li><NavLink to={`/${data?.eiin}`} end className={isActive(`/${data?.eiin}`) ? 'activeNav' : ''}>Home</NavLink></li>
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

                {/* END (actions) */}
                <div className="navbar-end">
                    {location === '/'
                        ? <NavLink className="btn" to="/registration">Register</NavLink>
                        : <NavLink className="btn" onClick={() => setData(null)} to="/">Search</NavLink>
                    }

                    {/* profile */}
                    <div className="dropdown dropdown-end ml-2">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                {!isAuthenticated ? (
                                    <img alt="Default avatar" src={DEFAULT_AVATAR} />
                                ) : (
                                    <img alt="User avatar" src={avatarSrc} onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} />
                                )}
                            </div>
                        </div>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow mt-4">
                            {!isAuthenticated ? (
                                <li><NavLink to="/login">Login</NavLink></li>
                            ) : (
                                <>
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
