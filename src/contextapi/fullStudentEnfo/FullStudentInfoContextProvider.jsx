import React, { Children, useCallback, useState } from 'react';
import FullStudentInfoContext from "./FullStudentInfoContext"
import axios from 'axios';

const FullStudentInfoContextProvider = ({ children }) => {
    const [fullStudentData, setFullStudentData] = useState(null);
    const [fullStudentLoading, setFullStudentLoading] = useState(false);
    const [fullStudentError, setFullStudentError] = useState(null);

    const featchFullStudentData = useCallback(async (url) => {
        setFullStudentLoading(true);
        setFullStudentError(null);
        try {
            const response = await axios.get(url);
            setFullStudentData(response?.data?.data);
        } catch (err) {
            // setFullStudentError(err.response?.data?.message || "Error fetching data");
            setFullStudentError(err)
        } finally {
            setFullStudentLoading(false);
        }
    }, []);
    return (
        <FullStudentInfoContext.Provider value={{ fullStudentData, setFullStudentData, fullStudentError, setFullStudentError, fullStudentLoading, setFullStudentLoading, featchFullStudentData }}>
            {children}
        </FullStudentInfoContext.Provider>
    );
};

export default FullStudentInfoContextProvider;