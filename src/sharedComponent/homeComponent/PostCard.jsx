import React, { useState } from 'react';

export default function PostCard({ post }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const displayedImages = post.images?.slice(0, isExpanded ? post.images.length : 4) || [];
    const hasExtraImages = post.images && post.images.length > 4;

    return (
        <div className="rounded-xl p-4 bg-white" style={{boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px'}}>
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

            {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                    {displayedImages.map((image, index) => (
                        <div key={image.id} className="relative">
                            <img
                                src={image.image_link}
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

            {(post.description.length > 200 || hasExtraImages) && (
                <button
                    onClick={toggleExpand}
                    className="text-blue-600 text-sm font-medium"
                >
                    {isExpanded ? 'Show Less' : 'Know More'}
                </button>
            )}
        </div>
    );
}
