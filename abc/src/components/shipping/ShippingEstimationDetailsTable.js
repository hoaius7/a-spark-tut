import React from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

export default (props) => {
    let data = [];
    for (let i = 0; i < props.data.length; i++) {
        data.push({
            id: i,
            service_type: props.data[i].service_type,
            delivery_days: props.data[i].delivery_days,
            cost: props.data[i].shipping_amount.amount,
            ship_date: props.data[i].ship_date,
            estimated_delivery_date: props.data[i].estimated_delivery_date,
            trackable: props.data[i].trackable
        })
    }

    console.log(props);

    const options = {
        defaultSortName: 'shipping_amount.amount',
        sizePerPage: 10
    };

    return (
        <div className="clear">
            <BootstrapTable data={data} striped pagination search options={options} exportCSV csvFileName='Export_products.csv'>
                <TableHeaderColumn dataField='service_type' isKey width='200' headerAlign='center' dataAlign='left' dataSort={true}>Service Type</TableHeaderColumn>
                <TableHeaderColumn dataField='delivery_days' width='100' headerAlign='center' dataAlign='right' dataSort={true}>Days</TableHeaderColumn>
                <TableHeaderColumn dataField='cost' width='100' headerAlign='center' dataAlign='right' dataSort={true}>Cost</TableHeaderColumn>
                <TableHeaderColumn dataField='ship_date' width='200' headerAlign='center' dataAlign='right' dataSort={true}>Shipping Date</TableHeaderColumn>
                <TableHeaderColumn dataField='estimated_delivery_date' headerAlign='center' width='200' dataAlign='right'>Estimated Delivery Date</TableHeaderColumn>
                <TableHeaderColumn dataField='trackable' headerAlign='center' dataAlign='center' width='100'>Trackable</TableHeaderColumn>
            </BootstrapTable>
        </div>
    );
}