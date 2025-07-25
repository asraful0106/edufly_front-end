import React, { useCallback, useState } from 'react';
import axios from 'axios';
import FullTeacherInfoCotext from './fullTeacherInfoContext';

const FullTeacherInfoContextProvider = ({ children }) => {
    const [fullTeacherData, setFullTeacherData] = useState(null);
    const [fullTeacherLoading, setFullTeacherLoading] = useState(false);
    const [fullTeacherError, setFullTeacherError] = useState(null);

    const featchFullTeacherData = useCallback(async (url) => {
        setFullTeacherLoading(true);
        setFullTeacherError(null);
        try {
            const response = await axios.get(url);
            setFullTeacherData(response?.data?.data);
        } catch (err) {
            setFullTeacherError(err.response?.data?.message || "Error fetching data");
        } finally {
            setFullTeacherLoading(false);
        }
    }, []);

    return (
        <FullTeacherInfoCotext.Provider value={{ fullTeacherData, setFullTeacherData, fullTeacherError, setFullTeacherError, fullTeacherLoading, setFullTeacherLoading, featchFullTeacherData }}>
            {children}
        </FullTeacherInfoCotext.Provider>
    );
};

export default FullTeacherInfoContextProvider;