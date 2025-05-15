import React, { useState } from 'react';
import PostModalContext from './PostModalContext';

const PostModalContextProvider = ({children}) => {
    const [postModal, setPostModal] = useState(false);
    return (
        <PostModalContext.Provider value={{postModal, setPostModal}}>
            {children}
        </PostModalContext.Provider>
    );
};

export default PostModalContextProvider;