import { createContext } from 'react';

export const AuthContext = createContext({
    isLoggedIn: false,
    userId: null,
    userAddress: null,
    userPostcode: null,
    token: null,
    login: () => {},
    logout: () => {}
})