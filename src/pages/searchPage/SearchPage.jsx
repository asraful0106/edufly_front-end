import React, { useContext, useEffect, useState, useRef } from 'react';
import Navigation from '../../sharedComponent/navigation/Navigation';
import Footer from '../../sharedComponent/footer/Footer';
import "./SearchPage.css";
import AOS from "aos";
import "aos/dist/aos.css";
import Lottie from 'lottie-react';
import loadingLottie from '../../lottie/loading.json'
import EiiContext from '../../contextapi/eiiSearch/EiiSearchContext';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router';

const SearchPage = () => {
    const navigate = useNavigate();
    // Initilized AOS
    useEffect(() => {
        AOS.init();
        AOS.refresh();
    }, []);
    // ** Manage Search Options **
    const [isAdvanceSearch, setIsAdvanceSearch] = useState(true);

    const handelSearchClick = () => {
        setIsAdvanceSearch(false);
    }
    const handelAdvanceSearchClick = () => {
        setIsAdvanceSearch(true);
    }

    // Getting the data 
    const { data, loading, error, fetchData } = useContext(EiiContext);

    // Ref for EIIN input
    const eiinInputRef = useRef(null);

    // Handle EIIN Search
    const handleEiinSearch = (e) => {
        e.preventDefault();
        const eiinValue = eiinInputRef.current.value.trim();
        // Call fetchData with the EIIN value
        fetchData(`${import.meta.env.VITE_BACKEND_LINK}/search/eiin/${eiinValue}`);
    };

    // Navigate when data is updated
    useEffect(() => {
        if (data) {
            navigate(`/${data?.eiin}`);
        }
    }, [data, navigate]);

    // Show error when it occurs
    useEffect(() => {
        if (error) {
            const errorMessage = typeof error === "string" ? error : error.message || "An unknown error occurred";
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    }, [error]);

    return (
        <div className='flex flex-col min-h-screen bg-[#eeeeee]'>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            {/* Navigation */}
            <Navigation location="/" />
            <main className='flex-grow'>
                <div className='flex items-center justify-center' style={{ height: 'calc(100vh - 10rem)' }}>

                    <form onSubmit={handleEiinSearch} className='flex flex-col items-center justify-center bg-white px-3 py-6 rounded-xl' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}>
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
                                    <p className={`priventCopy font-medium ${isAdvanceSearch ? 'text-[#40b0d4]' : 'text-black'}`}>Advance Search</p>
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
                                            type="text"
                                            id="institution_eiin"
                                            ref={eiinInputRef}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full min-w-[20rem] p-2.5"
                                            placeholder="126495"
                                            required
                                        />
                                    </div>
                                    {/* Search Submit Button */}
                                    <button type="submit" className='w-full mt-6 py-3 bg-[#39a6d0] font-bold text-white rounded-lg hover:bg-[#39a5d0d5] hover:cursor-pointer'>Search</button>
                                </div>
                            }
                        </div>
                    </form>
                </div>

                {/* Loading animation */}
                {
                    loading &&
                    <div className='absolute left-0 right-0 top-[4.1rem] bottom-0' style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
                        <div className='w-full h-full flex items-center justify-center' style={{ color: "black" }}>
                            <Lottie animationData={loadingLottie} loop={true} />
                        </div>
                    </div>
                }
            </main>
            {/* Footer */}
            <Footer />
        </div>
    );
};

export default SearchPage;