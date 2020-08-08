import React, { useContext, useState, useEffect} from 'react';
import Input from './../../shared/components/FormElements/Input';
import { VALIDATOR_REQUIRE, VALIDATOR_EMAIL, VALIDATOR_MINLENGTH } from './../../shared/util/validators';
import { AuthContext } from './../../shared/context/auth-context';
import { useForm } from './../../shared/hooks/form-hook';
import Button from '../../shared/components/FormElements/Button';
import { useHttpClient } from './../../shared/hooks/http-hook';
import LoadingSpinner from './../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from './../../shared/components/UIElements/ErrorModal';
import { useParams, useHistory } from 'react-router-dom';
import FormContainer from './../../shared/components/FormElements/FormContainer';
import InfoHeader from './../../shared/components/UIElements/InfoHeader';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';

const BACKEND_URL = `${process.env.REACT_APP_BACKEND_URL}/api/vendors`

const EditVendor = () => {

    const vendorId = useParams().id;
    const auth = useContext(AuthContext);
    const [loadedVendor, setLoadedVendor] = useState();
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const history = useHistory();
    const [formState, inputHandler, setFormData] = useForm({
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
        'image': {
            value: null,
            isValid: true
        }
    }, false);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const responseData = await sendRequest(
                    `${BACKEND_URL}/${vendorId}/'future'`
                );
                setLoadedVendor(responseData.vendor);
                setFormData({
                    'vendor': {
                        value: responseData.vendor.name,
                        isValid: true
                    },
                    'email': {
                        value: responseData.vendor.email,
                        isValid: true
                    },
                    'address': {
                        value: responseData.vendor.address,
                        isValid: true
                    },
                    'postcode': {
                        value: responseData.vendor.postcode.toUpperCase(),
                        isValid: true
                    },
                    'image': {
                        value: responseData.vendor.photo,
                        isValid: true
                    }
                }, true)
            } catch (err) {}
        }
        fetchVendor();
    }, [sendRequest, vendorId, setFormData]);

    const formSubmitHandler = async event => {
        event.preventDefault();
        const { vendor, email, address, postcode, image } = formState.inputs
        try {
            const formData = new FormData();
            formData.append('vendor', vendor.value);
            formData.append('email', email.value);
            formData.append('address', address.value);
            formData.append('postcode', postcode.value);
            formData.append('image', image.value);
            await sendRequest(
                `${BACKEND_URL}/${loadedVendor.id}`,
                'PATCH',
                formData,
                { 'Authorization': `Bearer ${auth.token}`}
            )
            history.push(`/vendor/${loadedVendor.id}`)
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
            {!isLoading && !loadedVendor && (
                <InfoHeader text='No vendor found ...' />
            )}
            {!isLoading && loadedVendor && loadedVendor.id !== auth.userId && (
                <InfoHeader text="You do not have permission to edit this vendor's details" />
            )}
            {!isLoading && loadedVendor && loadedVendor.id === auth.userId && (
                <FormContainer formCard={true} onSubmit={formSubmitHandler} title='Update Business Details'>

                    <Input element='input' id='vendor' type='text' label='Business Name' errorText='This field is required' validators={[VALIDATOR_REQUIRE()]} onInput={inputHandler} initialValue={loadedVendor.name} initialIsValid={true} />

                    <Input element='input' id='email' type='email' label='Business Email' errorText='Please provide a valid email address' validators={[VALIDATOR_EMAIL()]} onInput={inputHandler} initialValue={loadedVendor.email} initialIsValid={true} />

                    <Input element='input' id='address' type='text' label='Business Address' errorText='Please provide a valid address' validators={[VALIDATOR_MINLENGTH(10)]} onInput={inputHandler} initialValue={loadedVendor.address} initialIsValid={true} />

                    <Input element='input' id='postcode' type='text' label='Business Postcode' errorText='Please provide a valid postcode' validators={[VALIDATOR_MINLENGTH(4)]} onInput={inputHandler} initialValue={loadedVendor.postcode} initialIsValid={true} />

                    <ImageUpload id='image' isValid={true} onInput={inputHandler} currentImg={loadedVendor.photo} btnText={'Change Business Photo'} />

                    <Button type='submit' disabled={!formState.isValid}>
                    Update Account
                    </Button>

                </FormContainer>
            )}

        </React.Fragment>
    )
}

export default EditVendor;