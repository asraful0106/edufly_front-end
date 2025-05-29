import React, { useContext } from 'react';
import { useLocation } from 'react-router';
import EiiContext from '../../contextapi/eiiSearch/EiiSearchContext';
import { FaRegIdCard } from "react-icons/fa";
import { MdDateRange } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";
import { PiStudentFill } from "react-icons/pi";

const DashboardComponentChild = () => {
    const currentLocation = useLocation();
    const { data, loading, error, fetchData } = useContext(EiiContext);

    // For handeling when user load the page 
    if (!data) {
        const regex = /(?<=^\/)(\d+)(?=\/|$)/;
        const eiinValue = currentLocation.pathname?.match(regex)[0];
        fetchData(`${import.meta.env.VITE_BACKEND_LINK}/search/eiin/${eiinValue}`);
        }
    
    return (
        <div className='w-full flex flex-col items-center justify-center'>
            {/* Institution banner */}
            <div className='w-[85%] mt-6 p-10 bg-[#1e2939d8] rounded-xl shadow flex items-center gap-5'>
                <div className='w-[7rem] h-[7rem] rounded-full bg-white'>
                    <img className='w-full h-full' src="/public/agrani_logo.png" alt="" />
                </div>
                <div>
                    <h1 className='text-white font-bold text-4xl mb-4'>{data?.name_eng}</h1>
                    <p className='text-white/95 font-medium text-lg'>{data?.address}</p>
                </div>
            </div>
            {/* Basic Info */}
            <div className='mt-16 grid grid-cols-3 gap-2'>
                {/* Institution eiin*/}
                <div className='p-10 rounded-xl bg-[#1e2939d8] flex flex-col items-center justify-center gap-2'>
                    <FaRegIdCard className='text-white text-2xl'/>
                    <h1 className='text-white font-bold text-3xl'>Institution EIIN</h1>
                    <p className='text-white text-lg font-medium'>{data?.eiin}</p>
                </div>
                {/* Academic Year */}
                <div className='p-10 rounded-xl bg-[#1e2939d8] flex flex-col items-center justify-center gap-2'>
                    <MdDateRange className='text-white text-2xl' />
                    <h1 className='text-white font-bold text-3xl'>Academic Year</h1>
                    <p className='text-white text-lg font-medium'>{new Date().getFullYear()}</p>
                </div>
                {/* Total Teacher */}
                <div className='p-10 rounded-xl bg-[#1e2939d8] flex flex-col items-center justify-center gap-2'>
                    <FaChalkboardTeacher className='text-white text-2xl' />
                    <h1 className='text-white font-bold text-3xl'>Total Teacher</h1>
                    <p className='text-white text-lg font-medium'>{0}</p>
                </div>
                {/* Total Student */}
                <div className='p-10 rounded-xl bg-[#1e2939d8] flex flex-col items-center justify-center gap-2'>
                    <PiStudentFill className='text-white text-2xl' />
                    <h1 className='text-white font-bold text-3xl'>Total Student</h1>
                    <p className='text-white text-lg font-medium'>{0}</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardComponentChild;