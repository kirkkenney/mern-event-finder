import React, { useReducer, useEffect } from 'react';
import './Input.css';
import { validate } from './../../util/validators';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { enGB } from 'date-fns/esm/locale';

const inputReducer = (state, action) => {
    switch(action.type) {
        case 'CHANGE':
            return {
                ...state,
                value: action.value,
                isValid: validate(action.value, action.validators)
            }
        case 'TOUCH':
            return {
                ...state,
                isTouched: true
            }
        default:
            return state
    }
}

const Input = props => {

    registerLocale('en-GB', enGB);

    // useReducer allows for easier management of complex component state. Here the value, validity and isTouched properties are being dynamically managed. Below initalises the default state
    const [inputState, dispatch] = useReducer(inputReducer, {
        value: props.initialValue || '',
        isValid: props.initialIsValid || false,
        isTouched: false
    })

    const { id, onInput } = props;
    const { value, isValid } = inputState;

    useEffect(() => {
        onInput(id, value, isValid)
    }, [id, value, isValid, onInput])

    // call the useReducer "inputReducer" function when an input is changed
    const inputChangeHandler = event => {
        dispatch({
            type: 'CHANGE',
            value: event.target.value,
            validators: props.validators
        })
    }

    // call the useReducer "inputReducer" function when an input is touched - this simply ensures that error messages are displayed to the user only when input changes have been attempted, otherwise error messages would be displayed by default
    const inputTouchHandler = event => {
        dispatch({
            type: 'TOUCH'
        })
    }

    const dateChangeHandler = date => {
        dispatch({
            type: 'CHANGE',
            value: date,
            validators: props.validators
        })
    }

    const element = props.element === 'input' ? (
        props.type === 'date' ? (
            <DatePicker selected={inputState.value} onChange={dateChangeHandler} dateFormat="d/MM/yyyy" locale="en-GB" id={props.id} closeOnScroll={true} calendarClassName='date-picker' withPortal />
        ) : (
            <input type={props.type} id={props.id} placeholder={props.placeholder} onChange={inputChangeHandler} onBlur={inputTouchHandler} value={inputState.value} />
        )
    ) : (
        <textarea id={props.id} placeholder={props.placeholder} rows={props.rows} onChange={inputChangeHandler} onBlur={inputTouchHandler} value={inputState.value} />
    )

    return (
        <div className={`form-control ${inputState.isTouched && !inputState.isValid && 'input-error'}`}>
            <label htmlFor={props.id}> {props.label} </label>
            {element}
            {inputState.isTouched && !inputState.isValid && <small> {props.errorText} </small>}
        </div>
    )
}

export default Input