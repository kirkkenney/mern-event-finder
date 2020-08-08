import React, { useContext } from 'react';
import './Login.css';
import Button from '../../shared/components/FormElements/Button';
import { useHttpClient } from './../../shared/hooks/http-hook';
import { AuthContext } from './../../shared/context/auth-context';
import LoadingSpinner from './../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from './../../shared/components/UIElements/ErrorModal';
import Input from './../../shared/components/FormElements/Input';
import { VALIDATOR_EMAIL } from '../../shared/util/validators';
import { VALIDATOR_REQUIRE } from './../../shared/util/validators';
import { useForm } from './../../shared/hooks/form-hook';
import FormContainer from './../../shared/components/FormElements/FormContainer';

const BACKEND_URL = `${process.env.REACT_APP_BACKEND_URL}/api/vendors`

const Login = () => {

    const auth = useContext(AuthContext);

    const [formState, inputHandler] = useForm({
        email: {
            value: '',
            isValid: false
        },
        password: {
            value: '',
            isValid: false
        }
    }, false)


    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const formSubmitHandler = async event => {
        event.preventDefault();
        try {
            const responseData = await sendRequest(
                `${BACKEND_URL}/login`,
                'POST',
                JSON.stringify({ email: formState.inputs.email.value, password: formState.inputs.password.value }),
                { 'Content-Type': 'application/json' }
            );
            auth.login(responseData.userId, responseData.token, responseData.address, responseData.postcode)
        } catch (err) {};
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && <LoadingSpinner asOverlay />}
            <div className='form-page'>
                <FormContainer title='Login' formCard={true} onSubmit={formSubmitHandler}>

                <Input element='input' id='email' type='email' label='Your Email' errorText='Please provide your email address' validators={[VALIDATOR_EMAIL()]} onInput={inputHandler} />

                <Input element='input' id='password' type='password' label='Your Password' errorText='Please enter your password' validators={[VALIDATOR_REQUIRE()]} onInput={inputHandler} />

                <Button type='submit' disabled={!formState.isValid}>
                    Login
                </Button>

                </FormContainer>
            </div>
        </React.Fragment>

    )
}

export default Login