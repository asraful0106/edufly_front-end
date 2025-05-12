import axios from 'axios';
import React, { useCallback, useState } from 'react';
import PostContext from './PostContext.js'


const PostContextProvider = ({children}) => {
    const [postLoading, setPostLoading] = useState(false);
    const [postError, setPostError] = useState(null);
    const [postData, setPostData] = useState(null);

    const fetchPostData = useCallback(async (url) => {
        setPostLoading(true);
        setPostError(null);

        try {
            const response = await axios.get(url);
            if (response?.data?.message) {
                setPostData(response?.data?.message);
            } else {
                setPostData(response?.data);
            }
        } catch (err) {
            setPostError(err.response?.data?.message || "Error fetching data");
        } finally {
            setPostLoading(false);
        }
    }, []);

    return (
        <PostContext.Provider value={{postLoading, postError, postData, fetchPostData}}>
            {children}
        </PostContext.Provider>
    );
};

export default PostContextProvider;