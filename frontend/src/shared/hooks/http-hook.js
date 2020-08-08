import { useState, useEffect, useRef, useCallback } from 'react';

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    // if a user makes an http request and then switches component before it finishes, an error will be returned. To avoid this issue, ongoing http requests are stored in useRef, and can later be aborted if component is unmounted
    const activeHttpRequests = useRef([]);
    // useCallback wraps the function to avoid infinite loops when component that uses this hook re-renders
    const sendRequest = useCallback(
        async (url, method='GET', body=null,headers={}) => {
            setIsLoading(true);
            // register a new AbortController to abort http request if component unmounted
            const httpAbortCtrl = new AbortController();
            // push AbortController to activeHttpRequests const above
            activeHttpRequests.current.push(httpAbortCtrl);
            try {
                // attempt to fetch data from server and convert to JSON
                const response = await fetch(url, {method, body, headers, signal: httpAbortCtrl.signal});
                const responseData = await response.json();
                // filter activeHttpRequests to remove current request
                activeHttpRequests.current = activeHttpRequests.current.filter(
                    reqCtrl => reqCtrl !== httpAbortCtrl
                );
                if (!response.ok) {
                    throw new Error(responseData.message)
                };
                setIsLoading(false);
                return responseData;
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
                throw err;
            }
        }, []
    );

    const clearError = () => {
        setError(null);
    };

    // useEffect used so that this is not reevaluated every time that this hook is called. Within the useEffect function, each abortCtrl stored in the activeHttpRequests const is aborted if user unmounts a component before http request has finished
    useEffect(() => {
        return () => {
            activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort())
        }
    }, []);

    return { isLoading, error, sendRequest, clearError }
}