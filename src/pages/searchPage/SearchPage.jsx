import React, { useEffect, useState } from 'react';
import Navigation from '../../sharedComponent/navigation/Navigation';
import Footer from '../../sharedComponent/footer/Footer';
import "./SearchPage.css";
import AOS from "aos";
import "aos/dist/aos.css";

const SearchPage = () => {
    // Initilized AOS
    useEffect(() => {
        AOS.init();
        AOS.refresh();
    }, []);
    // ** Manage Search Options **
    const [isAdvanceSearch, setIsAdvanceSearch] = useState(false);

    const handelSearchClick = () => {
        setIsAdvanceSearch(false);
    }
    const handelAdvanceSearchClick = () => {
        setIsAdvanceSearch(true);
    }

    return (
        // <div className='flex flex-col min-h-screen'>
        //     {/* Navigation */}
        //     <Navigation/>
        //     <main className='flex-grow bg-amber-200'>
        //         <h1>Main</h1>
        //     </main>
        //     {/* Footer */}
        //     <Footer/>
        // </div>
        <div className='flex flex-col min-h-screen bg-[#eeeeee]'>
            {/* Navigation */}
            <Navigation />
            <main className='flex-grow'>
                <div className='flex items-center justify-center' style={{ height: 'calc(100vh - 10rem)' }}>

                    <form className='flex flex-col items-center justify-center bg-white px-3 py-6 rounded-xl' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}>
                        <div>
                            {/* Company logo */}
                            <div className='flex gap-0.5 w-full h-14 justify-center items-center'>
                                <img className='w-14 h-full object-cover' src="/edufly_color_logo.png" alt="" />
                                <h1 className='font-bold text-4xl'>Edufly</h1>
                            </div>
                            {/* Search Option */}
                            <div className='flex justify-center gap-12 mt-6'>
                                <div className='hover:cursor-pointer' onClick={() => handelSearchClick()}>
                                    <p className={`priventCopy font-medium ${!isAdvanceSearch ? 'text-[#40b0d4]' : 'text-black'}`}>Search</p>
                                    {!isAdvanceSearch &&
                                        <div className="divider p-0, m-0 h-0.5 bg-[#40b0d4]" data-aos="fade-left"></div>}
                                </div>

                                <div className='hover:cursor-pointer' onClick={() => handelAdvanceSearchClick()}>
                                    <p className={`priventCopy font-medium ${isAdvanceSearch ? 'text-[#40b0d4]' : 'text-black'}`}>Advanch Search</p>
                                    {isAdvanceSearch &&
                                        <div className="divider p-0, m-0 h-0.5 bg-[#40b0d4]" data-aos="fade-right"></div>}
                                </div>
                            </div>
                            {/* For Search */}
                            {
                                !isAdvanceSearch &&
                                <div data-aos="flip-up">
                                        {/* Search Input */}
                                        <div className='mt-12'>
                                            <label
                                                htmlFor="institution_name"
                                                className="block mb-2 text-sm font-medium text-gray-900"
                                            >
                                                Institution Name
                                            </label>
                                            <input
                                                type="text"
                                                id="institution_name"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full min-w-[20rem] p-2.5"
                                                placeholder="Agrani School & College"
                                                required
                                            />
                                        </div>
                                        {/* Search Submit Button */}
                                        <button className='w-full mt-6 py-3 bg-[#39a6d0] font-bold text-white rounded-lg hover:bg-[#39a5d0d5] hover:cursor-pointer'>Search</button>
                                    </div>
                            }

                            {/* For Advance Search */}
                            {
                                isAdvanceSearch &&
                                <div data-aos="flip-up">
                                    {/* Search Input */}
                                    <div className='mt-12'>
                                        <label
                                            htmlFor="institution_eiin"
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                        >
                                            EIIN Number
                                        </label>
                                        <input
                                            type="number"
                                            id="institution_eiin"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full min-w-[20rem] p-2.5"
                                            placeholder="126495"
                                            required
                                        />
                                    </div>
                                    {/* Search Submit Button */}
                                    <button className='w-full mt-6 py-3 bg-[#39a6d0] font-bold text-white rounded-lg hover:bg-[#39a5d0d5] hover:cursor-pointer'>Search</button>
                                </div>
                            }
                        </div>
                    </form>
                </div>
            </main>
            {/* Footer */}
            <Footer />
        </div>
    );
};

export default SearchPage;