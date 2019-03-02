import React from 'react';
import waitingImg from '../../../public/static/img/spinner.gif';

const waiting = (props) => {
    if (props.waiting) {
        return <img className="left" src={waitingImg} />;
    }

    return null;
}

export default waiting;
