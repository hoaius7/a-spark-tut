import React from 'react';
import WebAccessToken from '../WebAccessToken';

const header = () => (
    <header id="header">
        <div className="inner">
            <a href="" className="logo">
                <span className="symbol"></span>
                <span className="title">Aviall API</span>
            </a>
            <h1>A List of Aviall APIs</h1>
        </div>
        <WebAccessToken/>
    </header>
);

export default header;