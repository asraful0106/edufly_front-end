import React from "react";
import Navigation from "../../sharedComponent/navigation/Navigation";
import Footer from "../../sharedComponent/footer/Footer";
import { NavLink } from "react-router";

const LandingPage = () => {
    return (
        <>

            {/* Navigation */}
            <Navigation location="/" />
            <section className="relative overflow-hidden bg-white">
                {/* soft background shapes */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-56 -right-40 h-[46rem] w-[46rem] rounded-full bg-indigo-100 blur-3xl"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-64 -left-56 h-[40rem] w-[40rem] rounded-full bg-sky-100 blur-3xl"
                />

                <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28 lg:gap-20">
                    {/* LEFT: copy */}
                    <div className="relative z-10">
                        <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
                            <span className="text-indigo-700">Be Visible</span>
                            <br />To Students Everywhere
                        </h1>

                        <p className="mt-6 max-w-xl text-sm leading-6 text-slate-600">
                            With Edufly, you can manage your institution seamlessly and showcase it online with a ready-to-use profile.
                        </p>

                        <NavLink to={"/search"} className="mt-8 inline-flex items-center rounded-full bg-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-300/40 transition hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                            Explore Institutions
                        </NavLink>
                    </div>

                    {/* RIGHT: simple “analytics” illustration (pure JSX/SVG, no asset needed) */}
                    <div className="relative z-10">
                        <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_20px_60px_-15px_rgba(30,41,59,0.25)]">
                            {/* header bar */}
                            <div className="mb-4 flex items-center justify-between">
                                <div className="h-3 w-24 rounded-full bg-slate-100" />
                                <div className="flex gap-2">
                                    <span className="h-2 w-2 rounded-full bg-slate-200" />
                                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                                </div>
                            </div>

                            {/* dashboard cards */}
                            <div className="grid grid-cols-5 gap-3">
                                {/* line chart */}
                                <div className="col-span-3 rounded-xl border border-slate-100 p-3">
                                    <svg viewBox="0 0 200 100" className="h-28 w-full">
                                        <defs>
                                            <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <polyline
                                            points="5,80 30,70 55,75 80,60 105,65 130,40 155,45 185,25"
                                            fill="none"
                                            stroke="#6366f1"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                        />
                                        <polygon
                                            points="5,80 30,70 55,75 80,60 105,65 130,40 155,45 185,25 185,100 5,100"
                                            fill="url(#grad)"
                                        />
                                    </svg>
                                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                        <span>Trend</span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                                            ▲ 7.5%
                                        </span>
                                    </div>
                                </div>

                                {/* side widgets */}
                                <div className="col-span-2 flex flex-col gap-3">
                                    <div className="flex-1 rounded-xl border border-slate-100 p-3">
                                        {/* donut */}
                                        <svg viewBox="0 0 36 36" className="h-20 w-full">
                                            <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                                            <circle
                                                cx="18"
                                                cy="18"
                                                r="16"
                                                fill="none"
                                                stroke="#22c55e"
                                                strokeWidth="4"
                                                strokeDasharray="64 100"
                                                strokeLinecap="round"
                                                transform="rotate(-90 18 18)"
                                            />
                                        </svg>
                                        <p className="mt-1 text-center text-xs text-slate-500">Auslastung</p>
                                    </div>

                                    <div className="flex-1 rounded-xl border border-slate-100 p-3">
                                        <div className="h-6 w-24 rounded bg-indigo-100" />
                                        <div className="mt-2 space-y-2">
                                            <div className="h-2 w-full rounded bg-slate-100" />
                                            <div className="h-2 w-5/6 rounded bg-slate-100" />
                                            <div className="h-2 w-2/3 rounded bg-slate-100" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* avatars */}
                            <div className="mt-5 flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-200 text-xs font-semibold text-indigo-800 ring-2 ring-white">
                                        A
                                    </span>
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-200 text-xs font-semibold text-sky-800 ring-2 ring-white">
                                        B
                                    </span>
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-200 text-xs font-semibold text-emerald-800 ring-2 ring-white">
                                        C
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">School and Collage</p>
                            </div>
                        </div>

                        {/* blue “platform” shadow to echo the mock’s blob under the table */}
                        <div className="absolute -bottom-6 left-1/2 -z-10 h-40 w-72 -translate-x-1/2 rounded-[3rem] bg-indigo-200/50 blur-2xl" />
                    </div>
                </div>
            </section>
            {/* Footer */}
            <Footer />
            </>
    );
};

export default LandingPage;
