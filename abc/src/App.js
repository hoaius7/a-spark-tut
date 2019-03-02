import React, {Component} from 'react';
import Container from './containers/Container';
import Footer from './components/ui/Footer';
import {Route} from 'react-router-dom'
import './App.css';

import PriceAvailabilityApi from './components/PriceAvailabilityApi';
import SupplierApi from './components/SupplierApi';
import JsonConverterApi from './components/JsonConverterApi';
import CsvConverterApi from './components/CsvConverterApi';
import ShoppingCartApi from './components/ShoppingCartApi';
import OrderApi from './components/OrderApi';
import ProductSearchApi from './components/product-search/ProductSearchApi';
import WorkflowApi from './components/WorkflowApi';
import ShippingEstimationApi from "./components/shipping/ShippingEstimationApi";
import ShippingEstimationDetailsApi from "./components/shipping/ShippingEstimationDetailsApi";

class App extends Component {
    render() {
        return (
            <div id="wrapper">
                <Route exact path="/" component={Container}/>
                <Route exact path="/workflow" component={WorkflowApi}/>
                <Route exact path="/price-availability" component={PriceAvailabilityApi}/>
                <Route exact path="/supplier" component={SupplierApi}/>
                <Route exact path="/shopping-cart" component={ShoppingCartApi}/>
                <Route exact path="/order" component={OrderApi}/>
                <Route exact path="/product-search" component={ProductSearchApi}/>
                <Route exact path="/json-converter" component={JsonConverterApi}/>
                <Route exact path="/csv-converter" component={CsvConverterApi}/>
                <Route exact path="/shipping-estimation" component={ShippingEstimationApi}/>
                <Route exact path="/shipping-estimation/:id" component={ShippingEstimationDetailsApi}/>
                <Footer/>
            </div>
        );
    }
}

export default App;
