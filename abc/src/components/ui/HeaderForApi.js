import React from 'react';
import WebAccessToken from '../WebAccessToken';

const headerForApi = (props) => (
    <header id="header">
        <div className="inner">
            <a href="" className="logo">
                <span className="symbol"></span>
                <span className="title">Aviall API</span>
            </a>
        </div>
        <div className="api-header">
            <h2>{props.apiName}</h2>
        </div>
        <div className="api-description">
            {props.apiDescription}
        </div>
        <div className="padding5"></div>
        <WebAccessToken apis={props.apis}/>
    </header>
);

export default headerForApi;


