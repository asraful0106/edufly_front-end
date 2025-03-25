import React from 'react';
import Navigation from '../../sharedComponent/navigation/Navigation';
import Footer from '../../sharedComponent/footer/Footer';

const Registration = () => {
    return (
        <div className='flex flex-col min-h-screen bg-[#eeeeee]'>
            {/* Navigation */}
            <Navigation location="/registration" />
            <main className='flex-grow my-12'>
                <div className='flex items-center justify-center min-h-screen'>

                    <form className='flex flex-col items-center justify-center bg-white px-3 py-6 rounded-xl' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}>
                        <div>
                            {/* Company logo */}
                            <div className='flex gap-0.5 w-full h-14 justify-center items-center'>
                                <img className='w-14 h-full object-cover' src="/edufly_color_logo.png" alt="" />
                                <h1 className='font-bold text-4xl'>Edufly</h1>
                            </div>
                            <div>
                                {/* Registration From Input */}
                                <div className='mt-12 flex flex-col gap-6'>
                                    {/* School Name in English*/}
                                    <div>
                                        <label
                                            htmlFor="institution_name_eng"
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                        >
                                            Institution Name (English)
                                        </label>
                                        <input
                                            type="text"
                                            id="institution_name_eng"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full min-w-[20rem] p-2.5"
                                            placeholder="Agrani School & College"
                                            required
                                        />
                                    </div>
                                    {/* School Name in Bangla*/}
                                    <div>
                                        <label
                                            htmlFor="institution_name_bng"
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                        >
                                            Institution Name (Bangla)
                                        </label>
                                        <input
                                            type="text"
                                            id="institution_name_bng"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full min-w-[20rem] p-2.5"
                                            placeholder="অগ্রণী বিদ্যালয় ও মহাবিদ্যালয়"
                                            required
                                        />
                                    </div>

                                    {/* School EIIN Number*/}
                                    <div>
                                        <label
                                            htmlFor="institution_eiin"
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                        >
                                            Institution EIIN Number
                                        </label>
                                        <input
                                            type="number"
                                            id="institution_eiin"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full min-w-[20rem] p-2.5"
                                            placeholder="100006"
                                            required
                                        />
                                    </div>

                                    {/* School Phone Number*/}
                                    <div>
                                        <label
                                            htmlFor="institution_Phone"
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                        >
                                            Institution Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="institution_Phone"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full min-w-[20rem] p-2.5"
                                            placeholder="+8801303216000"
                                            required
                                        />
                                    </div>
                                    {/* School Email*/}
                                    <div>
                                        <label
                                            htmlFor="institution_email"
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                        >
                                            Institution Email
                                        </label>
                                        <input
                                            type="email"
                                            id="institution_email"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full min-w-[20rem] p-2.5"
                                            placeholder="agraniruet@gmail.com"
                                            required
                                        />
                                    </div>
                                    {/* Proof of Document*/}
                                    <div>
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900"
                                            htmlFor="instutation_proof"
                                        >
                                            Proof of Document
                                        </label>
                                        <input
                                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none px-2.5 py-2.5"
                                            aria-describedby="instutation_proof_help"
                                            id="instutation_proof"
                                            type="file"
                                        />
                                        <p
                                            className="mt-1 text-sm text-gray-500"
                                            id="instutation_proof_help"
                                        >
                                            PDF (MAX. 4MB).
                                        </p>
                                    </div>
                                </div>
                                {/* Search Submit Button */}
                                <button className='w-full mt-6 py-3 bg-[#39a6d0] font-bold text-white rounded-lg hover:bg-[#39a5d0d5] hover:cursor-pointer'>Register</button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Registration;