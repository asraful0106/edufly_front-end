import React from 'react';

const EachTeacher = ({ teacherData }) => {
    return (
        <div class="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-96">
            <div class="relative h-56 m-2.5 overflow-hidden text-white rounded-md">
                <img src={teacherData?.image} alt="teacher-image" />
            </div>
            <div class="p-4">
                <div class="flex items-center mb-2">
                    <h6 class="text-slate-800 text-xl font-semibold">
                        {teacherData?.name_eng}
                    </h6>

                    <div class="flex items-center gap-0 5 ml-auto">

                        <p class="text-slate-600 ml-1.5">{teacherData?.position}</p>
                    </div>
                </div>

                <p class="text-slate-600 leading-normal font-light">
                    {teacherData?.about}
                </p>
            </div>

            <div class="px-4 pb-4 pt-0 mt-2">
                <button class="w-full rounded-md bg-[#1A77F2] py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-[#1A77F2]/95 hover:cursor-pointer active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
                    Know More
                </button>
            </div>
        </div>
    );
};

export default EachTeacher;