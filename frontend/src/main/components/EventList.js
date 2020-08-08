import React from 'react';
import './EventList.css';
import Card from './Card';


const EventList = props => {

    if (props.items.length === 0) {
        return (
            <div>
                <h2>No events found ...</h2>
            </div>
        )
    }

    return (
        <div className='events-list'>
            {props.items.map(event => (
                <Card
                key={event._id} 
                id={event._id}
                coords={event.coords}
                vendor={event.vendor.name}
                vendorId={event.vendor._id}
                event={event.title}
                description={event.description}
                // when an Event is created, if address, postcode and photo are not passed by the user, they are set to NULL on the backed, so that when these properties are called here, if they don't exist, the Vendor details are used instead.
                photo={event.photo ? event.photo : event.vendor.photo}
                date={event.date}
                time={event.time}
                address={event.address ? event.address : event.vendor.address }
                postcode={event.postcode ? event.postcode.toUpperCase() : event.vendor.postcode.toUpperCase() }
                distance={event.distance}
                queryPostcode={props.postcode}
                />
            ))}
        </div>
    )
}


export default EventList