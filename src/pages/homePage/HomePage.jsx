import React, { useContext } from 'react';
import Navigation from '../../sharedComponent/navigation/Navigation';
import Footer from '../../sharedComponent/footer/Footer';
import { Outlet, useLocation } from 'react-router';
import EiiContext from '../../contextapi/eiiSearch/EiiSearchContext';

const HomePage = () => {
    const currentLocation = useLocation();
    const { data, loading, error, fetchData } = useContext(EiiContext);
    // For handeling when user load the page 
    if(!data){
        const regex = /(?<=^\/)(\d+)(?=\/|$)/;
        const eiinValue = currentLocation.pathname?.match(regex)[0];
        fetchData(`${import.meta.env.VITE_BACKEND_LINK}/search/eiin/${eiinValue}`);
    }
    
    return (
        <div className='flex flex-col min-h-screen bg-[#eeeeee]'>
            {/* Navigation */}
            <Navigation location="/home" />
            <main className='flex-grow'>
                <Outlet />
            </main>
            {/* Footer */}
            <Footer />
        </div>
    );
};

export default HomePage;