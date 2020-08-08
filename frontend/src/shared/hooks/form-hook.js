import { useCallback, useReducer } from 'react';

const formReducer = (state, action) => {
    switch(action.type) {
        case 'INPUT_CHANGE':
            let formIsValid = true;
            for (const inputId in state.inputs) {
                // if current iteration input is same as input being assessed bu-y reducer
                if (inputId === action.inputId) {
                    formIsValid = formIsValid && action.isValid
                } else {
                    formIsValid = formIsValid && state.inputs[inputId].isValid
                }
            }
            return {
                // spread operator to return state as it currently is, and only change values of those declared after (ie inputs property)
                ...state,
                inputs: {
                    // return form inputs as they are currently, so only the input being assessed is changed
                    ...state.inputs,
                    [action.inputId]: { value: action.value, isValid: action.isValid }
                },
                isValid: formIsValid
            }
        // SET_DATA case used when form data is fetched eg editing an event. Component & HTML will normally render before the app has finished fetching data, so below is used so that data can be fetched and then have form populated
        case 'SET_DATA':
            return {
                inputs: action.inputs,
                isValid: action.formIsValid
            }
        default:
            return state
    }
}

export const useForm = (initialInputs, initialFormValidity) => {
    const [formState, dispatch] = useReducer(formReducer, {
        inputs: initialInputs,
        isValid: initialFormValidity
    })

    const inputHandler = useCallback((id, value, isValid) => {
        dispatch({
            type: 'INPUT_CHANGE',
            value: value,
            isValid: isValid, 
            inputId: id
        })
    }, [])

    const setFormData = useCallback((inputData, formValidity) => {
        dispatch({
            type: 'SET_DATA',
            inputs: inputData,
            formIsValid: formValidity
        })
    }, [])

    return [formState, inputHandler, setFormData]
}