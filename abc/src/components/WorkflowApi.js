import React, {Component} from 'react';
import { connect } from 'react-redux';
import HeaderForApi from './ui/HeaderForApi';
import RestConsole from './common/RestConsole';
import axios from 'axios';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import { Router } from 'react-router';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css

const aviallCartUrl = process.env.REACT_APP_VIEW_AVIALL_CART_URL;
const aviallProductThumbnailUrl = process.env.REACT_APP_VIEW_PRODUCT_THUMBNAIL_URL;
var selectedPartNumber = '';
var addtoCartItems = '';
var flagPrice = false;
var flagSearch = false;
var flagCart = false;
var waitingCart = {display: "none"};
var showContentCart = {display: "none"};

function onRowSelectSearch(row, isSelected, e) {
  let rowStr = '';
  // for (const prop in row) {
  //   rowStr += prop + ': "' + row[prop] + '"';
  // }

  rowStr = row['aviall_part_number'];
  selectedPartNumber = selectedPartNumber + rowStr + ',';

  console.log(e);
}

const selectRowPropSearch = {
	  mode: 'checkbox',
	  clickToSelect: true,
	  bgColor: 'cyan',
	  showOnlySelected: true,
	  columnWidth: '35px',
	  onSelect: onRowSelectSearch
}

function onRowSelectPrice(row, isSelected, e) {
  let rowStr = '';
  // for (const prop in row) {
  //   rowStr += prop + ': "' + row[prop] + '"';
  // }
  rowStr = row['partNumber'] + ',' + row['addQuantity'];
  // addtoCartItems = addtoCartItems + rowStr + ';';
  console.log(e);
}

const selectRowPropPrice = {
	  mode: 'checkbox',
	  clickToSelect: true,
	  bgColor: 'cyan',
	  showOnlySelected: true,
	  columnWidth: '60px',
	  onSelect: onRowSelectPrice
}

const cellEditProp = {
  mode: 'click'
};

function jobStatusValidator(value) {
  const nan = isNaN(parseInt(value, 10));
  if (nan) {
    return 'Quantity be a integer!';
  }
  return true;
}

class WorkFlow extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	handleClick = () => {
        this.props.history.push("priceavailability-api");
    }

    invalidJobStatus = (cell, row) => {
    	console.log(`${cell} at row id: ${row.id} fails on editing`);
    	return 'invalid-jobstatus-class';
  	}

    editingJobStatus = (cell, row) => {
    	console.log(`${cell} at row id: ${row.id} in current editing`);
    	return 'editing-jobstatus-class';
  	}
	
  	addToCartFormatter(cell, row) {
	  return <div>
	  			<img onClick={() => this.addToCart(cell, row.partNumber, row.addQuantity)} src="static/img/Add_to_Cart.png"></img>
	  		  </div>;
	}

/*	set input box for add quantity
	addQuantityFormatter(cell, row) {
	  return <div>
	   			<img src="static/img/input_box.png"></img>
	  		 </div>;
	}
*/	
	
	buildMetadata(startTime, res) {
		var endTime = new Date().getTime();
		var responseTime = endTime - startTime;
		return {name: 'Template api', responseTime: responseTime, status: res.status, contentType: res.headers['content-type'], contentLength: Math.floor((JSON.stringify(res.data).length / 1024) * 100)/100};
	}

	locationQuantitiesFormatter(cell, row) {
		var formattedData = [];
		cell.forEach(function(item) {
			formattedData.push(item.location + ":" + item.availQuantity);
		});
		return formattedData.join(";");
	}
	
	productFormatter(cell, row) {
	  return `<a  title='View detail' href='https://www.aviall.com/aviallstorefront/p/${cell}' target='_blank'>${cell}</a>`;
	}

	removeFormatter(cell, row) {
	  return <div>
	  			{cell + 1}&nbsp;
	  			<img onClick={() => this.remove(cell, row.partNumber)} src='https://www.aviall.com/aviallstorefront/_ui/desktop/theme-aviall/images/cartPage/remove_CartItem.png'></img>
	  		  </div>;
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

	removeProductAndRefresh(entry) {
		var self = this;
		// var apiUrl = this.state.url;
		var apiUrl = "https://api-test-services:8443/shopping-cart-api/cart/{cartId}/_remove_item/{entry}";
		var url = apiUrl.replace('{cartId}', 0).replace('{entry}', entry);
		// var auth = self.buildAuthHeaders();
		var auth = {headers: {'X-Username': 'gjpvn@ramco.com', 'X-Password': 'Aviall321'}};

		axios.delete(url, auth)
			.then(res => {
				var getCartUrl = "https://api-test-services:8443/shopping-cart-api/cart";
				self.getCart(getCartUrl, auth);
			}).catch(function(error) {
				alert('Cannot remove this product with error:');
			});
	}

	getCart(apiUrl, auth) {
		var self = this;
		var startTime = new Date().getTime();
		console.log(auth);
		axios.get(apiUrl, auth)
			.then(res => {
				self.props.dispatch({type: "invokeAPI", rawCartData: res.data, metadata: self.buildMetadata(startTime, res), error: "", invokeAPIProgress: "done"});
			}).catch(function(error) {
				self.errorHandler(error, startTime);
			});
	}

	invokeAPI() {
		var self = this;

		var apiKey = this.refs.API_Key.value;
		
		var auth = {headers: {'x-api-key': apiKey}};
		
		/* 
		var keyword = this.refs.keyword.value;
		var apiUrl = this.getEndpoint() + "?query=" + keyword; */
		
		var partNumber = this.refs.aviall_part_number.value;
		var supplierName = this.refs.supplier_name.value;
		var supplierCode = this.refs.supplier_code.value;
		var apiUrl = this.getEndpoint() + "?";

		this.refs.searchTable.reset();
		selectedPartNumber = ""

		if (partNumber){
			apiUrl += "aviall_part_number=" + partNumber + "&";
		}
		
		if (supplierName){
			apiUrl += "supplier=" + supplierName + "&";
		}

		if (supplierCode){
			apiUrl += "supplier_code=" + supplierCode + "&";
		}
		
		apiUrl += "size=200" ;
		
		self.props.dispatch({type: "invokeAPI", invokeApiProgress: "inprogress"});
		var startTime = new Date().getTime();
		axios.get(apiUrl, auth)
			.then(res => {

				self.props.dispatch({type: "invokeAPI", rawData: res.data, metadata: self.buildMetadata(startTime, res), error: "", invokeApiProgress: "done"});
			}).catch(function (error) {
				console.log(error)
				if (error.response && error.response.data) {
					var errorMessage = "Error message: " + error.response.status;
					if (error.response.data.message) {
						errorMessage = errorMessage + ": " + error.response.data.message;
					}
					if (error.response.data.description) {
						errorMessage = errorMessage + ": " + error.response.data.description;
					}
					console.log(error.response.data)
					self.props.dispatch({type: "invokeAPI", error: errorMessage, rawData: error.response.data, metadata: self.buildMetadata(startTime, error.response), invokeApiProgress: "done"});	
				} else {
					self.props.dispatch({type: "invokeAPI", error: 'Cannot talk with server', invokeApiProgress: "done"});	
				}
	   		});
	}

	loadApis(apis) {
			console.log('loadapi', apis);
			this.setState({apis: apis});
	}

	formatFont(cell, row) {   // String example
		if (cell) {
	  		return `<p  style='font-size: 18px'>${cell}</p>`;
		}
	}

	productFormatter(cell, row) {   // String example
	  return `<a  title='View detail' href='https://www.aviall.com/aviallstorefront/p/${cell}' target='_blank'>${cell}</a>`;
	}

	descriptionFormatter(cell, row) {   // String example
	  var thumbnailUrl = aviallProductThumbnailUrl.replace("{productCode}", row.partNumber);
	  return `<img  src='${thumbnailUrl}'/><br>${cell}`;
	}

	getEndpoint() {
		var productSearchEndpoint = 'https://2fin7lsa3d.execute-api.us-east-1.amazonaws.com/test';
		// if (this.state.apis && this.state.apis['product-search-api-v2']) {
		// 	productSearchEndpoint = this.state.apis['product-search-api-v2'].endpoint;	
		// }
		return productSearchEndpoint;
	}

	getPriceAndAvailability() {
		
		var priceAvailabilityEndpoint = 'https://api-test-services:8443/priceavailability-api/products/price-availability'; //for testing/* 
		{ /*
		if (this.state.apis && this.state.apis['price-availability-api']) {
			priceAvailabilityEndpoint = this.state.apis['price-availability-api'].endpoint;	 */
		}
		
		var self = this;
		var auth = {headers: {'x-api-key': 'CY8iQ06kQwXii7F9KPs44MY8xgRO3KLizBd3WLg0', 'x-username': 'gjpvn@ramco.com','x-password': 'Aviall321'}};
		var body = { "showNoStock": false ,"productCodes": selectedPartNumber.split(",")};
		
		self.props.dispatch({type: "Search", searching: "inprogress"});
		var startTime = new Date().getTime();
		axios.post(priceAvailabilityEndpoint, body, auth)
			.then(res => {
				self.props.dispatch({type: "Search", searching: "done", metadata: self.buildMetadata(startTime, res), result: res.data});
			}).catch(function (error) {
				if (error.response && error.response.data) {
					var errorMessage = "Error message: " + error.response.status;
					if (error.response.data.message) {
						errorMessage = errorMessage + ": " + error.response.data.message;
					}
					if (error.response.data.description) {
						errorMessage = errorMessage + ": " + error.response.data.description;
					}
					self.props.dispatch({type: "Search", searching: "none", metadata: self.buildMetadata(startTime, error.response), result: {}, error: errorMessage});
				} else {
					self.props.dispatch({type: "Search", error: 'Cannot talk with server', searching: "none"});	
				}
	  		});	
	}

	addToCart(cell, partNumber, addQuantity) {
		var self = this;
		if (addQuantity == null)
		{

			confirmAlert({
				title: '',
				message: 'Add to cart quantity must not be empty',
				buttons: [
				  {
					  label: 'continue',
					  onClick: () => console.log('cancel')
				  }
				]
			})
			return;
		}

		addtoCartItems = partNumber + ',' + addQuantity + ';';	
		confirmAlert({
	      title: '',
	      message: 'Are you sure to add the part ' + partNumber + ' with quantity ' + addQuantity + ' to the cart',
	      buttons: [
	        {
	          label: 'Yes',
	          onClick: () => self.invokeAddToCartAPI()
	        },
	        {
	          label: 'No',
	          onClick: () => console.log('cancel')
	        }
	      ]
	    });

	}

	invokeAddToCartAPI() {
		// var apiUrl = 'https://api-test-gateway:8244/shopping-cart-api/1.0.0/cart/_add_item';	
		// var auth = {headers: {'Authorization': 'Bearer ' + '32e43009-33f0-3d0f-9075-3c703d1224d4', 'X-Username': 'gjpvn@ramco.com', 'X-Password': 'Aviall321'}};
		var apiUrl = 'https://api-test-services:8443/shopping-cart-api/cart/_add_item';
		var auth = {headers: {'X-Username': 'gjpvn@ramco.com', 'X-Password': 'Aviall321'}};
		console.log(auth) ; 
		this.addProduct(apiUrl, auth);		
		return;	
	}

	addProduct(apiUrl, auth) {
		var self = this;
		var productsAndQuantities = [];
		addtoCartItems.split(";").forEach(function(productQuantity) {
			if (productQuantity.indexOf(',') > 0) {
				productsAndQuantities.push({'productCode': productQuantity.split(',')[0].trim(), 'quantity': parseInt(productQuantity.split(',')[1])})	
			}
		});
		
		if (productsAndQuantities.size == 0) {
			alert('Please insert valid format for product and quantity');
			return;
		}
		
		self.props.dispatch({type: "invokeAPI", error: "", invokeAddToCartAPIProgress: "inprogress"});

		var startTime = new Date().getTime();
		axios.post(apiUrl, productsAndQuantities, auth)
			.then(res => {
				self.props.dispatch({type: "invokeAPI", rawCartData: res.data, metadata: self.buildMetadata(startTime, res), error: "", invokeAddToCartAPIProgress: "done"});
			}).catch(function(error) {
				self.errorHandler(error, startTime);
			});
	}

	render() {
//Cart
		var waitingCart = {display: "none"};
		var showContentCart = {display: "none"};
		var cartTitle = {fontWeight: 600};
		var cartId = "";
		var totalPrice = "";
		var totalItems = "";
		var entries = [];
		var showDetail = {display: "block"}
		var waiting = {display: "none"};
		var showContent = {display: "none"};
		var waitingPrice = {display: "none"};
		var showContentPrice = {display: "none"};
		// alert(flagSearch);
		if (this.props && this.props.invokeApiProgress === "inprogress") {
			waiting = {display: "block"};
			showContent = {display: "none"};
			showContentCart = {display: "none"};
			showContentPrice = {display: "none"};
			flagSearch = true;
		}
		if (flagSearch == true && this.props.invokeApiProgress === "done") {
			showContent = {display: "block"};
			flagSearch = false;
		}

		if (this.props.searching === "inprogress") {
			waitingPrice = {display: "block"};
			showContent = {display: "block"};
			showContentPrice = {display: "none"};
			flagPrice = true;
		}

		if (flagPrice == true && this.props.searching === "done") {
			showContent = {display: "none"};
			showContentPrice = {display: "block"};
			flagPrice = false;
		}

		if (this.props.invokeAddToCartAPIProgress === "inprogress") {
		 	showContentPrice = {display: "block"};
		 	showContentCart = {display: "none"};
		 	waitingCart = {display: "block"};
		 	flagCart = true;
		}
		if (flagCart == true && this.props.invokeAddToCartAPIProgress === "done") {
		    showContentCart = {display: "block"};
		 	showContentPrice = {display: "block"};
		 	// flagCart = false;
		}

		if (this.props.rawCartData && this.props.rawCartData.cart) {
			if (Array.isArray(this.props.rawCartData.cart)) {
				entries = this.props.rawCartData.cart[0].entries;
				cartId = this.props.rawCartData.cart[0].cartId;
				totalItems = this.props.rawCartData.cart[0].totalItems;
				totalPrice = this.props.rawCartData.cart[0].totalPrice + this.props.rawCartData.cart[0].currency;	
			} else if (this.props.rawCartData.cart) {
				entries = this.props.rawCartData.cart.entries;
				cartId = this.props.rawCartData.cart.cartId;
				totalItems = this.props.rawCartData.cart.totalItems;
				totalPrice = this.props.rawCartData.cart.totalPrice + this.props.rawCartData.cart.currency;
			}
		}

//Cart
//Price
		var priceAvailabilityEndpoint = '';
		// if (this.state.apis && this.state.apis['price-availability-api']) {
		// 	priceAvailabilityEndpoint = this.state.apis['price-availability-api'].endpoint;	
		// }
		var checkboxStyle = {width: "20px"} ; 
		var styleCurrency = {padding: "1px", float:"right", color:"#0095da"} ; 
		var priceButtonStyle = {background: "#0095da", }
		var cartButtonStyle = {background: "#0095da", align: "left", }

//Price				
		var productSearchEndpoint = this.getEndpoint();


		var errorMessage = "";
		if (this.props.error) {
			errorMessage = this.props.error;
		}
		const options = {
			defaultSortName: 'quantity',
			sizePerPage: 50
		};
		
		var metadata = this.props.metadata ? this.props.metadata : {};

		var items = []
		
		if (this.props.error) {
			items = [];
		} else if (this.props.rawData && this.props.rawData.items) {
			items = this.props.rawData.items
		
			items.forEach(function(item) {
				if (item.location_availabilities) {
					item.location_availabilities = JSON.stringify(item.location_availabilities);
				}
			});
		}
//////price
		
		var errorMessage = "";
		if (this.props.error) {
			errorMessage = this.props.error;
			
			styleCurrency = {display: "none"} ;
		}

		var metadataPrice = this.props.metadata ? this.props.metadata : {};
		var itemsPrice = [];
		var currency = "USD";
		if (this.props.result && this.props.result.lineItems) {
			currency = this.props.result.currency;
			this.props.result.lineItems.forEach(function(item) {
				var newItem = Object.assign({}, item);
				//newItem.netPrice = newItem.netPrice + currency;
				if (!newItem.errors && (newItem.hasOwnProperty("partNumber")))	 {
					console.log(newItem) ;
					itemsPrice.push(newItem);
					errorMessage = "" ; 
				}
			});
			
		}

//////price		
		console.log('error', this.props.error);
		console.log('items', items)
		this.state = this.defaultState;
		return (
				<div id="wrapper">
					<HeaderForApi apiName={'Workflow (Search - PandA - Cart - Order)'} apiDescription={'Enter keyword for searching product'}  apis={this.loadApis.bind(this)}/>
		        	<div id="main">
		        		<div className="apicontainer inner">
							<div className="container-request">
								<h3 className="request-info">Request</h3>
								<ul>
									<li><label>URL</label>{productSearchEndpoint}</li>
									<li><label>Method</label>GET</li>
									<li><label>API Key</label> <input type="text" ref="API_Key"/></li>
									<li><label>Part number</label> <input type="text" ref="aviall_part_number"/></li>
									<li><label>Supplier</label> <input type="text" ref="supplier_name"/></li>		
									<li><label>Supplier code</label> <input type="text" ref="supplier_code"/></li>											
								    <li>
								    	<div className="buttonContainer">
									    	<input type="button" className="button left" value="Search Product " onClick={this.invokeAPI.bind(this)} />
									    	<img className="left" style={waiting} src="https://www.aviall.com/aviallstorefront/_ui/desktop/common/images/spinner.gif"/>
										</div>
										
								    </li>
								</ul>
								<div className="padding10 clear"> </div>
							</div>
							<div style={showContent} className="container-response">
								<h3 className="response-info">Search Response</h3>
								<div className="error">
									{errorMessage}
								</div>
								<div className="clear">
									<RestConsole metadata={metadata} data={this.props.rawData} />
									<div className="padding20 clear"> </div>
									<BootstrapTable ref="searchTable" data={items} selectRow={ selectRowPropSearch } striped hover pagination search options={ options } exportCSV csvFileName='Export_parts.csv'>
										{ /* <TableHeaderColumn isKey dataField='code' dataFormat={ this.productFormatter } width='100' headerAlign='center' dataAlign='center'>Code</TableHeaderColumn>
										<TableHeaderColumn dataField='partNumber' headerAlign='center' width='100' dataAlign='left' dataSort={ true }>Part Number</TableHeaderColumn>
										<TableHeaderColumn dataField='name' headerAlign='center' dataFormat={ this.formatFont } width='150' dataAlign='left'>Name</TableHeaderColumn>
										<TableHeaderColumn dataField='manufacturer' headerAlign='center' dataFormat={ this.formatFont } dataAlign='left' width='150' dataSort={ true }>Manufacturer</TableHeaderColumn>
										<TableHeaderColumn dataField='description' headerAlign='center' dataFormat={ this.formatFont } dataAlign='left' width='250' dataSort={ true }>Description</TableHeaderColumn> 											
										<TableHeaderColumn isKey dataField='id' dataFormat={ this.productFormatter } width='100'  headerAlign='center' dataAlign='center'>Code</TableHeaderColumn> }
	
											   */   }

										<TableHeaderColumn isKey dataField='aviall_part_number' headerAlign='center' width='130' dataAlign='left' dataSort={ true }>Part Number</TableHeaderColumn>
										<TableHeaderColumn dataField='short_description' headerAlign='center' dataFormat={ this.formatFont } dataAlign='left' width='350' dataSort={ true }>Description</TableHeaderColumn>										
										<TableHeaderColumn dataField='supplier_name' headerAlign='center' dataFormat={ this.formatFont } dataAlign='left' width='70' dataSort={ true }>Supplier</TableHeaderColumn>
										<TableHeaderColumn dataField='location_availabilities' headerAlign='center' dataFormat={ this.formatFont } width='150' dataAlign='left'>Inventory</TableHeaderColumn>
										<TableHeaderColumn dataField='quantity' headerAlign='center' dataFormat={ this.formatFont } width='150' dataAlign='right'>Quantity</TableHeaderColumn>
										<TableHeaderColumn dataField='unit' headerAlign='center' dataFormat={ this.formatFont } width='50' dataAlign='right'>Unit</TableHeaderColumn>
									</BootstrapTable>
								</div>
								<div className="buttonContainer">
									    	<input type="button" style={priceButtonStyle} className="button left" value="Check Price and availability" onClick={this.getPriceAndAvailability.bind(this)}/>
									    	<img className="left" style={waitingPrice} src="https://www.aviall.com/aviallstorefront/_ui/desktop/common/images/spinner.gif"/>
								</div>
							</div>

							<div style={showContentPrice} className="container-response">
								<h3 className="response-info">Price and availability Response</h3>
								<div className="error">
									{errorMessage}
								</div>
									<div className="clear">
										<RestConsole metadata={metadata} data={this.props.result} />
										<div className="padding20 clear" style={styleCurrency}>Currency: USD
									</div>
										<BootstrapTable ref="priceTable" data={itemsPrice} cellEdit={ cellEditProp } striped hover pagination search options={ options } exportCSV csvFileName='Export_parts.csv'>
											<TableHeaderColumn dataField='entryNumber' editable={false} dataFormat={ this.addToCartFormatter.bind(this)  }  width='50' headerAlign='center' dataAlign='center'></TableHeaderColumn>
											<TableHeaderColumn dataField='partNumber' editable={false} isKey={true} headerAlign='center' dataFormat={ this.productFormatter }  width='150' dataAlign='center'>Part Number</TableHeaderColumn>
											<TableHeaderColumn dataField='supplierName' editable={false} headerAlign='center' width='150' dataAlign='left'>Supplier Name</TableHeaderColumn>
											<TableHeaderColumn dataField='leadTime' editable={false} headerAlign='center' dataAlign='center'>Lead Time</TableHeaderColumn>
											<TableHeaderColumn dataField='quantity' editable={false} headerAlign='center' dataAlign='right' dataSort={ true }>Quantity</TableHeaderColumn>
											<TableHeaderColumn dataField='netPrice' editable={false} headerAlign='center' dataAlign='right' dataSort={ true }>Net Price</TableHeaderColumn>
											<TableHeaderColumn dataField='hazmatCode' editable={false} headerAlign='center'  width='140' dataAlign='right'>Hazmat Code</TableHeaderColumn>
											<TableHeaderColumn dataField='NSN' editable={false} headerAlign='center' width='130' dataAlign='right'>NSN</TableHeaderColumn>
											<TableHeaderColumn dataField='addQuantity' dataFormat={ this.addQuantityFormatter }  width='200' editable={ { validator: jobStatusValidator } } editColumnClassName={ this.editingJobStatus } invalidEditColumnClassName={ this.invalidJobStatus }>Add To Cart Quantity</TableHeaderColumn>
											{ /* 
				
											<TableHeaderColumn dataField='netPrice' dataFormat={ this.priceFormatter} headerAlign='center' dataAlign='right' dataSort={ true }>Net Price</TableHeaderColumn> -- original price column with price Formatter
											
											<TableHeaderColumn dataField='locationAvailabilities' dataFormat={ this.locationQuantitiesFormatter } headerAlign='center' dataAlign='right' width='250'>Location:Quantity</TableHeaderColumn> */ }
										</BootstrapTable>
								</div>
							</div>
							<div className="buttonContainer">
								<img className="left" style={waitingCart} src="https://www.aviall.com/aviallstorefront/_ui/desktop/common/images/spinner.gif"/>
								<p style={waitingCart}> <i> Getting cart information</i></p>
							</div>
							<div style={showContentCart} className="container-response">
								<h3 className="response-info">Your Shopping Cart</h3>
								<div className="error">
									{errorMessage}
								</div>
								<div className="clear">
									<RestConsole metadata={metadata} data={this.props.rawCartData} />
									<div className="padding20 clear"> </div>
									<div style={showDetail}>
										<p style={cartTitle}>Total Price: {totalPrice}, &nbsp;Items: {totalItems}, &nbsp; Cart Id: {cartId}
										&nbsp; &nbsp; &nbsp; &nbsp; <a href={aviallCartUrl} target="_blank">View your cart in Aviall.com</a>
										</p>
										
									</div>
									<BootstrapTable data={entries} trClassName='tr-string-example' striped hover pagination search options={ options } exportCSV csvFileName='Export_parts.csv'>
										<TableHeaderColumn isKey dataField='entryNumber' width='50' dataFormat={ this.removeFormatter.bind(this)  } headerAlign='center' dataAlign='center'>No</TableHeaderColumn>
										<TableHeaderColumn dataField='partNumber' dataFormat={ this.productFormatter} width='150' headerAlign='center' dataAlign='center'>Part Number</TableHeaderColumn>
										<TableHeaderColumn dataField='quantity' width='80' headerAlign='center' dataAlign='right' dataSort={ true }>Quantity</TableHeaderColumn>
										<TableHeaderColumn dataField='subTotalPrice' width='80' headerAlign='center' dataAlign='right' dataSort={ true }>Price</TableHeaderColumn>
										<TableHeaderColumn dataField='description' dataFormat={ this.descriptionFormatter } headerAlign='center' width='250' dataAlign='center'>Description</TableHeaderColumn>
									</BootstrapTable>
								</div>
								<div className="buttonContainer">
									    	
									    	<a href="https://lwbh-tst-1a.aviallinc.com/aviallstorefront/checkout/single/summary/">
									    	<input type="button" style={priceButtonStyle} className="button left" value="Place Order"/>
											</a>
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
	rawCartData: state.rawCartData,
	metadata: state.metadata,
	result: state.result,
	searching: state.searching,
	invokeApiProgress: state.invokeApiProgress,
	invokeAddToCartAPIProgress: state.invokeAddToCartAPIProgress,
    error: state.error
})

WorkFlow = connect(mapStateToProps)(WorkFlow)
export default WorkFlow