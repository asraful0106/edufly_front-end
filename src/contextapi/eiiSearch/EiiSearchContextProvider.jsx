import React, { useState, useCallback } from 'react';
import EiiContext from './EiiSearchContext';
import axios from 'axios';

const EiiSearchContextProvider = ({ children }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (url) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(url);
            if (response?.data?.message) {
                setError(response?.data?.message);
            } else {
                setData(response.data);
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Error fetching data');
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <EiiContext.Provider value={{ data, loading, error, fetchData, setData }}>
            {children}
        </EiiContext.Provider>
    );
};

export default EiiSearchContextProvider;
