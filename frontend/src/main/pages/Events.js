import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './Events.css';
import { useHttpClient } from './../../shared/hooks/http-hook';
import EventList from '../components/EventList';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from './../../shared/components/UIElements/ErrorModal';

const BACKEND_URL = `${process.env.REACT_APP_BACKEND_URL}/api/events`

const Events = props => {

    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    }

    const query = useQuery();
    const params = {
        postcode: query.get('postcode').replace(/\s/g, ""),
        date: query.get('date'),
        distance: query.get('distance')
    }

    // paramsRef used to store params object - if params passed directly to useEffect dependency, component will infinitely re-render
    const paramsRef = useRef(params)

    const [loadedEvents, setLoadedEvents] = useState();
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    // useEffect hook ensures that the function contained within it is only called  when component mounts, or when one of the conditions passed to the array changes
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const responseData = await sendRequest(
                    `${BACKEND_URL}/?postcode=${paramsRef.current.postcode}&distance=${paramsRef.current.distance}&date=${paramsRef.current.date}`
                );
                setLoadedEvents(responseData.events.sort((a, b) => {
                    return a.distance - b.distance
                }))
            } catch (err) {}
        };
        fetchEvents();
    }, [sendRequest, paramsRef])


    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className='loading'>
                    <LoadingSpinner asOverlay />
                </div>
            )}
            {!isLoading && loadedEvents && <EventList items={loadedEvents} postcode={params.postcode} />}
        </React.Fragment>
    )
}

export default Events