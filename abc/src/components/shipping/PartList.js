import React, {Component} from 'react';
import { connect } from 'react-redux';
import ShippingEstimationApi from './ShippingEstimationApi'

class PartList extends Component {
	constructor(props) {
		super(props);
		console.log(props);
		this.state = {keyword: "", priceAndAvailability: {}, product: {}};
		console.log("state", this.state);
		
	}

	componentWillReceiveProps(props) {
		this.setState({product: {}, keyword: props.keyword, priceAndAvailability: props.priceAndAvailability});
		if (props.priceAndAvailability && props.priceAndAvailability.lineItems) {
			var product = props.priceAndAvailability.lineItems[0];
			this.setState({product: product});
		}
	}

	render() {
		var content = {"minHeight": "500px", "clear": "both"};
		// var company = "";
		// if (this.state.priceAndAvailability && this.state.priceAndAvailability.company) {
		// 	company = this.state.priceAndAvailability.company;
		// }
		var currency = "";
		if (this.state.priceAndAvailability &&this.state.priceAndAvailability.currency) {
			currency = this.state.priceAndAvailability.currency;
			if (currency === "USD") {
				currency = "$";
			}
		}

		var price = "";
		if (this.state.priceAndAvailability &&this.state.product.netPrice) {
			price = currency + this.state.product.netPrice;
		}

		var quantity = "0";
		if (this.state.priceAndAvailability && this.state.product.quantity) {
			quantity = this.state.product.quantity;
		}

		var partNumber = "";
		var partLink = "";
		if (this.state.product && this.state.product.partNumber) {
			partNumber = this.state.product.partNumber;
			partLink = "https://www.aviall.com/aviallstorefront/p/" + partNumber;
		}

		var productDetailStyle ={width:"530px",margin:"10px 0px 10px 10px"};
		
		var existKeyword = this.state.keyword !== "";
		var existResult = existKeyword && this.state.product.partNumber && !this.state.product.errors;
		var errorMessage = "";
		if (this.state.product.errors) {
			errorMessage = this.state.product.errors[0].errorMessage;
		}
		var displayContent = "displayBlock";
		if (!existKeyword) {
			displayContent = "displayNone";
		}

		var product = this.state.product;
		
		var tableContent = "";
		if (product && product.locationAvailabilities) {
			tableContent = product.locationAvailabilities.map(function(item){
																return (
																	<tr key={item.location}>
																		<td>{item.location}</td>
																		<td>{item.availQuantity}</td>
																	</tr>
																	)
															});
		}
		console.log("tableContent", tableContent);
		return (
			<div className="PriceAndAvailability" style={content}>
					{
					existResult ? (
								<div className={displayContent}>
									<div className="basefont title1 level1 babyBlue border bottomBD textBD padding10 textAlignLeft">
										Results for&nbsp; &#34;{this.state.keyword}&#34;
									</div>
									<div className="basefont border textBD bottomBD relative">
									 	<div style={productDetailStyle} className="background-color product-item-details inlineblock verticalTop">
											<div className="level5 basefont">
												<div className="basefont level3 textLeft padding10x0">
													<a href={partLink} title={partNumber} className="productMainLink baselink level3 basefont blue hoverBrightBlue">
														<span className="padding20">PartNumber: {partNumber}</span>
													</a>
												</div>
												<div className="left">
													<div className="basefont level3">
														<span className="left">
															Quantity:
															<span className="padding0x10 basefont level3 red bold">
																{quantity}
															</span>
														</span>
													</div>
												</div>
												<div className="floatRight">
										        	<div className="basefont level3">Your Price:
															<span className="padding0x10 basefont level3 red bold">
																{price}&nbsp;each
															</span>	
										        	</div>
												</div>
												<div className="clear padding10">
													<table>
														<thead>
															<tr>
																<th>Location</th>
																<th>Available</th>
															</tr>
														</thead>	
														<tbody>
														{tableContent}
														</tbody>
													</table>
												</div>
									        </div>
									    </div>
									 </div>
									 <ShippingEstimationApi/>
								</div>
								) : 
								(
								<div className={displayContent}>
									<div className="basefont red bold title1 level1 border bottomBD padding10x0">
										No result found for&nbsp; &#34;{this.state.keyword}&#34; <br/>
										{errorMessage}
									</div>	
								</div>
								)
					}
			</div>
			);
	}
}

const mapStateToProps = (state) => ({
  keyword: state.keyword,
  priceAndAvailability: state.priceAndAvailability,
  error: state.error
})

PartList = connect(mapStateToProps)(PartList)
export default PartList