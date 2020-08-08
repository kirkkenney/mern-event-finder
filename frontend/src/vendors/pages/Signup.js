import React, { useContext } from 'react';
import './Signup.css';
import Button from '../../shared/components/FormElements/Button';
import { useHttpClient } from './../../shared/hooks/http-hook';
import { AuthContext } from './../../shared/context/auth-context';
import LoadingSpinner from './../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from './../../shared/components/UIElements/ErrorModal';
import Input from './../../shared/components/FormElements/Input';
import { VALIDATOR_EMAIL, VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH } from '../../shared/util/validators';
import { useForm } from './../../shared/hooks/form-hook';
import FormContainer from './../../shared/components/FormElements/FormContainer';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';

const BACKEND_URL = `${process.env.REACT_APP_BACKEND_URL}/api/vendors`

const Signup = () => {

    const auth = useContext(AuthContext)
    const {isLoading, error, sendRequest, clearError } = useHttpClient();
    const [formState, inputHandler] = useForm({
        'vendor': {
            value: '',
            isValid: false
        },
        'email': {
            value: '',
            isValid: false
        },
        'address': {
            value: '',
            isValid: false
        },
        'postcode': {
            value: '',
            isValid: false
        },
        'password': {
            value: '',
            isValid: false
        },
        'image': {
            value: null,
            isValid: false
        }
    }, false)

    const formSubmitHandler = async event => {
        const { vendor, email, address, postcode, password, image } = formState.inputs;
        event.preventDefault();
        if (!formState.isValid) {
            return
        } else {
            try {
                const formData = new FormData();
                formData.append('vendor', vendor.value);
                formData.append('email', email.value);
                formData.append('password', password.value);
                formData.append('address', address.value);
                formData.append('postcode', postcode.value);
                formData.append('image', image.value);
                const responseData = await sendRequest(
                    BACKEND_URL,
                    'POST',
                    formData
                )
                auth.login(responseData.userId, responseData.token, responseData.address, responseData.postcode)
            } catch (err) {}
        }
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && <LoadingSpinner asOverlay />}
            <div className='form-page'>
                <FormContainer title='Create Account' onSubmit={formSubmitHandler} formCard={true}>

                    <Input element='input' id='vendor' type='text' label='Business Name' errorText='This field is required' validators={[VALIDATOR_REQUIRE()]} onInput={inputHandler} />

                    <Input element='input' id='email' type='email' label='Business Email' errorText='Please provide a valid email address' validators={[VALIDATOR_EMAIL()]} onInput={inputHandler} />

                    <Input element='input' id='address' type='text' label='Business Address' errorText='Please provide a valid address' validators={[VALIDATOR_MINLENGTH(10)]} onInput={inputHandler} />

                    <Input element='input' id='postcode' type='text' label='Business Postcode' errorText='Please provide a valid postcode' validators={[VALIDATOR_MINLENGTH(4)]} onInput={inputHandler} />

                    <Input element='input' id='password' type='password' label='Password' errorText='Password must be at least 7 characters' validators={[VALIDATOR_MINLENGTH(7)]} onInput={inputHandler} />

                    <ImageUpload id='image' isValid={false} onInput={inputHandler} errorText='Please select a profile image for your business' />

                    <Button type='submit' disabled={!formState.isValid}>
                        Create Account
                    </Button>

                </FormContainer>
            </div>
        </React.Fragment>

    )
}

export default Signup