export const VALIDATOR_REQUIRE = () => ({ type: 'REQUIRED' })
export const VALIDATOR_MINLENGTH = val => ({ type: 'MINLENGTH', val: val })
export const VALIDATOR_MAXLENGTH = val => ({ type: 'MAXLENGTH', val: val })
export const VALIDATOR_EMAIL = () => ({ type: 'EMAIL' })

export const validate = (inputVal, validatorsArr) => {
    let isValid = true;
    for (const validator of validatorsArr) {
        if (validator.type === 'REQUIRED') {
            isValid = isValid && inputVal.trim().length > 0;
        }
        if (validator.type === 'MINLENGTH') {
            isValid = isValid && inputVal.trim().length >= validator.val;
        }
        if (validator.type === 'MAXLENGTH') {
            isValid = isValid && inputVal.trim().length <= validator.val;
        }
        if (validator.type === 'EMAIL') {
            isValid = isValid &&/^\S+@\S+\.\S+$/.test(inputVal);
        }
    }
    return isValid;
}