import React from 'react';
import './MobHeader.css';
import { CSSTransition } from 'react-transition-group';
import ReactDOM from 'react-dom';

const MobHeader = props => {
    const content = (
        <CSSTransition
            in={props.show}
            timeout={200}
            classNames="slide-down"
            mountOnEnter
            unmountOnExit
        >
            <aside className='mob-menu' onClick={props.onClick}>
                {props.children}
            </aside>
        </CSSTransition>
    )

    return ReactDOM.createPortal(content, document.getElementById('mob-menu-hook'))
}

export default MobHeader