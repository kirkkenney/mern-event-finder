import React from 'react';
import Button from './../FormElements/Button';
import Modal from './Modal';


const ErrorModal = props => {
    return (
        <Modal
            header="That wasn't supposed to happen ..."
            footer={<Button onClick={props.onClear}>Okay</Button>}
            onCancel={props.onClear}
            show={!!props.error}
        >
            <p> {props.error} </p>
        </Modal>
    )
}

export default ErrorModal