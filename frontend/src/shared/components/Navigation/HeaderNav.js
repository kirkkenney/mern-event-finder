import React, { useState } from 'react';
import Header from './Header';
import { Link } from 'react-router-dom';
import './HeaderNav.css';
import NavLinks from './NavLinks';
import MobHeader from './MobHeader';


const HeaderNav = props => {
    const [mobHeaderIsOpen, setMobMenuIsOpen] = useState(false);

    const mobMenuHandler = () => {
        setMobMenuIsOpen(!mobHeaderIsOpen);
    }

    return (
        <React.Fragment>
            <MobHeader
            show={mobHeaderIsOpen}
            onClick={mobMenuHandler}>
                <nav className='main-header-mob'>
                    <NavLinks />
                </nav>
            </MobHeader>
            <Header>
                <div className='header-branding'>
                    <Link to='/'>
                        <img src='/img/logo1.png' alt='Logo' />
                    </Link>
                </div>
                <div className={`main-header-menu-btn ${mobHeaderIsOpen && 'mob-menu-open'}`} onClick={mobMenuHandler}>
                    <div></div>
                </div>
                <nav className='main-header-navlinks'>
                    <NavLinks />
                </nav>
            </Header>
        </React.Fragment>
    )

}

export default HeaderNav