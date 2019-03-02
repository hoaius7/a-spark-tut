import React from 'react';

const HelloApiItem = () => (
	<article id="supplier-api" className="articles-iterate style1">
	  <span className="image">
        <img src="static/img/rest-api-1.png"></img>
      </span>
      <a href="#/hello-api">
      	<h2>Hello API</h2>
        <div className="content">
          <p>This is sample API for saying hello world and providing health check with ElasticSearch</p>
        </div>
      </a>
    </article>
);

export default HelloApiItem;