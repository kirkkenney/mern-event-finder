import React, { useState, useEffect } from 'react';
import './Home.css';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { enGB } from 'date-fns/esm/locale';
import Button from '../../shared/components/FormElements/Button';
import { useHistory } from 'react-router-dom';
import { useHttpClient } from './../../shared/hooks/http-hook';
import EventList from '../components/EventList';
import Modal from '../../shared/components/UIElements/Modal';

const BACKEND_URL = `${process.env.REACT_APP_BACKEND_URL}/api/events`

const Home = props => {

    // registerLocale localises date format so that week starts on Monday (for usage in DatePicker component)
    registerLocale('en-GB', enGB);
    const history = useHistory();

    const [startDate, setStartDate] = useState(new Date());
    const [showModal, setShowModal] = useState(true);
    const [formState, setFormState] = useState({
        'postcode': '',
        'distance': '5'
    });
    const [loadedEvents, setLoadedEvents] = useState();
    const { isLoading, sendRequest } = useHttpClient();

    // useEffect hook ensures that the function contained within it is only called  when component mounts, or when one of the conditions passed to the array changes
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const responseData = await sendRequest(`${BACKEND_URL}/today`);
                setLoadedEvents(responseData.events.length > 0 ? responseData.events : false)
            } catch (err) {}
        };
        fetchEvents()
    }, [sendRequest])

    // update formState when a form input changes
    const formChangeHandler = event => {
        const target = event.target.name
        setFormState({
            ...formState,
            [target]: event.target.value
        })
    }

    // handler for changes in DatePicker component
    const dateChangeHandler = date => {
        setStartDate(date);
    }

    const formSubmitHandler = event => {
        event.preventDefault();
        // reformat date string so that it can more easily be read as a Date object by the backend
        const date = `${startDate.getFullYear()}-${startDate.getMonth()+1}-${startDate.getDate()}`
        const postcode = formState.postcode.replace(/\s/g, "").toLowerCase();
        if (postcode.length < 5) {
            return
        }
        history.push(`/events?postcode=${postcode}&date=${date}&distance=${formState.distance}`)
    }

    const clearModalHandler = () => {
        setShowModal(false);
    }

    return (
        <React.Fragment>
            {showModal && (
                <Modal
                show={showModal}
                onCancel={clearModalHandler}
                class={'no-fixed'}
                header={'Welcome to my MERN Event Finder app!'}
                footer={
                    <React.Fragment>
                        <Button onClick={clearModalHandler}>Ok</Button>
                    </React.Fragment>
                    }
                >
                    <p>The purpose of this app is to find events with given location, date and distance parameters. I.e. it is for those occasions when you are relaxing with a friend or loved one, and want to do <strong>something</strong>, but just not quite sure what.</p>
                    <p>This app is solely intended to demonstrate my skills with the MERN stack, and as such I have created "dummy" vendors, with events happening every Friday, Saturday and Sunday within varying distances of CT201EU.</p>
                    <p>Alternatively you can create your own dummy vendor to see the app in action.</p>
                    <p>Thanks.</p>
                </Modal>
            )}
            <div className='landing'>
                <div className='home-hero'>
                    <img src='img\summer-drinks-transparent@2x.png' alt='Cocktail' />
                    <h1>MAKE <span>PLANS</span> </h1>
                    <h2>Find events happening near you.</h2>
                </div>
                <div className='home-form'>
                    <form noValidate onSubmit={formSubmitHandler}>
                        <div className='home-form-row'>
                            <label htmlFor='postcode'>Your Postcode</label>
                            <input type='text' id='postcode' name='postcode' onChange={formChangeHandler}></input>
                        </div>
                        <div className='home-form-row'>
                            <label htmlFor='date'>Date</label>
                            <DatePicker selected={startDate} onChange={date => dateChangeHandler(date)} dateFormat="d/MM/yyyy" locale="en-GB" name="date" id='date' withPortal />
                        </div>
                        <div className='home-form-row'>
                            <label htmlFor='distance'>Distance</label>
                            <select name="distance" id='distance' onChange={formChangeHandler}>
                                <option value="5">5 miles</option>
                                <option value="10">10 miles</option>
                                <option value="15">15 miles</option>
                                <option value="20">20 miles</option>
                                <option value="30">30 miles</option>
                                <option value="50">50 miles</option>
                            </select>
                        </div>
                        <Button type='submit'>
                            Search
                        </Button>
                    </form>
                </div>
            </div>
            <div className='events'>
                {isLoading && (
                    <h1 className='home-list-text'>Getting events for today ...</h1>
                )}
                {!isLoading && !loadedEvents && (
                    <h1 className='home-list-text'>No events found for today. Use the form above to narrow down your search.</h1>
                )}
                {!isLoading && loadedEvents && (
                    <EventList items={loadedEvents} />
                )}
            </div>
        </React.Fragment>
    )
}

export default Home