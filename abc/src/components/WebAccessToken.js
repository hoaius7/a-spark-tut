import React, {Component} from 'react';
import Modal from 'react-awesome-modal';
import axios from 'axios';
import cookie from 'react-cookies';

var retries = 0;
const MAX_RETRIES = 0;
const apiListUrl = process.env.REACT_APP_VIEW_APILIST_URL;

class WebAccessToken extends Component {

	constructor(props) {
        super(props);
        this.state = {
            //visible : true
            visible : false
        }
    }

    componentDidMount() {
    	this.setState({
            visible : false
        });

    	//disable token access
    	this.getAPIList('');
    	//end disable token access
    	return;
        var token = cookie.load('token');
        if (token == null) {
			this.setState({
	            //visible : true
	            visible : false
	        });        	
        } else {
        	this.setState({
	            visible : false
	        });  
        	this.getAPIList(token);
        }
    }

    handleKeyPress(e) {
    	if (e.key === 'Enter') {
	      this.continue();
	    }
    }

    onChange(e) {
    	this.setState({
            token : e.target.value
        });
    }

    getAPIList(token) {
    	console.log(token)
    	retries++;
		var auth = {headers: {'x-api-key': token}};
		var self = this;
		var expires = new Date();
		//TODO: Remove return command here it if required token to access this Web UI
		if (self.props.apis) {
			self.props.apis({});	
		}
		return;
		axios.get(apiListUrl, auth)
			.then(res => {
				if (this.props.apis) {
					this.props.apis(res.data);	
				}
				cookie.save('token', token, {
					path: '/', expires, maxAge: 86400
				});
				this.setState({
		            visible : false
		        });    
			}).catch(function(error) {
				console.log(error)
				console.log('retry', retries)
				if (retries < MAX_RETRIES) {
					self.getAPIList(token);
				} else {
					retries = 0;
					if (error.response && error.response.data) {
						var errorMessage = "Error message: " + error.response.status;
						if (error.response.data.message) {
							errorMessage = errorMessage + ": " + error.response.data.message;
						}
						if (error.response.data.description) {
							errorMessage = errorMessage + ": " + error.response.data.description;
						}
						//disable token
						//alert('Cannot validate token, please input valid token. ' + errorMessage);
						self.setState({
				            //visible : true
				            visible : false
				        }); 
					} else {
						//disable token
						//alert('Cannot validate token, please input valid token');
						self.setState({
				            //visible : true
				            visible : false
				        }); 
					}
					if (self.props.apis) {
						self.props.apis({});	
					}
				}
			});

    }

	continue() {
		retries++;
		var token = this.state.token;
		if (token != null) {
			this.getAPIList(token);
		}
    }

	render() {
		return (
				<Modal 
					visible={this.state.visible}
					width="500"
					height="150"
					effect="fadeInUp"
					onClickAway={() => {}}
					>
					<div className="padding10">
					    <h5>Access Token</h5>
					    <div className="padding5"></div>
					    <input type="text" ref="webToken" placeholder="Input access token to continue" onKeyPress={this.handleKeyPress.bind(this)} onChange={this.onChange.bind(this)}/>
					    <div className="padding5"></div>
					    <input type="button" className="token-button right" value="Continue" onClick={this.continue.bind(this)}/>
					    <div className="clear"></div>
					</div>
				</Modal>
		);
	}
};

export default WebAccessToken;