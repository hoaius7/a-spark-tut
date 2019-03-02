import React, {Component} from 'react';
import { connect } from 'react-redux';
import HeaderForApi from './ui/HeaderForApi';
import RestConsole from './common/RestConsole';

import axios from 'axios';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

const ORDER_API_VIEW_URL = process.env.REACT_APP_VIEW_ORDER_URL;
const ORDER_API_PLACE_URL = process.env.REACT_APP_PLACE_ORDER_URL;
const ORDER_API_PLACE_URL_W_CART = process.env.REACT_APP_PLACE_ORDER_URL; //create from Cart has same URL as normal order creation

const ERROR_MSG_API_KEY_MISSING  = process.env.REACT_APP_ERROR_API_KEY_MISSING ;
const ERROR_PRODUCT_CODE_AND_QUANTITY_MISSING = process.env.REACT_APP_ERROR_PRODCODE_QUANTITY_INVALID ;
const ERROR_INVALID_USER_PASS    = process.env.REACT_APP_ERROR_INVALID_USER_PASS ;
const ERROR_PO_MISSING 			 = process.env.REACT_APP_ERROR_PO_MISSING ;
const ERROR_CANNOT_CONNECT_TO_SERVER = process.env.REACT_APP_ERROR_CONNECTIVITY ;
const ERROR_PRODUCT_CODE_OR_QUANTITY_MISSING = process.env.REACT_APP_ERROR_PRODUCT_CODE_OR_QUANTITY_MISSING ;

const ERROR_INVALID_INPUT = 'Please check your input' ;
const ERROR_INVALID_CARTID = 'Please input Cart ID' ;

class OrderApi extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentDidMount() {

		this.handleChange();
	}

	handleChange() {

		if (this.state.apis) {
			if (this.refs.activity.value === 'place_order') {
				this.setState({method: this.state.apis['order-api-place'].method,
							   url: this.state.apis['order-api-place'].endpoint,
							   isGET: false});
				//clear fields in place_order


			} else if (this.refs.activity.value === 'view_order') {
				this.setState({method: this.state.apis['order-api-view'].method,
							   url: this.state.apis['order-api-view'].endpoint,
							   isGET: true});
			//clear fields in View_order

			} else if (this.refs.activity.value === 'place_order_with_cart') {
				this.setState({method: this.state.apis['order-api-place_wcart'].method,
							   url: this.state.apis['order-api-place_wcart'].endpoint,
							   isGET: false});
			//clear fields in View_order

			}

		}
	}

	buildMetadata(startTime, res) {
		var endTime = new Date().getTime();
		var responseTime = endTime - startTime;
		return {name: 'Order api', responseTime: responseTime, status: res.status, contentType: res.headers['content-type'], contentLength: Math.floor((JSON.stringify(res.data).length / 1024) * 100)/100};
	}

	formatFont(cell, row) {   // String example
	  return `<p  style='font-size: 18px'>${cell}</p>`;
	}


	loadApis(apis) {
		var apis = {
			"order-api-place": {
				"endpoint": ORDER_API_PLACE_URL,
				"method": "POST"
			},
			"order-api-view": {
				"endpoint": ORDER_API_VIEW_URL,
				"method": "GET"
			},
			"order-api-place_wcart": {
				"endpoint": ORDER_API_PLACE_URL_W_CART,
				"method": "POST"
			}
		};
		// console.log('load api', apis)
    	    this.setState({apis: apis}, function () {
     		this.handleChange();
		 });

	}

	invokeAPI() {
		var token = this.refs.token.value;

		var self = this;
		//var auth = {headers: {'Authorization': token, 'x-api-key': token}};
		var auth = {headers: {'Authorization': 'Bearer ' + token, 'x-api-key': this.refs.token.value, 'x-username': this.refs.username.value,'x-password': this.refs.password.value}};
		var apiUrl = this.state.url;

		if (this.state.method === 'GET') {
			apiUrl += '/' + this.refs.orderNumber.value;
		}

		var isContinued = this.validateInput() ;

		if (!isContinued) {
			return ;
		}

		self.props.dispatch({type: "invokeAPI", error: "", invokeApiProgress: "inprogress"});

		if (this.refs.activity.value === 'place_order') {
			//update place_order method with 1 more parameter
			//3rd param is Cart ID which is blank for normal case
			this.place_order(apiUrl, auth, '') ;

			return;
		} else if (this.refs.activity.value === 'place_order_with_cart') {

			if (this.refs.cartId.value.length > 0) {
				apiUrl += '/' + this.refs.cartId.value;
				//cart ID indicator is marked as 'X' and pass to place_order method
				this.place_order(apiUrl, auth, 'X') ;
			} else{
				self.props.dispatch({type: "invokeAPI", error: ERROR_INVALID_CARTID, invokeApiProgress: "done"});

			}

			return;
		} else if (this.refs.activity.value === "view_order") {

			this.view_order(apiUrl, auth) ;
			return;

	}

	}

	validateInput(){
		var isContinued = true ;

		if(this.refs.token.value === ""){
			this.refs.errorMessage = ERROR_MSG_API_KEY_MISSING ;

			isContinued = false ;

			this.props.dispatch({type: "invokeAPI", error: ERROR_MSG_API_KEY_MISSING, invokeApiProgress: "done", status2xx:false});

			return isContinued;

		} else if(this.refs.activity.value === "place_order"){

				if (this.refs.productsAndQuantities.value === "") {
					this.refs.errorMessage = ERROR_PRODUCT_CODE_AND_QUANTITY_MISSING ;

					isContinued = false ;

					this.props.dispatch({type: "invokeAPI", error: ERROR_PRODUCT_CODE_AND_QUANTITY_MISSING, invokeApiProgress: "done", status2xx:false});

					return isContinued;

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
						var  arrCodeQuantityEach = arrCodeQuantity[i].split(",");
						if ((arrCodeQuantityEach[0].trim() === "") || (arrCodeQuantityEach[1].trim() === "")) {
							this.refs.errorMessage = ERROR_PRODUCT_CODE_OR_QUANTITY_MISSING ;
							this.props.dispatch({type: "invokeAPI", error: ERROR_PRODUCT_CODE_OR_QUANTITY_MISSING, invokeApiProgress: "done", status2xx:false});
							isContinued = false ;
							return isContinued;
						}
					}
				}
				
				//Check PO Number
				if (this.refs.poNumber.value === "") {
					this.refs.errorMessage = ERROR_PO_MISSING ;

					this.props.dispatch({type: "invokeAPI", error: ERROR_PO_MISSING, invokeApiProgress: "done", status2xx:false});

					isContinued = false ;
					return isContinued;

				}


		}

		if (this.refs.username.value === "" || this.refs.password.value === "") {

				this.refs.errorMessage = ERROR_INVALID_USER_PASS ;

				isContinued = false ;
				this.props.dispatch({type: "invokeAPI", error: ERROR_INVALID_USER_PASS, invokeApiProgress: "done", status2xx:false});

				return isContinued;
		}

		return isContinued;
	}


	view_order(apiUrl, auth){

		var self = this;

		var startTime = new Date().getTime();
		console.log("API endpint "+ apiUrl) ;
		axios.get(apiUrl, auth)
			.then(res => {
				self.props.dispatch({type: "invokeAPI", result: res.data, metadata: self.buildMetadata(startTime, res), error: "", invokeApiProgress: "done", status2xx:true});
				//console.log(' API call result', res) ;
			}).catch(function (error) {
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

					self.props.dispatch({type: "invokeAPI", error: errorMessage, result:{}, metadata: self.buildMetadata(startTime, error.response), invokeApiProgress: "done", status2xx:false});

				} else {
					self.props.dispatch({type: "invokeAPI", error: ERROR_CANNOT_CONNECT_TO_SERVER, invokeApiProgress: "done",status2xx:false});
				}
	   		});
	}


	place_order(apiUrl, auth, cartId) {
		var self = this;

		var body = '' ;

		var productsAndQuantities = [];
		//in case No cart ID -> normal case with Product & quantity
		if (!cartId) {

			this.refs.productsAndQuantities.value.split(";").forEach(function(productQuantity) {
				if (productQuantity.indexOf(',') > 0) {
					productsAndQuantities.push({'productCode': productQuantity.split(',')[0].trim(), 'quantity': parseInt(productQuantity.split(',')[1])})
				}
			});

			if (productsAndQuantities.size == 0) {
				alert('Please insert valid format for product and quantity');
				return;
			}

			body = {'poNumber': this.refs.poNumber.value, 'products': productsAndQuantities } ;
		}

		console.log('body ', body) ;

		var startTime = new Date().getTime();

		axios.post(apiUrl, body, auth)
			.then(res => {
				self.props.dispatch({type: "invokeAPI", result: res.data, metadata: self.buildMetadata(startTime, res), error: "", invokeApiProgress: "done", status2xx:true});
				console.log(' API call result', res) ;
			}).catch(function (error) {
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

					self.props.dispatch({type: "invokeAPI", error: errorMessage, result:{}, metadata: self.buildMetadata(startTime, error.response), invokeApiProgress: "done",status2xx:false });

				} else {
					self.props.dispatch({type: "invokeAPI", error: ERROR_CANNOT_CONNECT_TO_SERVER, invokeApiProgress: "done",status2xx:false});
				}
	   		});
	}


	render() {
		var waiting = {display: "none"};
		var showContent = {display: "none"};
		if (this.props && this.props.invokeApiProgress === "done") {
			showContent = {display: "block"};
		}

		var errorMessage = "";
		if (this.props.error) {
			errorMessage = this.props.error;
		}
		console.log(errorMessage,  this.props.error);
		if (this.props && this.props.invokeApiProgress === "inprogress") {
			waiting = {display: "block"};
			showContent = {display: "none"};
			errorMessage = "";
		}

		if (this.props.error) {

			errorMessage = this.props.error;
			showContent = {display: "block"};
			console.log('error', errorMessage) ;
		}

		const options = {
		    defaultSortName: 'code',
		    sizePerPage: 50
		  };

		var metadata = this.props.metadata ? this.props.metadata : {};

		var entries = [];

		var currency = "USD";
		if (this.props.result && this.props.result.entries) {
			currency = this.props.result.totalCurrency;
			this.props.result.entries.forEach(function(item) {
				var newItem = Object.assign({}, item);
					if (!newItem.errors && (newItem.hasOwnProperty("partNumber")))	 {
					entries.push(newItem);
					errorMessage = "" ;
				}
			});
		}

		var entriesOrdCreation = [] ;
		var returnMessage = '' ;

		var showView = '';
		var showPlaceOrder = '' ;
		var returnMessageStyle = '' ;

		var showPlaceOrderWCart = '' ;

		var noDisplay = {display: "none"} ;

		if (this.refs.activity && this.refs.activity.value === "view_order") {
			showView = {display: 'block'} ;
			returnMessageStyle = {display: 'none'} ;
			returnMessage = '';
		} else {
			showView = {display: 'none'} ;
		}

		if (this.refs.activity && (this.refs.activity.value === "place_order_with_cart"|| this.refs.activity.value === "place_order" ) ) {

			if (this.refs.activity.value === "place_order") {
				showPlaceOrder = {display: 'block'} ;
				showPlaceOrderWCart = {display: 'none'} ;
			} else if (this.refs.activity.value === "place_order_with_cart") {
				showPlaceOrderWCart = {display: 'block'} ;
				showPlaceOrder = {display: 'none'} ;
			}

			if (this.props.result && this.props.result.orderNumber) {
				returnMessage = 'Order ' + this.props.result.orderNumber + ' has been successfully created' ;
				returnMessageStyle = {color: 'green', fontWeight : 'bold'} ;
			} else {
				returnMessage = 'Cannot create Order' ;
				returnMessageStyle = {color:'red', fontWeight: 'bold'} ;
			}

		} else {
				showPlaceOrder = {display: 'none'} ;
				showPlaceOrderWCart = {display: 'none'} ;
				returnMessageStyle = {display: 'none'} ;
		}

		return (
				<div id="wrapper">
					<HeaderForApi apiName={'Order Api'} apiDescription={'Place Order with products'}  apis={this.loadApis.bind(this)}/>
		        	<div id="main">
		        		<div className="apicontainer inner">
							<div className="container-request">
								<h3 className="request-info">Request</h3>
								<ul>
									<li><label>Activity</label>
										<select onChange={this.handleChange.bind(this)} ref="activity">
											<option value="place_order">Place Order</option>
											<option value="place_order_with_cart">Place Order From Cart ID</option>
											<option value="view_order">View Your Order</option>
										</select>
									</li>
									<li style={noDisplay} ><label>URL</label>{this.state.url}</li>
									<li style={noDisplay}><label>Method</label>{this.state.method}</li>
									<li><label>X-API-Key</label> <input type="text" ref="token"/></li>
									<li><label>X-Username</label> <input type="text" ref="username"/></li>
									<li><label>X-Password</label> <input type="password" ref="password"/></li>

									<li style={showView}><label>Order number</label> <input type="text" ref="orderNumber"/></li>
									<li style={showView}><div className="buttonContainer">
										    	<input type="button" className="button left" value="View Order" onClick={this.invokeAPI.bind(this)}/>
										    	<img className="left" style={waiting} src="https://www.aviall.com/aviallstorefront/_ui/desktop/common/images/spinner.gif"/>
												</div></li>
									<li style={showPlaceOrder}><label>PO number</label> <input type="text" ref="poNumber"/></li>
									<li style={showPlaceOrder}><label>Product and Quantity</label> <input type="text" ref="productsAndQuantities" placeholder="Ex: 327=18,50; 42973-000=PI,20"/></li>
								    <li style={showPlaceOrder}>
								    	<div className="buttonContainer">
									    	<input type="button" className="button left" value="Place Order" onClick={this.invokeAPI.bind(this)}/>
									    	<img className="left" style={waiting} src="https://www.aviall.com/aviallstorefront/_ui/desktop/common/images/spinner.gif"/>
										</div>
								    </li>
									<li style={showPlaceOrderWCart}><label>Cart ID</label> <input type="text" ref="cartId"/></li>
								    <li style={showPlaceOrderWCart}>
								    	<div className="buttonContainer">
									    	<input type="button" className="button left" value="Place Order" onClick={this.invokeAPI.bind(this)}/>
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
									<RestConsole metadata={metadata} data={this.props.result} />
									<div className="padding20 clear"> </div>

									<h3 style={showView}> Order details</h3>
									<div style={showView} >
									<BootstrapTable  data={entries} striped hover pagination search options={ options } exportCSV csvFileName='Export_order.csv'>
										<TableHeaderColumn isKey dataField='code' width='150' headerAlign='center' dataAlign='center' dataSort={ true }>Product code</TableHeaderColumn>
										<TableHeaderColumn dataField='name' headerAlign='center' dataAlign='left'>Description</TableHeaderColumn>
										<TableHeaderColumn dataField='hazmatCode' width='6em' headerAlign='center' dataAlign='center' dataSort={ true } >Hazmat Code</TableHeaderColumn>
										<TableHeaderColumn dataField='quantity' headerAlign='center'  width='5em' dataAlign='right' dataAlign='right' dataSort={ true }>Quantity</TableHeaderColumn>
										<TableHeaderColumn dataField='totalValue' width='8em' headerAlign='center' dataAlign='right' dataSort={ true }>Total value</TableHeaderColumn>
										<TableHeaderColumn dataField='currency' width='5em' headerAlign='center' dataAlign='center' dataSort={ true }>Currency</TableHeaderColumn>
									</BootstrapTable>
									</div>
									<div style={returnMessageStyle} >{returnMessage} </div>
								</div>
							</div>
						</div>
					</div>
				</div>
		);
	}
}

const mapStateToProps = (state) => ({
	result: state.result,
	metadata: state.metadata,
	invokeApiProgress: state.invokeApiProgress,
    error: state.error,
    status2xx: state.status2xx
});

OrderApi = connect(mapStateToProps)(OrderApi)
export default OrderApi
