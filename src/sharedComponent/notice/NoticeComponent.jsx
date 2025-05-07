import React, { useContext } from 'react';
import EiiContext from '../../contextapi/eiiSearch/EiiSearchContext';
import { MdOutlinePostAdd } from "react-icons/md";

const NoticeComponent = () => {
    const { data } = useContext(EiiContext);
    const foundingDate = new Date(data?.founding_date);
    return (
        <div>
            {/* Institution Cover Image */}
            <div
                className="hero min-h-[500px]"
                style={{
                    backgroundImage:
                        "url(/public/cover_image.jpg)",
                }}
            >
                <div className="hero-overlay"></div>
                <div className="hero-content text-neutral-content text-center">
                    <div className="max-w-md">
                        <h1 className="mb-5 text-5xl font-bold uppercase">Latest Notice</h1>
                        <p className="mb-5">
                            Don’t miss out—what you need to know starts here.
                        </p>
                    </div>
                </div>
            </div>
            {/* <div className='w-full h-[500px]'>
                <img className='w-full h-[500px] object-cover' src="/public/cover_image.jpg" alt="" />
            </div> */}
            <div className='p-4'>
                {/* Institution Name */}
                <div className='flex items-center justify-between'>
                    {/* logo */}
                    <div className='flex gap-4 items-center'>
                        <div className="avatar">
                            <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring-2 ring-offset-2">
                                <img src="/public/agrani_logo.jpeg" />
                            </div>
                        </div>
                        {/* Name */}
                        <div>
                            <h1 className='text-3xl font-bold'>{data?.name_eng}</h1>
                            <p>EST. {foundingDate.getFullYear()}</p>
                        </div>
                    </div>
                    {/* Button For new post */}
                    <div>
                        <button className="btn bg-[#1A77F2] text-white border-[#005fd8]">
                            <MdOutlinePostAdd />
                            Create New Notice
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoticeComponent;