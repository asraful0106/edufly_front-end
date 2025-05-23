import React, { useCallback, useState } from 'react';
import BasicTeacherInfoContext from './BasicTeacherInfoContext';
import axios from 'axios';

const BasicTeacherInfoContextProvider = ({ children }) => {
    const [basicTeacherData, setBasicTeacherData] = useState(null);
    const [basicTeacherLoading, setBasicTeacherLoading] = useState(false);
    const [basicTeacherError, setBasicTeacherError] = useState(null);

    const featchBasicTeacherData = useCallback(async (url) => {
        setBasicTeacherLoading(true);
        setBasicTeacherError(null);
        try {
            const response = await axios.get(url);
            if (response?.data?.message) {
                setBasicTeacherData(response.data.message);
            } else {
                setBasicTeacherData(response?.data);
            }
        } catch (err) {
            setBasicTeacherError(err.response?.data?.message || "Error fetching data");
        } finally {
            setBasicTeacherLoading(false);
        }
    }, []);

    return (
        <BasicTeacherInfoContext.Provider value={{ basicTeacherData, setBasicTeacherData, basicTeacherError, setBasicTeacherError, basicTeacherLoading, setBasicTeacherLoading, featchBasicTeacherData }}>
            {children}
        </BasicTeacherInfoContext.Provider>
    );
};

export default BasicTeacherInfoContextProvider;