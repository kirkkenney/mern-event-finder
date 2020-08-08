import React from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';

import './Modal.css';
import Backdrop from './Backdrop';

const ModalOverlay = props => {
    const content = (
        <div className={`${props.class} modal-box`}>
            <header className='modal-header'>
                <h2> {props.header} </h2>
            </header>
            <div className='modal-content'>
                {props.children}
            </div>
            <footer className='modal-footer'>
                {props.footer}
            </footer>
        </div>
    )
    return (
        ReactDOM.createPortal(content, document.getElementById('modal-hook'))
    )
}

const Modal = props => {
    return (
        <React.Fragment>
            {props.show && <Backdrop onClick={props.onCancel} /> }
            <CSSTransition
                in={props.show} 
                mountOnEnter 
                unmountOnExit 
                timeout={200}
                classNames="modal"
            >
                <ModalOverlay {...props} />
            </CSSTransition>
        </React.Fragment>
    )
}

export default Modal