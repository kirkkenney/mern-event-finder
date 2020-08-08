import React, { useContext,useState } from 'react';
import './CreateEvent.css';
import Input from './../../shared/components/FormElements/Input';
import { VALIDATOR_REQUIRE, VALIDATOR_MAXLENGTH } from './../../shared/util/validators';
import { AuthContext } from './../../shared/context/auth-context';
import { useForm } from './../../shared/hooks/form-hook';
import Button from '../../shared/components/FormElements/Button';
import { useHttpClient } from './../../shared/hooks/http-hook';
import LoadingSpinner from './../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from './../../shared/components/UIElements/ErrorModal';
import { useHistory } from 'react-router-dom';
import FormContainer from './../../shared/components/FormElements/FormContainer';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';

const BACKEND_URL = `${process.env.REACT_APP_BACKEND_URL}/api/events`

const CreateEvent = () => {

    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const history = useHistory();
    const [useBusinessAddress, setUseBusinessAddress] = useState(false);
    const [formState, inputHandler] = useForm({
        title: {
            value: '',
            isValid: false
        },
        description: {
            value: '',
            isValid: false
        },
        address: {
            value: '',
            isValid: true
        },
        postcode: {
            value: '',
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
    }, false)

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
            formData.append('address', address.value);
            formData.append('postcode', postcode.value);
            formData.append('date', dateReformatted);
            formData.append('time', time.value);
            formData.append('image', image.value);
            await sendRequest(
                `${BACKEND_URL}`,
                'POST',
                formData,
                { 'Authorization': `Bearer ${auth.token}` }
            )
            history.push(`/vendor/${auth.userId}`)
        } catch (err) { }
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className='loading'>
                    <LoadingSpinner asOverlay />
                </div>
            )}
            {!isLoading && (
            <div className='form-page'>
                <FormContainer title='Create An Event' formCard={true} onSubmit={formSubmitHandler}>

                    <Input element='input' id='title' type='text' label='Event Title' errorText='Please provide a title for the event' validators={[VALIDATOR_REQUIRE()]} onInput={inputHandler} />
                            
                    <Input id='description' label='Event Description' errorText='Please provide a description for the event, with a maximum of 100 characters.' rows='5' validators={[VALIDATOR_MAXLENGTH(180)]} onInput={inputHandler} />

                    <div className='checkbox-control'>
                        <input type='checkbox' id='useBusinessAddress' onChange={useBusinessAddressHandler} />
                        <label htmlFor='useBusinessAddress'>Use Business Address</label>
                    </div>
                    
                    {!useBusinessAddress && (
                        <Input element='input' id='address' type='text' label='Event Address' onInput={inputHandler} validators={[]} initialIsValid={true} />
                    )}

                    {!useBusinessAddress && (
                        <Input element='input' id='postcode' type='text' label='Event Postcode' validators={[]} onInput={inputHandler} initialIsValid={true} />
                    )}

                    <Input element='input' type='date' id='date' label='Event Date' initialValue={new Date()} initialIsValid={true} onInput={inputHandler} validators={[]} />

                    <Input element='input' id='time' type='text' label='Event Time' errorText='Please specify what time the event is taking place' validators={[VALIDATOR_REQUIRE()]} onInput={inputHandler} />

                    <p>Ignore this option if you wish to use your business profile photo instead.</p>
                    <ImageUpload id='image' onInput={inputHandler} isValid={true} errorText='Image must be JPG, JPEG or PNG and not larger than 1MB.' />

                    <Button type="submit" disabled={!formState.isValid}>
                        CREATE
                    </Button>

                </FormContainer>
                {/* <div className='form-container'>
                    <h1>Create Event</h1>
                    <form noValidate onSubmit={formSubmitHandler}>
                        
                        <Input element='input' id='title' type='text' label='Event Title' errorText='Please provide a title for the event' validators={[VALIDATOR_REQUIRE()]} onInput={inputHandler} />
                        
                        <Input id='description' label='Event Description' errorText='Please provide a description for the event, with a maximum of 100 characters.' rows='5' validators={[VALIDATOR_MAXLENGTH(180)]} onInput={inputHandler} />
                        
                        <Input element='input' id='address' type='text' label='Event Address' errorText='Please provide an address for the event' validators={[VALIDATOR_REQUIRE()]} initialValue={auth.userAddress} initialIsValid={true} onInput={inputHandler} />
                        
                        <Input element='input' id='postcode' type='text' label='Event Postcode' errorText='Please provide a postcode for the event' validators={[VALIDATOR_REQUIRE()]} initialValue={auth.userPostcode.toUpperCase()} onInput={inputHandler} initialIsValid={true} />

                        <Input element='input' type='date' id='date' label='Event Date' initialValue={new Date()} initialIsValid={true} onInput={inputHandler} validators={[]} />

                        <Input element='input' id='time' type='text' label='Event Time' errorText='Please specify what time the event is taking place' validators={[VALIDATOR_REQUIRE()]} onInput={inputHandler} />

                        <Button type="submit" disabled={!formState.isValid}>
                            SEND
                        </Button>
                    </form>
                </div> */}
            </div>
            )}
        </React.Fragment>

    )
}

export default CreateEvent