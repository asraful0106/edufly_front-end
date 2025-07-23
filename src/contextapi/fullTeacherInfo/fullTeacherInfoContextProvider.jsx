import React, { useCallback, useState } from 'react';
import axios from 'axios';
import FullTeacherInfoCotext from './fullTeacherInfoContext';

const FullTeacherInfoContextProvider = ({ children }) => {
    const [fullTeacherData, setFullTeacherData] = useState(null);
    const [fullTeacherLoading, setFullTeacherLoading] = useState(false);
    const [fullTeacherError, setFullTeacherError] = useState(null);

    const featchBasicTeacherData = useCallback(async (url) => {
        setFullTeacherLoading(true);
        setFullTeacherError(null);
        try {
            const response = await axios.get(url);
            if (response?.data?.message) {
                setFullTeacherData(response.data.message);
            } else {
                setFullTeacherData(response?.data);
            }
        } catch (err) {
            setFullTeacherError(err.response?.data?.message || "Error fetching data");
        } finally {
            setFullTeacherLoading(false);
        }
    }, []);

    return (
        <FullTeacherInfoCotext.Provider value={{ fullTeacherData, setFullTeacherData, fullTeacherError, setFullTeacherError, fullTeacherLoading, setFullTeacherLoading, featchBasicTeacherData }}>
            {children}
        </FullTeacherInfoCotext.Provider>
    );
};

export default FullTeacherInfoContextProvider;