import React, { useContext, useEffect, useState, useRef, useMemo } from "react";
import Navigation from "../../sharedComponent/navigation/Navigation";
import Footer from "../../sharedComponent/footer/Footer";
import "./SearchPage.css";
import AOS from "aos";
import "aos/dist/aos.css";
import Lottie from "lottie-react";
import loadingLottie from "../../lottie/loading.json";
import EiiContext from "../../contextapi/eiiSearch/EiiSearchContext";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router";

const SearchPage = () => {
    const navigate = useNavigate();

    // ✅ Init AOS (animation library)
    useEffect(() => {
        AOS.init({ once: true });
    }, []);

    // ✅ Manage search toggle
    const [isAdvanceSearch, setIsAdvanceSearch] = useState(true);
    const [requestedEiin, setRequestedEiin] = useState(null);
    const toggleSearchMode = (mode) => setIsAdvanceSearch(mode === "advance");

    // ✅ Context data
    const { data, loading, error, fetchData } = useContext(EiiContext);

    // ✅ Ref for EIIN input
    const eiinInputRef = useRef(null);

    // ✅ Toast config (memoized once)
    const toastOptions = useMemo(
        () => ({
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        }),
        []
    );

    // ✅ Handle EIIN Search

    const handleEiinSearch = (e) => {
        e.preventDefault();
        const eiin = eiinInputRef.current.value.trim();
        setRequestedEiin(eiin);
        fetchData(`${import.meta.env.VITE_BACKEND_LINK}/search/eiin/${eiin}`);
    };

    // ✅ Navigate when data updates
    useEffect(() => {
        if (data?.eiin && data.eiin === requestedEiin) {
            toast.success("Institution Found!", toastOptions);
            navigate(`/${data.eiin}`);
        }
    }, [data?.eiin, requestedEiin, navigate]);

    // ✅ Show error when it occurs
    useEffect(() => {
        if (error) {
            const errorMessage =
                typeof error === "string" ? error : error?.message || "An unknown error occurred";
            toast.error(errorMessage, toastOptions);
        }
    }, [error, toastOptions]);

    return (
        <div className="flex min-h-screen flex-col bg-[#eeeeee]">
            <ToastContainer {...toastOptions} newestOnTop={false} rtl={false} pauseOnFocusLoss />

            {/* Navigation */}
            <Navigation location="/" />

            <main className="flex-grow">
                <div
                    className="flex items-center justify-center"
                    style={{ height: "calc(100vh - 10rem)" }}
                >
                    {/* Search Form */}
                    <form
                        onSubmit={handleEiinSearch}
                        className="flex flex-col items-center justify-center rounded-xl bg-white px-3 py-6 shadow-md"
                    >
                        <div>
                            {/* Logo */}
                            <div className="flex h-14 w-full items-center justify-center gap-0.5">
                                <img
                                    className="h-full w-14 object-cover"
                                    src="/edufly_color_logo.png"
                                    alt="Edufly Logo"
                                />
                                <h1 className="text-4xl font-bold">Edufly</h1>
                            </div>

                            {/* Search Toggle */}
                            <div className="mt-6 flex justify-center gap-12">
                                <div
                                    className="hover:cursor-pointer"
                                    onClick={() => toggleSearchMode("basic")}
                                >
                                    <p
                                        className={`priventCopy font-medium ${!isAdvanceSearch ? "text-[#40b0d4]" : "text-black"
                                            }`}
                                    >
                                        Search
                                    </p>
                                    {!isAdvanceSearch && (
                                        <div
                                            className="divider m-0 h-0.5 bg-[#40b0d4] p-0"
                                            data-aos="fade-left"
                                        />
                                    )}
                                </div>

                                <div
                                    className="hover:cursor-pointer"
                                    onClick={() => toggleSearchMode("advance")}
                                >
                                    <p
                                        className={`priventCopy font-medium ${isAdvanceSearch ? "text-[#40b0d4]" : "text-black"
                                            }`}
                                    >
                                        Advance Search
                                    </p>
                                    {isAdvanceSearch && (
                                        <div
                                            className="divider m-0 h-0.5 bg-[#40b0d4] p-0"
                                            data-aos="fade-right"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Basic Search */}
                            {!isAdvanceSearch && (
                                <div data-aos="flip-up">
                                    <div className="mt-12">
                                        <label
                                            htmlFor="institution_name"
                                            className="mb-2 block text-sm font-medium text-gray-900"
                                        >
                                            Institution Name
                                        </label>
                                        <input
                                            type="text"
                                            id="institution_name"
                                            className="block w-full min-w-[20rem] rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Agrani School & College"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="mt-6 w-full rounded-lg bg-[#39a6d0] py-3 font-bold text-white hover:cursor-pointer hover:bg-[#39a5d0d5]"
                                    >
                                        Search
                                    </button>
                                </div>
                            )}

                            {/* Advance Search */}
                            {isAdvanceSearch && (
                                <div data-aos="flip-up">
                                    <div className="mt-12">
                                        <label
                                            htmlFor="institution_eiin"
                                            className="mb-2 block text-sm font-medium text-gray-900"
                                        >
                                            EIIN Number
                                        </label>
                                        <input
                                            type="text"
                                            id="institution_eiin"
                                            ref={eiinInputRef}
                                            className="block w-full min-w-[20rem] rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="126495"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="mt-6 w-full rounded-lg bg-[#39a6d0] py-3 font-bold text-white hover:cursor-pointer hover:bg-[#39a5d0d5]"
                                    >
                                        Search
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute left-0 right-0 top-[4.1rem] bottom-0 bg-black/10">
                        <div className="flex h-full w-full items-center justify-center">
                            <Lottie animationData={loadingLottie} loop />
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default SearchPage;
