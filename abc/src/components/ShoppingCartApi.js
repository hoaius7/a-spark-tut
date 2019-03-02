import React, {Component} from 'react';
import { connect } from 'react-redux';
import HeaderForApi from './ui/HeaderForApi';
import RestConsole from './common/RestConsole';

import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css


import axios from 'axios';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

const aviallCartUrl = process.env.REACT_APP_VIEW_AVIALL_CART_URL;
const aviallProductThumbnailUrl = process.env.REACT_APP_VIEW_PRODUCT_THUMBNAIL_URL;
const addProductToCartURL = process.env.REACT_APP_SHOPPING_CART_ADD_PRODUCT_URL;
const viewCartURL = process.env.REACT_APP_SHOPPING_CART_VIEW_URL;
const removeCartURL = process.env.REACT_APP_SHOPPING_CART_REMOVE_URL;

const ERROR_MSG_API_KEY_MISSING  = process.env.REACT_APP_ERROR_API_KEY_MISSING ;
const ERROR_PRODUCT_CODE_MISSING = process.env.REACT_APP_ERROR_PRODCODE_QUANTITY_MISSING ;
const ERROR_PRODUCT_CODE_INVALID = process.env.REACT_APP_ERROR_PRODCODE_QUANTITY_INVALID ;
const ERROR_INVALID_USER_PASS    = process.env.REACT_APP_ERROR_INVALID_USER_PASS ;
const ERROR_CANNOT_CONNECT_TO_SERVER = process.env.REACT_APP_ERROR_CONNECTIVITY ;
const ERROR_PRODUCT_CODE_OR_QUANTITY_MISSING = process.env.REACT_APP_ERROR_PRODUCT_CODE_OR_QUANTITY_MISSING ;

const ERROR_INVALID_FORMAT = 'Please input valid format for product and quantity' ;
const ERROR_INVALID_INPUT = 'Please check your input' ;


class ShoppingCartApi extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		console.log('constructor');
	}
	
	loadApis(apis) {
		var apis = {
			"shopping-cart-api-view": 
{				"endpoint": viewCartURL,
				"method": "GET"
			},
			"shopping-cart-api-add": {
				"endpoint": addProductToCartURL,
				"method": "POST"
			},
			"shopping-cart-api-remove": {
				"endpoint": removeCartURL,
				"method": "DELETE"
			}
		};
		this.setState({apis: apis}, function () {
    		this.handleChange();
		});
	}	

	componentDidMount() {
		this.handleChange();
	}

	handleClick = () => {
        this.props.history.push("order-api");
    }

    handleClick2 = () => {
        this.props.history.push("supplier-api");
    }

	buildMetadata(startTime, res) {
		var endTime = new Date().getTime();
		var responseTime = endTime - startTime;
		return {name: 'Shopping Cart', responseTime: responseTime, status: res.status, contentType: res.headers['content-type'], contentLength: Math.floor((JSON.stringify(res.data).length / 1024) * 100)/100};
	}

	descriptionFormatter(cell, row) {   // String example
	  var thumbnailUrl = aviallProductThumbnailUrl.replace("{productCode}", row.partNumber);
	  return `<img  src='${thumbnailUrl}'/><br>${cell}`;
	}

	remove(cell, partNumber) {
		var self = this;

		confirmAlert({
	      title: '',
	      message: 'Are you sure to remove the part ' + partNumber + ' from the cart',
	      buttons: [
	        {
	          label: 'Yes',
	          onClick: () => self.removeProductAndRefresh(cell)
	        },
	        {
	          label: 'No',
	          onClick: () => console.log('cancel')
	        }
	      ]
	    });

	}

	productFormatter(cell, row) {   // String example
	  return `<a  title='View detail' href="https://www.aviall.com/aviallstorefront/p/${cell}" target='_blank'>${cell}</a>`;
	}

	numberFormatter(cell, row) {
	  return <div>
	  			{cell + 1}&nbsp;
	  			<img onClick={() => this.remove(cell, row.partNumber)} src='https://www.aviall.com/aviallstorefront/_ui/desktop/theme-aviall/images/cartPage/remove_CartItem.png'></img>
	  		  </div>;
	}

	handleChange() {
		if (!this.state.apis) return;
		if (this.refs.activity.value === 'add_product') {
			this.setState({method: 'POST', url: this.state.apis['shopping-cart-api-add'].endpoint});
		} else if (this.refs.activity.value === 'remove_product') {
			this.setState({method: this.state.apis['shopping-cart-api-remove'].method, url: this.state.apis['shopping-cart-api-remove'].endpoint});
		} else if (this.refs.activity.value === 'view_cart' || this.refs.activity.value === 'view_all_cart') {
			this.setState({method: this.state.apis['shopping-cart-api-view'].method, url: this.state.apis['shopping-cart-api-view'].endpoint});
		}
		this.setState({viewCartUrl: this.state.apis['shopping-cart-api-view'].endpoint});
	}

	buildAuthHeaders() {
		var token = this.refs.token.value;
		var user = this.refs.username.value;
		var password = this.refs.password.value;
		
		return  {headers: {'Authorization': 'Bearer ' + token, 'x-api-key': token,'X-Username': user, 'X-Password': password}};
	}

	invokeAPI() {
		var apiUrl = this.state.url;
		var auth = this.buildAuthHeaders();

		var isContinued = this.validateInput() ; 

		if (isContinued){

			if (this.refs.activity.value === 'add_product') {
				this.addProduct(apiUrl, auth);
				
				return;
			} else if (this.refs.activity.value === 'remove_product') {
				this.removeProduct(apiUrl, auth);
				return;
			} else {
				if (this.refs.activity.value === "view_all_carts") {
					this.getCart(apiUrl, auth);
				} else {
					var cartId = this.refs.cartId.value;
					if (cartId !="") {
						apiUrl += "/" + cartId;
					}
					this.getCart(apiUrl, auth);
				}
				
			}
		}	
		
	}

	validateInput(){
		var isContinued = true ;

		if(this.refs.token.value === ""){
			this.refs.errorMessage = ERROR_MSG_API_KEY_MISSING ;

			console.log('error for API key missing',this.refs.errorMessage) ;

			isContinued = false ; 
			this.props.dispatch({type: "invokeAPI", error: ERROR_MSG_API_KEY_MISSING, invokeAPIProgress: "done", status2xx:false});	

			return isContinued ;
		} 

		if (this.refs.activity.value === 'add_product') {
			if(this.refs.productsAndQuantities.value === ""){
						
				this.refs.errorMessage = ERROR_PRODUCT_CODE_MISSING ;

				isContinued = false ; 
				this.props.dispatch({type: "invokeAPI", error: ERROR_PRODUCT_CODE_MISSING, invokeAPIProgress: "done", status2xx:false});	
				
				return isContinued ;	
			}
			//Check the Order and Quantity

			var arrCodeQuantity = this.refs.productsAndQuantities.value.split(";");
			for (let i = 0; i< arrCodeQuantity.length; i++) {
				if (arrCodeQuantity[i].indexOf(',') < 0) {
					this.refs.errorMessage = ERROR_PRODUCT_CODE_OR_QUANTITY_MISSING ;
					this.props.dispatch({type: "invokeAPI", error: ERROR_PRODUCT_CODE_OR_QUANTITY_MISSING, invokeApiProgress: "done", status2xx:false});
					isContinued = false ;
					return isContinued;
				} else {
					var arrCodeQuantityEach = arrCodeQuantity[i].split(",");
					if ((arrCodeQuantityEach[0].trim() === "") || (arrCodeQuantityEach[1].trim() === "")) {
						this.refs.errorMessage = ERROR_PRODUCT_CODE_OR_QUANTITY_MISSING ;
						this.props.dispatch({type: "invokeAPI", error: ERROR_PRODUCT_CODE_OR_QUANTITY_MISSING, invokeApiProgress: "done", status2xx:false});
						isContinued = false ;
						return isContinued;
					}
				}
			}
		}

		if (this.refs.username.value === "" || this.refs.password.value === "") {
				
				this.refs.errorMessage = ERROR_INVALID_USER_PASS ;
				console.log(' error for invalidate user pass', this.refs.errorMessage) ;
				isContinued = false ; 
				this.props.dispatch({type: "invokeAPI", error: ERROR_INVALID_USER_PASS, invokeAPIProgress: "done", status2xx:false});		
				
				return isContinued; 		
		}
		
		return isContinued ;
	}	

	addProduct(apiUrl, auth) {

		var self = this;
		var productsAndQuantities = [];
		
		this.refs.productsAndQuantities.value.split(";").forEach(function(productQuantity) {
	
			if (productQuantity.indexOf(',') > 0) {
				productsAndQuantities.push({'productCode': productQuantity.split(',')[0].trim(), 'quantity': parseInt(productQuantity.split(',')[1])})	
			} else {
						
				self.props.dispatch({type: "invokeAPI", error: ERROR_INVALID_FORMAT, invokeAPIProgress: "done", status2xx:false});		
				return;				
			}
		});
				
		if (productsAndQuantities.size == 0) {
			
			self.props.dispatch({type: "invokeAPI", error: ERROR_INVALID_FORMAT, invokeAPIProgress: "done", status2xx:false});
			return;
		}
		
		self.props.dispatch({type: "invokeAPI", error: "", invokeAPIProgress: "inprogress"});

		var startTime = new Date().getTime();
		
		axios.post(apiUrl, productsAndQuantities, auth)
			.then(res => {
				self.props.dispatch({type: "invokeAPI", rawData: res.data, metadata: self.buildMetadata(startTime, res), error: "", invokeAPIProgress: "done",status2xx:true});
			}).catch(function(error) {
				
				self.errorHandler(error, startTime);
			});
	}

	removeProduct(apiUrl, auth) {
		var self = this;
		var cartId = this.refs.cartId.value;
		var entry = this.refs.entry.value;
		var url = this.state.apis['shopping-cart-api-remove'].endpoint.replace('{cartId}', cartId).replace('{entry}', entry);

		var startTime = new Date().getTime();
		axios.delete(url, auth)
			.then(res => {
				self.props.dispatch({type: "invokeAPI", rawData: res.data, metadata: self.buildMetadata(startTime, res), error: "", invokeAPIProgress: "done",status2xx:true});
			}).catch(function(error) {
				self.errorHandler(error, startTime);
			});
	}

	removeProductAndRefresh(entry) {
		var self = this;
		var apiUrl = this.state.url;
		var url = this.state.apis['shopping-cart-api-remove'].endpoint.replace('{cartId}', 0).replace('{entry}', entry);
		var auth = self.buildAuthHeaders();
		axios.delete(url, auth)
			.then(res => {
				var getCartUrl = self.state.viewCartUrl;
				self.getCart(getCartUrl, auth);
			}).catch(function(error) {
				alert('Cannot remove this product with error:' + self.extractErrorMessage(error));
			});
	}

	getCart(apiUrl, auth) {
		var self = this;
		var startTime = new Date().getTime();
		
		axios.get(apiUrl, auth)
			.then(res => {
				self.props.dispatch({type: "invokeAPI", rawData: res.data, metadata: self.buildMetadata(startTime, res), error: "", invokeAPIProgress: "done",status2xx:true});
			}).catch(function(error) {
				self.errorHandler(error, startTime);
			});
	}

	extractErrorMessage(error) {
		console.log('error ', error) ;
		if (error.response && error.response.data) {
			
			var errorMessage = "Error message: " + error.response.status;
			if (error.response.data.message) {
				errorMessage = errorMessage + ": " + error.response.data.message;
			}
			if (error.response.data.description) {
				errorMessage = errorMessage + ": " + error.response.data.description;
			}

			if (error.response.status  == '403' || error.response.status  == '500') {
				errorMessage = "API key or credentials info is incorrect" ;
			}	else {
				errorMessage = ERROR_INVALID_INPUT ; 
			}

			return errorMessage;
		} else {
			return ERROR_CANNOT_CONNECT_TO_SERVER;
		}
	
	}

	errorHandler(error, startTime) {
		var errorMessage = this.extractErrorMessage(error);
		
		if (error.response && error.response.data) {
			this.props.dispatch({type: "invokeAPI", error: errorMessage, rawData: error.response.data, metadata: this.buildMetadata(startTime, error.response), invokeAPIProgress: "done",status2xx:false});	
		} else {
			
			this.props.dispatch({type: "invokeAPI", error: errorMessage, rawData: '', invokeAPIProgress: "done",status2xx:false});	
		}
	}

	render() {
		var waiting = {display: "none"};
		var showContent = {display: "none"};
		var cartTitle = {fontWeight: 600, color: '#0095da'};

		if (this.props && this.props.invokeAPIProgress === "inprogress") {
			waiting = {display: "block"};
			showContent = {display: "none"};
		}
		if (this.props && this.props.invokeAPIProgress === "done") {
			showContent = {display: "block"};
		}

		var errorMessage = "";
		if (this.props.error) {
			errorMessage = this.props.error;
			
			console.log('error', errorMessage) ;
		}
		const options = {
		    defaultSortName: 'quantity',
		    sizePerPage: 50
		  };

		var metadata = this.props.metadata ? this.props.metadata : {};

		var cartId = "";
		var totalPrice = "";
		var totalItems = "";
		var entries = [];
		
		if (this.props.rawData && (this.props.rawData.carts || this.props.rawData.cart || this.props.rawData.cartId)) {
			if (Array.isArray(this.props.rawData.carts)) {
				entries = this.props.rawData.carts[0].entries;
				cartId = this.props.rawData.carts[0].cartId;
				totalItems = this.props.rawData.carts[0].totalItems;
				totalPrice = this.props.rawData.carts[0].totalPrice + this.props.rawData.carts[0].currency;	
			} else if (this.props.rawData.cart) {
				entries = this.props.rawData.cart.entries;
				cartId = this.props.rawData.cart.cartId;
				totalItems = this.props.rawData.cart.totalItems;
				totalPrice = this.props.rawData.cart.totalPrice + this.props.rawData.cart.currency;
			} else if (this.props.rawData.cartId) {
				entries = this.props.rawData.entries;
				cartId = this.props.rawData.cartId;
				totalItems = this.props.rawData.totalItems;
				totalPrice = this.props.rawData.totalPrice + this.props.rawData.currency;
			}
		}
		
		var noDisplay = {display: "none"} ; 

		var showRemove = {display: "none"};
		if (this.refs.activity && this.refs.activity.value === "remove_product") {
			showRemove = {display: "block"};
		}
		var showAdd = {display: "none"};
		if (this.refs.activity && this.refs.activity.value === "add_product") {
			showAdd = {display: "block"};
		}
		var showDetail = showAdd;
		var showCartId = showRemove;
		if (this.refs.activity && this.refs.activity.value === "view_cart") {
			showDetail = {display: "block"};
			showCartId = showDetail;
		}
		
		var cartIds = "";
		var showCartIds = {display: "none"};
		if (this.refs.activity && this.refs.activity.value === "view_all_carts") {
			showCartIds = {display: "block"};
			cartIds = this.props.rawData ? this.props.rawData.toString() : "";
		}
		

		return (
				<div id="wrapper">
					<HeaderForApi apiName={'Shopping-Cart Api'} apiDescription={'Shopping with Aviall using Rest API'}  apis={this.loadApis.bind(this)}/>
		        	<div id="main">
		        		<div className="apicontainer inner">
							<div className="container-request">
								<h3 className="request-info">Request</h3>
								<ul>
									<li><label>Activity</label>
										<select onChange={this.handleChange.bind(this)} ref="activity">
											<option value="add_product">Add Product to Cart</option>
											<option value="view_all_carts">Get All Carts</option>
											<option value="view_cart">Get Cart Details by ID</option>
											{/*
											<option value="remove_product">Remove Product in Cart</option>
											*/}
										</select>
									</li>
									<li style={noDisplay} ><label>URL</label>{this.state.url}</li>

									<li style={noDisplay} ><label>Method</label>{this.state.method}</li>
									<li><label>X-API-Key</label> <input type="text" ref="token"/></li>
									<li><label>X-Username</label> <input type="text" ref="username"/></li>
									<li><label>X-Password</label> <input type="password" ref="password"/></li>
									<li style={showAdd}><label>Product and Quantity</label> <input type="text" ref="productsAndQuantities" placeholder="Ex: 327=18,50; 42973-000=PI,20"/></li>
									<li style={showCartId}><label>Cart Id</label> <input type="text" ref="cartId" placeholder="Ex: 10525242"/></li>
									<li style={showRemove}><label>Product Entry index </label> <input type="text" ref="entry" placeholder="Ex: 0"/></li>
								    <li>
								    	<div className="buttonContainer">
									    	<input type="button" className="button left" value="Execute" onClick={this.invokeAPI.bind(this)}/>
									    	<img className="left" style={waiting} src="https://www.aviall.com/aviallstorefront/_ui/desktop/common/images/spinner.gif"/>
										</div>
								    </li>
								</ul>
								<div className="padding10 clear"> </div>
							</div>
							<div style={showContent} className="container-response">
								<h3 className="response-info">Response</h3>
								<div className="error">
									{errorMessage}
								</div>
								<div className="clear">
									<RestConsole metadata={metadata} data={this.props.rawData} />
									<div className="padding20 clear"> </div>
									<div style={showDetail}>
										<p style={cartTitle}>Total Price: {totalPrice}, &nbsp;Items: {totalItems}, &nbsp; Cart Id: {cartId}
										&nbsp; &nbsp; &nbsp; &nbsp; <a href={aviallCartUrl} target="_blank">View your cart in Aviall.com</a>
										</p>
										
									</div>
									<div style={showCartIds}>
										<p style={cartTitle}> List of cartIds: {cartIds}
										</p>
									</div>
									<BootstrapTable data={entries} striped hover pagination search options={ options } exportCSV csvFileName='Export_parts.csv'>
										<TableHeaderColumn isKey dataField='entryNumber' dataFormat={ this.numberFormatter.bind(this)  }  width='50' headerAlign='center' dataAlign='center'>No</TableHeaderColumn>
										<TableHeaderColumn dataField='partNumber' dataFormat={ this.productFormatter} width='150' headerAlign='center' dataAlign='center'>Part Number</TableHeaderColumn>
										<TableHeaderColumn dataField='quantity' width='80' headerAlign='center' dataAlign='right' dataSort={ true }>Quantity</TableHeaderColumn>
										<TableHeaderColumn dataField='subTotalPrice' width='80' headerAlign='center' dataAlign='right' dataSort={ true }>Price</TableHeaderColumn>
										<TableHeaderColumn dataField='description' dataFormat={ this.descriptionFormatter } headerAlign='center' width='250' dataAlign='center'>Description</TableHeaderColumn>
									</BootstrapTable>									
								</div>
							</div>
						</div>
					</div>	
				</div>
		);
	}
}

const mapStateToProps = (state) => ({
	rawData: state.rawData,
	metadata: state.metadata,
	invokeAPIProgress: state.invokeAPIProgress,
    error: state.error,
    status2xx: state.status2xx 
})

ShoppingCartApi = connect(mapStateToProps)(ShoppingCartApi)
export default ShoppingCartApi