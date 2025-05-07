import React from 'react';
import { HiDotsVertical } from "react-icons/hi";

const EachNotice = ({ eachData, instituteName }) => {
    return (
        <div className='w-full bg-white p-4 rounded-2xl flex justify-between gap-6'>
            <div className='w-full'>
                {/* Notice Title */}
                <h1 className='text-xl font-bold hover:underline hover:cursor-pointer hover:text-[#1A77F2]'>{eachData?.title}</h1>
                <div className='w-full flex items-center justify-between'>
                    {/* Institution Name */}
                    <p className='text-gray-600'>{instituteName}</p>
                    {/* Notice Type */}
                    <p className='text-gray-600'>{eachData?.notice_type}</p>
                    {/* Publication Date */}
                    <p className='text-gray-600'>{eachData?.created_at}</p>
                    {/* Total View */}
                    <p className='text-gray-600'>{eachData?.view}</p>
                </div>
            </div>
            <div className='ml-8 p-4 btn btn-ghost rounded-full'>
                <HiDotsVertical />
            </div>

        </div>
    );
};

export default EachNotice;