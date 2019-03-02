import React from 'react';
import Header from '../components/ui/Header';
import HelloApiItem from '../components/items/HelloApiItem';
import PriceAvailabilityApiItem from '../components/items/PriceAvailabilityApiItem';
import SupplierApiItem from '../components/items/SupplierApiItem';
import JsonConverterApiItem from '../components/items/JsonConverterApiItem';
import ProductSearchApiItem from '../components/items/ProductSearchApiItem';
import ShoppingCartApiItem from '../components/items/ShoppingCartApiItem';
import OrderApiItem from '../components/items/OrderApiItem';
import WorkflowItem from '../components/WorkflowItem';
import ShippingEstimationApiItem from '../components/items/ShippingEstimationApiItem';

const Container = () => (
	<div id="wrapper">
	   <Header/>
      <div id="main">
        <div className="inner">
          <section className="tiles">
              <ShippingEstimationApiItem />
          	<WorkflowItem/>
            <ProductSearchApiItem/>
            <PriceAvailabilityApiItem/>
            <SupplierApiItem/>
            <ShoppingCartApiItem/>
            <OrderApiItem/>
            <JsonConverterApiItem/>
            <HelloApiItem/>
          </section>
        </div>
      </div>
    </div>
);

export default Container;