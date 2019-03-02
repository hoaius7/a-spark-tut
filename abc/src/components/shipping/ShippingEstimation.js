import React, {Component} from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

const username = process.env.REACT_APP_api_username;
const password = process.env.REACT_APP_api_password;
const apiKey = process.env.REACT_APP_api_key;
const shippingEstimationUrl = process.env.REACT_APP_PRODUCT_SHIPPING_ESTIMATION_URL;

class ShippingEstimation extends Component {

	constructor(props) {
		super(props);
		this.setState({estimating: 'init'});
		console.log('start component', props);
	}

	componentWillReceiveProps(props) {
		console.log(props);
	}

	estimateShippingCost() {
		this.props.dispatch({type: "ShippingEstimationReset", rate: "", currency: "", actualDeliveryDate : "", error: "", estimating: "inprogress", showMore: false});
		var auth = {headers: {'x-api-key': apiKey, 'x-username': username,'x-password': password}};
		var query = {"shipFrom": this.refs.shipFrom.value, "productCode":this.props.productDetail.partNumber, 'orderQuantity': this.refs.quantity.value, "expectedDeliveryDate": this.refs.expectedDeliveryDate.value, "shipTo": this.refs.address.value};
		console.log(query)
		var self = this;
		axios.post(shippingEstimationUrl, query, auth)
			.then(res => {
				console.log(res)
				self.props.dispatch({type: "ShippingEstimation", rate: res.data.rate, currency: res.data.currency, actualDeliveryDate : res.data.actualDeliveryDate, result: res.data, estimating: "done"});
			}).catch(function (error) {
				if (error.response && error.response.data) {
					self.props.dispatch({type: "ShippingEstimation", error: error.response.data.description, estimating: "done"});	
				} else {
					self.props.dispatch({type: "ShippingEstimation", error: 'Cannot talk with server', estimating: "done"});	
				}
	   		});
	}

	showDetail() {
		this.props.dispatch({type: "ShowDetail", showMore: true});
	}

	render() {
		var waiting = {display: "none"};
		if (this.props && this.props.estimating === "inprogress") {
			waiting = {display: "block"};
		}
		var showContent = {display: "none"};
		if (this.props && this.props.estimating === "done") {
			showContent = {display: "block"};
		}
		var errorMessage = "";
		if (this.props.error) {
			errorMessage = this.props.error;
		}

		var showMore = {display: "none"};
		var result = ""
		if (this.props.showMore) {
			showMore = {display: "block"};
			result = JSON.stringify(this.props.result);
		}

		var locationAvailabilities = this.props.productDetail.locationAvailabilities;
		var shipFroms = locationAvailabilities.map(function(item) {
			return (
					<option key={item.location} value={item.location}>{item.location}</option>
				)
		});
		
		return (
			<div className="shipping apicontainer padding20">
				<h3 className="basefont babyBlue">Shipping Estimation</h3>
				<div>
					<ul>
						<li><label>Ship From</label>
							<select name="shipFrom" ref="shipFrom">
							 <option value="">All</option>
							 {shipFroms}
							</select>
						</li>
					    <li><label>Quantity</label> <input type="number" ref="quantity"/></li>
					    <li><label>Expected Delivery Date</label> <input type="date" ref="expectedDeliveryDate"/></li>
					    <li><label>Ship to Address</label> <input type="text" ref="address"/></li>
					    <li>
					    	<div className="buttonContainer">
						    	<input type="button" className="button left" value="Estimate Shipping Cost" onClick={this.estimateShippingCost.bind(this)}/>
							</div>
					    </li>
					</ul>
					
				</div>
				<div style={waiting} className="clear padding20">
					<img src="https://www.aviall.com/aviallstorefront/_ui/desktop/common/images/spinner.gif"/>
				</div>
				<div style={showContent} className="padding20 clear">
					<ul>
					    <li><label>Rate:</label>{this.props.rate}&nbsp; &nbsp;{this.props.currency}</li>
					    <li><label>Estimated Delivery Date:</label>{this.props.actualDeliveryDate}</li>
					    <li><label className="showMore" onClick={this.showDetail.bind(this)}>Show more</label>
					    	
					    </li>
					    <li style={showMore} className="padding20">
					    	<textarea rows="20" cols="70" value={result}>
					    	</textarea>
					    </li>
					    
					</ul>
				</div>
				<div className="basefont red bold title1 level1 bottomBD padding10x0">
					{errorMessage}
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	productDetail: state.priceAndAvailability.lineItems[0],
	rate: state.rate,
	currency: state.currency,
	actualDeliveryDate: state.actualDeliveryDate,
	estimating: state.estimating,
	result: state.result,
	showMore: state.showMore,
	error: state.error
})

ShippingEstimation = connect(mapStateToProps)(ShippingEstimation)
export default ShippingEstimation