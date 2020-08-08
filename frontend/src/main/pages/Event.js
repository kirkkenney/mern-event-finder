import React, { useState, useEffect, useContext } from 'react';
import './Event.css';
import { useParams, useHistory } from 'react-router-dom';
import Map from './../../shared/components/UIElements/Map';
import { useHttpClient } from './../../shared/hooks/http-hook';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Button from './../../shared/components/FormElements/Button';
import { AuthContext } from './../../shared/context/auth-context';
import Modal from './../../shared/components/UIElements/Modal';
import ErrorModal from './../../shared/components/UIElements/ErrorModal';
import InfoHeader from '../../shared/components/UIElements/InfoHeader';

const BACKEND_URL = `${process.env.REACT_APP_BACKEND_URL}/api/events`

const Event = props => {

    // AuthContext is available application wide and used here to access Authentication properties on user to eg check that current user has Authorization to delete/edit etc
    const auth = useContext(AuthContext);
    const history = useHistory();
    const [loadedEvent, setLoadedEvent] = useState();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    // custom useHttpClient hook used for sending/requesting data to and from backend. Below properties are provided by the hook and accessed here
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const eventId = useParams().id;

    const showDelWarningHandler = () => {
        setShowConfirmModal(true)
    }

    const cancelDelWarningHandler = () => {
        setShowConfirmModal(false);
    }

    const confirmDelHandler = async () => {
        setShowConfirmModal(false);
        try {
            await sendRequest(
                `${BACKEND_URL}/${eventId}`,
                'DELETE',
                null,
                { 'Authorization': `Bearer ${auth.token}` }
            );
            history.goBack();
        } catch (err) {}
    }

    // useEffect hook ensures that the function contained within it is only called  when component mounts, or when one of the conditions passed to the array changes
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const responseData = await sendRequest(
                    `${BACKEND_URL}/${eventId}`
                );
                setLoadedEvent(responseData.event)
            } catch (err) {}
        };
        fetchEvent();

    }, [sendRequest, eventId])

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {loadedEvent && (
                <Modal
                show={showConfirmModal}
                onCancel={cancelDelWarningHandler}
                header={'Are you sure you want to delete this event?'}
                footer={
                    <React.Fragment>
                        <Button onClick={cancelDelWarningHandler}>NO</Button>
                        <Button danger onClick={confirmDelHandler}>YES</Button>
                    </React.Fragment>
                    }
                >
                    <h1> {loadedEvent.title} </h1>
                    <p>This action cannot be undone!</p>
                </Modal>
            )}
            {isLoading && (
                <div className='loading'>
                    <LoadingSpinner asOverlay />
                </div>
            )}
            {!isLoading && !loadedEvent && (
                <InfoHeader text='No event found ...' />
            )}
            {!isLoading && loadedEvent && (
                <div className="event-page">
                    <div className='map-container'>
                        <Map center={loadedEvent.coords ? loadedEvent.coords : loadedEvent.vendor.coords} zoom={12} />
                    </div>
                    <div className='event-body'>
                        <h1> {loadedEvent.title} </h1>
                        <h2> at <a href={`/vendor/${loadedEvent.vendor._id}`}>{loadedEvent.vendor.name}</a></h2>
                        <h3> {loadedEvent.description} </h3>
                        <h3> {loadedEvent.time} </h3>
                        <h4> {new Date(loadedEvent.date).toLocaleDateString('en-GB')} </h4>
                        <p> {loadedEvent.address ? loadedEvent.address : loadedEvent.vendor.address } </p>
                        <p> {loadedEvent.postcode ? loadedEvent.postcode.toUpperCase() : loadedEvent.vendor.postcode.toUpperCase() } </p>
                    </div>
                </div>
            )}
            {loadedEvent && loadedEvent.vendor.id === auth.userId && (
                <div className='action-buttons'>
                    <Button to={`/edit-event/${eventId}`}>EDIT</Button>
                    <Button danger onClick={showDelWarningHandler}>DELETE</Button>
                </div>
            )}
        </React.Fragment>
    )
}

export default Event