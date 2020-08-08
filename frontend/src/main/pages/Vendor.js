import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useHttpClient } from './../../shared/hooks/http-hook';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import './Vendor.css';
import Card from './../components/Card';
import VendorProfile from '../components/VendorProfile';
import ErrorModal from './../../shared/components/UIElements/ErrorModal';
import InfoHeader from '../../shared/components/UIElements/InfoHeader';
import Button from '../../shared/components/FormElements/Button';

const BACKEND_URL = `${process.env.REACT_APP_BACKEND_URL}/api/vendors`

const Vendor = props => {

    const [loadedVendor, setLoadedVendor] = useState();
    const [loadedEvents, setLoadedEvents]= useState();
    // Events displayed can be toggled between current/future events and past events. Set to 'future' by default which is passed to backend to retrieve current and future events.
    const [eventsTimeRef, setEventsTimeRef] = useState('future');
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const vendorId = useParams().vid;

    // useEffect hook ensures that the function contained within it is only called  when component mounts, or when one of the conditions passed to the array changes
    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const responseData = await sendRequest(
                    `${BACKEND_URL}/${vendorId}/${eventsTimeRef}`
                );
                setLoadedVendor(responseData.vendor);
                setLoadedEvents(responseData.events);
            } catch (err) {}
        };
        fetchVendor();
    }, [sendRequest, vendorId, eventsTimeRef]);

    // toggle Events between past and current/future
    const changeEventsTimeRef = () => {
        if (eventsTimeRef === 'future') {
            setEventsTimeRef('past')
        } else {
            setEventsTimeRef('future')
        }
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className='loading'>
                    <LoadingSpinner asOverlay />
                </div>
            )}
            {!isLoading && !loadedVendor && (
                <InfoHeader text='No vendor found ...' />
            )}
            {!isLoading && loadedVendor && loadedEvents && (
                <div className='vendor-page'>
                    <VendorProfile
                        vendor={loadedVendor.name}
                        photo={loadedVendor.photo}
                        address={loadedVendor.address}
                        postcode={loadedVendor.postcode}
                        email={loadedVendor.email}
                    />
                    <div className='vendor-events'>
                        <Button onClick={changeEventsTimeRef} type='button'>
                            {eventsTimeRef === 'future' ? 'See Past Events' : 'See Upcoming Events'}
                        </Button>
                        <div className='vendor-event-cards'>
                            {loadedEvents.map(event => (
                                <Card
                                key={event._id} 
                                id={event._id}
                                coords={event.coords ? event.coords : loadedVendor.coords}
                                vendor={loadedVendor.name}
                                description={event.description}
                                vendorId={loadedVendor.id}
                                event={event.title}
                                photo={event.photo ? event.photo : loadedVendor.photo}
                                date={event.date}
                                time={event.time}
                                address={event.address ? event.address : loadedVendor.address }
                                postcode={event.postcode ? event.postcode.toUpperCase() : loadedVendor.postcode.toUpperCase()}
                                />
                            ))}
                        </div>
                    </div> 
                </div>
            )}
        </React.Fragment>
    )
}

export default Vendor