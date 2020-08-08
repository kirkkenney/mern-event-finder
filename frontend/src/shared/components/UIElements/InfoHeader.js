import React from 'react';
import './InfoHeader.css';
import { useHistory } from 'react-router-dom';
import Button from './../FormElements/Button';

const InfoHeader = props => {
    const history = useHistory();

    const acceptWarningHandler = () => {
        history.goBack();
    }

    return (
        <div className='info-header'>
            <h1> {props.text} </h1>
            <Button onClick={acceptWarningHandler}>Ok</Button>
        </div>
    )
}

export default InfoHeader