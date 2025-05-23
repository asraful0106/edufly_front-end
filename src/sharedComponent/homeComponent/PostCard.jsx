import React, { useState } from 'react';
import { BsThreeDotsVertical } from "react-icons/bs";
import { RxCross2 } from "react-icons/rx";

export default function PostCard({ post }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFeatureExpanded, setIsFeatureExpanded] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [isUpdateLoading, setIsUpdateLoading] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);
    const toggleFeatureExpand = () => {
        setIsFeatureExpanded(!isFeatureExpanded);
        // console.log("Feature: ", isFeatureExpanded)
    }

    const handeleUpdateButton = () => {
        setIsUpdate(true);
        setIsFeatureExpanded(false);
    }

    const handlePostDelete = () => {

    }

    const displayedImages = post.images?.slice(0, isExpanded ? post.images.length : 4) || [];
    const hasExtraImages = post.images && post.images.length > 4;

    return (
        <div className="rounded-xl p-4 bg-white relative" style={{ boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' }}>
            {/* action section */}
            <div className='absolute right-2 top-4'>
                <div className='relative'>
                    <div className='flex items-center gap-4'>
                        {/* Button for Update the post */}
                        {
                            isUpdate &&
                            <button className='py-2 px-4 bg-blue-600 text-white font-semibold rounded'>{
                                isUpdateLoading ? <span className="loading loading-spinner loading-xs"></span>
                                    : "Save"
                            }</button>
                        }
                        {
                            isUpdate ?
                                <div className='p-2 rounded-full hover:bg-black/5 hover:cursor-pointer' onClick={() => setIsUpdate(false)} >
                                    <RxCross2 />
                                </div>
                                :
                                <div className='p-2 rounded-full hover:bg-black/5 hover:cursor-pointer' onClick={toggleFeatureExpand} >
                                    <BsThreeDotsVertical />
                                </div>
                        }
                    </div>
                    {
                        isFeatureExpanded &&
                        <div className='flex flex-col gap-2 p-4 bg-white shadow-2xl rounded-xl absolute right-2 top-12 z-10'>
                            <button className='p-2 hover:bg-blue-600/10 rounded hover:cursor-pointer'>{
                                isDeleteLoading ? <span className="loading loading-spinner loading-xs"></span>
                                    : "Delete"
                            }</button>
                            <button onClick={handeleUpdateButton} className='p-2 hover:bg-blue-600/10 rounded hover:cursor-pointer'>Update</button>
                        </div>
                    }
                </div>
            </div>


            <h2 className="text-lg font-semibold mb-1">{post.title}</h2>
            <p className="text-sm text-gray-500 mb-2">
                {new Date(post.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}
            </p>
            <p className="text-gray-700 mb-3">
                {isExpanded || post.description.length <= 200
                    ? post.description
                    : post.description.slice(0, 200) + '...'}
            </p>
            {(post.description.length > 200 || hasExtraImages) && (
                <button
                    onClick={toggleExpand}
                    className="text-blue-600 text-sm font-medium mt-0 pt-0 mb-4 "
                >
                    {isExpanded ? 'Show Less' : 'Know More'}
                </button>
            )}

            {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                    {displayedImages.map((image, index) => (
                        <div key={image.id} className="relative">
                            <img
                                src={`${import.meta.env.VITE_BACKEND_LINK}/image/${image.image_link}`}
                                alt={post.title}
                                className="h-32 w-full object-cover rounded-md"
                            />
                            {!isExpanded && hasExtraImages && index === 3 && (
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-md text-white font-semibold text-sm">
                                    +{post.images.length - 4} more
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
