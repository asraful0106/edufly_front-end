import React from 'react';
import Navigation from '../../sharedComponent/navigation/Navigation';
import Footer from '../../sharedComponent/footer/Footer';

const HomePage = () => {
    return (
        <div className='flex flex-col min-h-screen bg-[#eeeeee]'>
            {/* Navigation */}
            <Navigation location="/home" />
            <main className='flex-grow'>
            </main>
            {/* Footer */}
            <Footer />
        </div>
    );
};

export default HomePage;