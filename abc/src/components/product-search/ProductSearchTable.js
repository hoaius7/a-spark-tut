import React from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

const productFormatter = (cell, row) => {
    return `<a  title='View detail' href='https://www.aviall.com/aviallstorefront/p/${cell}' target='_blank'>${cell}</a>`;
}

const productSearchTable = props => {
    // let products = [];
    // for (let i = 0; i < props.data.length; i++) {
    //     if (props.data[i].code.includes(props.productCodes)) {
    //         products.push(props.data[i]);
    //     }
    // }
    // for (let i = 0; i < props.data.length; i++) {
    //     if (!props.data[i].code.includes(props.productCodes)) {
    //         products.push(props.data[i]);
    //     }
    // }

    console.log(props);

    return <BootstrapTable data={props.data} remote={true} pagination={true}
                           fetchInfo={{dataTotalSize: props.totalDataSize}}
                           options={{
                               sizePerPage: props.sizePerPage,
                               onPageChange: props.onPageChange,
                               sizePerPageList: [5, 10, 20, 50],
                               page: props.currentPage,
                               onSizePerPageList: props.onSizePerPageList
                           }}
                           hover
    >
        <TableHeaderColumn dataField='code' dataFormat={productFormatter} isKey={true} headerAlign='center'>Code</TableHeaderColumn>
        <TableHeaderColumn dataField='name' headerAlign='center'>Name</TableHeaderColumn>
        <TableHeaderColumn dataField='partNumber' headerAlign='center'>Part Number</TableHeaderColumn>
        <TableHeaderColumn dataField='manufacturer' headerAlign='center'>Manufacturer</TableHeaderColumn>
    </BootstrapTable>
}

export default productSearchTable;
