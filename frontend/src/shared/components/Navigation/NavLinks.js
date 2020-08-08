import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import './NavLinks.css';
import { AuthContext } from './../../context/auth-context';

const NavLinks = props => {

    const auth = useContext(AuthContext);

    return (
        <ul className='nav-links'>
            <li> <NavLink to='/' exact>Home</NavLink> </li>
            {!auth.isLoggedIn && (
                <li> <NavLink to='/advertise' exact>Advertise</NavLink> </li>
            )}
            {!auth.isLoggedIn && (
                <li> <NavLink to='/login' exact>Login</NavLink> </li>
            )}
            {auth.isLoggedIn && (
                <li> <NavLink to='/create' exact>Add Event</NavLink> </li>
            )}
            {auth.isLoggedIn && (
                <li> <NavLink to={`/vendor/${auth.userId}`} exact>My Events</NavLink> </li>
            )}
            {auth.isLoggedIn && (
                <li> <NavLink to={`/edit-vendor/${auth.userId}`} exact>Update Details</NavLink> </li>
            )}
            {auth.isLoggedIn && (
                <li onClick={auth.logout}>Logout
                </li>
            )}
        </ul>
    )

    // const auth = useContext(AuthContext);

    // return (
    //     <ul className='nav-links'>
    //         <li> <NavLink to='/' exact>Home</NavLink> </li>
    //         {!auth.isLoggedIn && (
    //             <li> <NavLink to='/advertise' exact>Advertise</NavLink> </li>
    //             <li> <NavLink to='/login' exact>Login</NavLink> </li>
    // )}
    // )
}

export default NavLinks