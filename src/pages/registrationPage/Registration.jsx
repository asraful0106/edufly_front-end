import React, { useState, useEffect, useRef } from 'react';
import Navigation from '../../sharedComponent/navigation/Navigation';
import Footer from '../../sharedComponent/footer/Footer';
import AOS from "aos";
import "aos/dist/aos.css";
import { NavLink } from 'react-router';

const Registration = () => {
    const fileInputRef = useRef(null);
    // Initilized AOS
    useEffect(() => {
        AOS.init();
        AOS.refresh();
    }, []);

    // State Declaration
    const [isTypeSelected, setIsTypedSelected] = useState(false);
    const [isGovmentInstitute, setIsGovmentInstitue] = useState(false);

    // For handeling Institution Type
    const handleInstitutionType = (isSchol) => {
        // console.log("Is type: ", isTypeSelected)
        if (isSchol) {
            setIsTypedSelected(true);
            setIsGovmentInstitue(true);
        } else {
            setIsTypedSelected(true);
            setIsGovmentInstitue(false);
        }
    }

    // Handeling file size and type
    const allsowedFileType = ['application/pdf'];
    const allowedFileSize = 4; //MB

    const validateFileSize = (fileInputRef, helptextId, maxFileSize) => {
        const fileInput = fileInputRef.current;
        const file = fileInput?.files[0];
        const helpText = document.getElementById(helptextId);

        const maxSizeInBytes = maxFileSize * 1024 * 1024;

        if (!file || !helpText) return;

        // Reset styles
        helpText.classList.remove("text-red-600");
        helpText.classList.add("text-gray-500");
        fileInput.classList.remove("border-red-600");
        fileInput.classList.add("border-gray-300");

        // File Type Check
        if (!allsowedFileType.includes(file.type)) {
            helpText.innerText = "Only PDF file are allowed!";
            helpText.classList.remove("text-gray-500");
            helpText.classList.add("text-red-600");
            fileInput.classList.remove("border-gray-300");
            fileInput.classList.add("border-red-600");
            return;
        }
        // File Size Check
        if (file.size > maxSizeInBytes) {
            helpText.innerText = "Document size must be less than 4 MB";
            helpText.classList.remove("text-gray-500");
            helpText.classList.add("text-red-600");
            fileInput.classList.remove("border-gray-300");
            fileInput.classList.add("border-red-600");
            return;
        }
        helpText.innerText = "PDF (MAX. 4MB)";
    };


    // For handleing the from submition
    const handleFromSubmission = async (e) => {
        e.preventDefault();
        const input = e.target;
        const file = input.instutation_proof.files[0];

        if (file.size <= allowedFileSize * 1024 * 1024 && allsowedFileType.includes(file.type)) {
            const eiin = input.institution_eiin?.value || ""; // Optional if not a government institute
            const name_eng = input.institution_name_eng.value;
            const name_bng = input.institution_name_bng.value;
            const phone_number = input.institution_Phone.value;
            const email = input.institution_email.value;

            // Create FormData object to handle file and other data
            const formData = new FormData();
            formData.append("eiin", eiin);
            formData.append("name_eng", name_eng);
            formData.append("name_bng", name_bng);
            formData.append("phone_number", phone_number);
            formData.append("email", email);
            formData.append("document_proof", file);

            try {
                // Make POST request to the server
                const url = `${import.meta.env.VITE_BACKEND_LINK}/registration`;
                const response = await fetch(url, {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    alert("Registration successful!");
                    console.log("Response:", result);
                } else {
                    alert("Failed to register. Please try again.");
                    console.error("Error:", response.statusText);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while submitting the form.");
            }
        } else {
            alert("Invalid file type or size. Please upload a valid PDF file under 4MB.");
        }
    };

    return (
        <div className='flex flex-col min-h-screen bg-[#eeeeee]'>
            {/* Navigation */}
            <Navigation location="/registration" />
            <main className='flex-grow my-12'>
                {
                    isTypeSelected ?
                        <div data-aos="fade-left" className='flex items-center justify-center min-h-screen'>

                            <form className='flex flex-col items-center justify-center bg-white px-3 py-6 rounded-xl' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }} onSubmit={handleFromSubmission}>
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

                                            {
                                                isGovmentInstitute &&
                                                < div >
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
                                            }

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
                                                    ref={fileInputRef}
                                                    type="file"
                                                    onChange={() => validateFileSize(fileInputRef, "instutation_proof_help", allowedFileSize)}
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
                                        <button className='w-full mt-6 py-3 bg-[#39a6d0] font-bold text-white rounded-lg hover:bg-[#39a5d0d5] hover:cursor-pointer' type='submit'>Register</button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        // For getting the sleceted type
                        :
                        <div className='h-[90dvh] flex items-center justify-center'>
                            <div data-aos="fade-right">
                                <div className='flex flex-col items-center justify-center'>
                                    <h1 className='text-3xl'>Choose Your Institution type</h1>
                                    <div className="dropdown">
                                        <div tabIndex={0} role="button" className="btn m-1">Institution</div>
                                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                            <li onClick={() => { handleInstitutionType(true) }}><NavLink>School/Collage/Madrasa</NavLink></li>
                                            <li onClick={() => { handleInstitutionType(false) }}><NavLink>Private Center</NavLink></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                }
            </main>
            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Registration;