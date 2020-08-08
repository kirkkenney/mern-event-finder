import React, { useContext, useEffect, useState } from 'react';
import './CreateEvent.css';
import Input from './../../shared/components/FormElements/Input';
import { VALIDATOR_REQUIRE, VALIDATOR_MAXLENGTH } from './../../shared/util/validators';
import { AuthContext } from './../../shared/context/auth-context';
import { useForm } from './../../shared/hooks/form-hook';
import Button from '../../shared/components/FormElements/Button';
import { useHttpClient } from './../../shared/hooks/http-hook';
import LoadingSpinner from './../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from './../../shared/components/UIElements/ErrorModal';
import { useParams, useHistory } from 'react-router-dom';
import FormContainer from '../../shared/components/FormElements/FormContainer';
import InfoHeader from './../../shared/components/UIElements/InfoHeader';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';

const BACKEND_URL = `${process.env.REACT_APP_BACKEND_URL}/api/events`

const EditEvent = () => {
    const auth = useContext(AuthContext);
    const [loadedEvent, setLoadedEvent] = useState();
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const history = useHistory();
    const eventId = useParams().id;
    const [useBusinessAddress, setUseBusinessAddress] = useState();
    const [formState, inputHandler, setFormData] = useForm({
        title: {
            value: '',
            isValid: false
        },
        description: {
            value: '',
            isValid: false
        },
        address: {
            value: auth.userAddress,
            isValid: true
        },
        postcode: {
            value: auth.userPostcode,
            isValid: true
        },
        date: {
            value: new Date(),
            isValid: true
        },
        time: {
            value: '',
            isValid: false
        },
        image: {
            value: null,
            isValid: true
        }
    }, false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const responseData = await sendRequest(
                    `${BACKEND_URL}/${eventId}`
                );
                setLoadedEvent(responseData.event);
                // if Event address is stored in DB with null value, then Vendor address is being used instead
                setUseBusinessAddress(responseData.event.address === null ? true : false)
                setFormData({
                    title: {
                        value: responseData.event.title,
                        isValid: true
                    },
                    description: {
                        value: responseData.event.description,
                        isValid: true
                    },
                    address: {
                        value: responseData.event.address || '',
                        isValid: true
                    },
                    postcode: {
                        value: responseData.event.postcode || '',
                        isValid: true
                    },
                    date: {
                        value: new Date(responseData.event.date),
                        isValid: true
                    },
                    time: {
                        value: responseData.event.time,
                        isValid: true
                    },
                    image: {
                        value: responseData.event.photo,
                        isValid: true
                    }
                }, true)
            } catch (err) {}
        }
        fetchEvent();
    }, [sendRequest, eventId, setFormData]);

    const useBusinessAddressHandler = event => {
        setUseBusinessAddress(event.target.checked);
    }

    const formSubmitHandler = async event => {
        event.preventDefault();
        const { title, description, address, postcode, date, time, image } = formState.inputs
        const dateReformatted = `${date.value.getFullYear()}-${date.value.getMonth()+1}-${date.value.getDate()}`;
        try {
            const formData = new FormData();
            formData.append('title', title.value);
            formData.append('description', description.value);
            formData.append('address', useBusinessAddress ? '' : address.value);
            formData.append('postcode', useBusinessAddress ? '' : postcode.value);
            formData.append('date', dateReformatted);
            formData.append('time', time.value);
            formData.append('image', image.value);
            await sendRequest(
                `${BACKEND_URL}/${loadedEvent.id}`,
                'PATCH',
                formData,
                { 'Authorization': `Bearer ${auth.token}` }
            )
            history.push(`/event/${loadedEvent.id}`)
        } catch (err) {}
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className='loading'>
                    <LoadingSpinner asOverlay />
                </div>
            )}
            {!isLoading && !loadedEvent && (
                <InfoHeader text='No event found ...' />
            )}
            {!isLoading && loadedEvent && loadedEvent.vendor.id !== auth.userId && (
                <InfoHeader text='You do not have permission to edit this event.' />
            )}
            {!isLoading && loadedEvent && loadedEvent.vendor.id === auth.userId && (
                <div className='form-page'>

                    <FormContainer title={`Edit ${loadedEvent.title}`} formCard={true} onSubmit={formSubmitHandler}>

                        <Input element='input' id='title' type='text' label='Event Title' errorText='Please provide a title for the event' validators={[VALIDATOR_REQUIRE()]} onInput={inputHandler} initialValue={loadedEvent.title} initialIsValid={true} />
                        
                        <Input id='description' label='Event Description' errorText='Please provide a description for the event, with a maximum of 100 characters.' rows='5' validators={[VALIDATOR_MAXLENGTH(180)]} onInput={inputHandler} initialValue={loadedEvent.description} initialIsValid={true} />

                        <div className='checkbox-control'>
                            <input type='checkbox' id='useBusinessAddress' onChange={useBusinessAddressHandler} defaultChecked={useBusinessAddress} />
                            <label htmlFor='useBusinessAddress'>Use Business Address</label>
                        </div>

                        {!useBusinessAddress && (
                            <Input element='input' id='address' type='text' label='Event Address' errorText='Please provide an address for the event' validators={[VALIDATOR_REQUIRE()]}  onInput={inputHandler} initialValue={loadedEvent.address ? loadedEvent.address: ''} initialIsValid={true} />
                        )}

                        {!useBusinessAddress && (
                            <Input element='input' id='postcode' type='text' label='Event Postcode' errorText='Please provide a postcode for the event' validators={[VALIDATOR_REQUIRE()]} onInput={inputHandler} initialValue={loadedEvent.postcode ? loadedEvent.postcode.toUpperCase() : null} initialIsValid={true} />
                        )}

                        <Input element='input' type='date' id='date' label='Event Date' initialValue={new Date(loadedEvent.date)} initialIsValid={true} onInput={inputHandler} validators={[]} />

                        <Input element='input' id='time' type='text' label='Event Time' errorText='Please specify what time the event is taking place' validators={[VALIDATOR_REQUIRE()]} onInput={inputHandler} initialValue={loadedEvent.time} initialIsValid={true} />

                        <ImageUpload id='image' isValid={true} onInput={inputHandler} currentImg={loadedEvent.photo} btnText={'Change Event Photo'} errorText='Image must be JPG, JPEG or PNG and not larger than 1MB.' />

                        <Button type="submit" disabled={!formState.isValid}>
                            SEND
                        </Button>

                    </FormContainer>
                </div>
            )}
        </React.Fragment>
    )
}

export default EditEvent