import React from 'react';
import './VendorProfile.css';

const VendorProfile = props => {
    return (
        <div className='vendor-profile'>
            <div className='vendor-body'>
                <h1> {props.vendor} </h1>
                <p> {props.address} </p>
                <p> {props.postcode.toUpperCase()} </p>
                <p> {props.email} </p>
            </div>
            <div className='vendor-img'>
                <img src={props.photo} alt={props.photo} />
            </div>
        </div>
    )
}

export default VendorProfile