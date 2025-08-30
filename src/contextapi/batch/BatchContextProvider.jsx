import { useCallback, useState } from 'react';
import BatchContext from './BatchContext';
import axios from 'axios';
import { method } from 'lodash';

const BatchContextProvider = ({ children }) => {
    const [batchIsLoading, setBatchIsLoading] = useState(false);
    const [batchError, setBatchError] = useState(null);
    const [batchData, setBatchData] = useState(null);
    const [batchCreateLoading, setBatchCreateLoading] = useState(false);

    const fetchAllBatch = useCallback(async (url, institution_id) => {
        setBatchIsLoading(true);
        setBatchError(null);
        try {
            const response = await axios.get(url, {
                params: { institution_id }
            });
            if (response?.data) {
                setBatchData(response.data.data);
            } else {
                setBatchData(response?.data);
            }
        } catch (err) {
            setBatchError(err.response?.data?.message || "Error fetching data");
        } finally {
            setBatchIsLoading(false);
        }
    }, [])
    return (
        <BatchContext.Provider value={{ batchCreateLoading, batchIsLoading, batchError, batchData, fetchAllBatch }}>
            {children}
        </BatchContext.Provider>
    );
};

export default BatchContextProvider;