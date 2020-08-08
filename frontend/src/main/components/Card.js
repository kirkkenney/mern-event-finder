import React from 'react';
import './Card.css';
import Button from '../../shared/components/FormElements/Button';

const Card = props => {
    const date = new Date(props.date);
    return (
        <div className='event-card'>
            <div className='card-top'>
                <div className='card-head'>
                    <h1> {props.event} </h1>
                    <h2>
                        <a href={`/vendor/${props.vendorId}`}> {props.vendor} </a>
                    </h2>
                </div>
                <div className='card-img-container'>
                    <img src={props.photo} alt={props.title} />
                </div>
            </div>
            <div className='card-body'>
                <p> {props.description} </p>
            </div>
            <div className='card-footer'>
                <div className='card-footer-details'>
                    <p> {props.time} </p>
                    <p> {date.toLocaleDateString('en-GB')} </p>
                    <p> {props.address}</p>
                    <p> {props.postcode} </p>
                    {props.distance && (
                        <p> {props.distance.toFixed(1)}miles from {props.queryPostcode.toUpperCase()} </p>
                    )}
                </div>
                <div className='card-footer-action'>
                    <Button size='small' href={`/event/${props.id}`}>
                        View Event
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Card