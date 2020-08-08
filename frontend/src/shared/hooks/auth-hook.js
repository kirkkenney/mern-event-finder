import { useState, useEffect, useCallback } from 'react';

let logoutTimer;

export const useAuth = () => {
    const [token, setToken] = useState(true);
    const [userId, setUserId] = useState();
    const [userAddress, setUserAddress] = useState();
    const [userPostcode, setUserPostcode] = useState();
    const [tokenExpiration, setTokenExpiration] = useState();

    // useCallback wraps the function to avoid infinite loops when component that uses this hook re-renders
    const login = useCallback((userId, token, address, postcode, expiration) => {
        setToken(token);
        setUserId(userId);
        setUserAddress(address);
        setUserPostcode(postcode);
        // tokenExpires = Date object (new Date()) consisting of:
        // current date in milliseconds (new Date().getTime()
        // + 1 hour (current date + 1000 (1 second) * 60 (1 min) * 60 (1 hour))
        // this should either be equal to existing expirationDate passed as function argument (eg for auto-login), OR a new expiration generated on initial login
        const tokenExpirationDate = expiration || new Date(new Date().getTime() + 1000 * 60 * 120);
        setTokenExpiration(tokenExpirationDate);
        localStorage.setItem('mern-event-finder', JSON.stringify({
            userId,
            token,
            address,
            postcode,
            expiration: tokenExpirationDate.toISOString()
        }))
    }, []);

    // useCallback wraps the function to avoid infinite loops when component that uses this hook re-renders
    const logout = useCallback(() => {
        setToken(null);
        setUserId(null);
        setTokenExpiration(null);
        localStorage.removeItem('mern-event-finder');
    }, []);

    useEffect(() => {
        if (token && tokenExpiration) {
            const remainingTime = tokenExpiration.getTime() - new Date().getTime();
            logoutTimer = setTimeout(logout, remainingTime);
        } else {
            clearTimeout(logoutTimer)
        }
    }, [token, logout, tokenExpiration])

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('mern-event-finder'));
        if (storedData && 
            storedData.token &&
            // check that stored expiration date is greater than now (in the future)
            new Date(storedData.expiration) > new Date()
            ) {
                login(storedData.userId, storedData.token, storedData.address, storedData.postcode, new Date(storedData.expiration));
            } else {
                setToken(false)
            }
    }, [login]);

    return {
        token,
        login,
        logout,
        userId,
        userAddress,
        userPostcode
    }
}