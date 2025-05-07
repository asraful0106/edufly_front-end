import axios from 'axios';
import React, { useCallback, useState } from 'react';
import NoticeContext from './NoticeContext';

const NoticeContextProvider = ({ children }) => {
    const [noticeData, setNoticeData] = useState(null);
    const [noticeLoading, setNoticeLoading] = useState(false);
    const [noticeError, setNoticeError] = useState(null);

    const fetchNoticeData = useCallback(async (url) => {
        setNoticeLoading(true);
        setNoticeError(null);

        try {
            const response = await axios.get(url);
            if (response?.data?.message) {
                setNoticeData(response?.data?.message);
            } else {
                setNoticeData(response?.data);
            }
        } catch (err) {
            setNoticeError(err.response?.data?.message || "Error fetching data");
        } finally {
            setNoticeLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <NoticeContext.Provider value={{ noticeData, noticeError, noticeLoading, fetchNoticeData }}>
            {children}
        </NoticeContext.Provider>
    );
};

export default NoticeContextProvider;