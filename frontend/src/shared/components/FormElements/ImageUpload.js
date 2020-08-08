import React, { useRef, useState, useEffect } from 'react';
import Button from './Button';
import './ImageUpload.css';

const ImageUpload = props => {
    const [file, setFile] = useState();
    const [previewUrl, setPreviewUrl] = useState(props.currentImg ? props.currentImg : null);
    const [isValid, setIsValid] = useState(props.isValid);
    const [isChanged, setIsChanged] = useState();
    const filePickerRef = useRef();

    // instantiate fileReader when image selected/changed
    useEffect(() => {
        if (!file) {
            return;
        }
        const fileReader = new FileReader();
        fileReader.onload = () => {
            setPreviewUrl(fileReader.result);
        };
        fileReader.readAsDataURL(file);
    }, [file])

    // Hide file input by default, below will execute click event on it when custom style button is clicked
    const selectImageHandler = () => {
        setIsChanged(true);
        filePickerRef.current.click();
    }

    // function triggered when file input changes directly
    const selectedHandler = event => {
        let selectedFile;
        let fileIsValid = isValid;
        if (event.target.files && event.target.files.length === 1) {
            selectedFile = event.target.files[0];
            setFile(selectedFile);
            setIsValid(true);
            fileIsValid = true;
        } else {
            setIsValid(false);
            fileIsValid = false;
        }
        // propagate file input data back to Input component in order to update form state
        props.onInput(props.id, selectedFile, fileIsValid)
    }

    return (
        <div className='form-control'>
            <input type='file' id={props.id} style={{ display: 'none' }} accept='.jpg, .jpeg, .png' ref={filePickerRef} onChange={selectedHandler} />

            <div className='image-upload'>
                <div className='image-upload-preview'>
                    <Button type='button' onClick={selectImageHandler} inverse>
                        {props.btnText ? props.btnText : 'Upload A Photo'}
                    </Button>
                    {previewUrl && <img src={previewUrl} alt='Preview' />}
                </div>
            </div>
            {!isValid && isChanged && <small> {props.errorText} </small>}
        </div>
    )
}

export default ImageUpload