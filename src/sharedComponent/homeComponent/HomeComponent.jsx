import React, { useContext } from 'react';
import EiiContext from '../../contextapi/eiiSearch/EiiSearchContext';
import { MdOutlinePostAdd } from "react-icons/md";
import PostContext from '../../contextapi/post/PostContext';
import PostCard from './PostCard';

const HomeComponent = () => {
    const { data } = useContext(EiiContext);
    const foundingDate = new Date(data?.founding_date);

    // data from Post Context
    const { postLoading, postError, postData, fetchPostData } = useContext(PostContext);
    if(!postData){
        fetchPostData('/public/fakeData/post.json');
    }

    return (
        <div>
            {/* Institution Cover Image */}
            <div className='w-full h-[500px]'>
                <img className='w-full h-[500px] object-cover' src="/public/cover_image.jpg" alt="" />
            </div>


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
                            Create New Post
                        </button>
                    </div>
                </div>
            </div>


            {/* Post part */}
            <div className='w-full flex justify-center items-center'>
                <div className="p-4 grid gap-6 mt-20 max-w-[80%]">
                    {postLoading && <p>Loading posts...</p>}
                    {postError && <p className="text-red-600">Error loading posts.</p>}
                    {!postLoading && !postError && postData?.length === 0 && (
                        <p>No posts available.</p>
                    )}
                    {!postLoading && !postError && postData?.length > 0 && postData.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            </div>


        </div>
    );
};

export default HomeComponent;