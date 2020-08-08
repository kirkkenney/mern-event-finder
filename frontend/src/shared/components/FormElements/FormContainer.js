import React from 'react';
import './FormContainer.css';

const FormContainer = props => {
    return (
        <div className={`form-container ${props.formCard && 'form-card'}`}>
            {props.title && (
                <h1> {props.title} </h1>
            )}
            <form noValidate onSubmit={props.onSubmit}>
                {props.children}
            </form>
        </div>
    )
}

export default FormContainer