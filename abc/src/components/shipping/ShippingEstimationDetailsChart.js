import React from 'react';
import {Chart} from "react-google-charts";

const options = {
    bubble: {
        textStyle: {
            fontSize: 12,
            bold: true
        },
    },
    vAxis: {
        title: 'Cost',
        baseline: 1,
        viewWindow: {min: 0, max: 100},
        gridlines: {
            color: 'transparent'
        }
    },
    hAxis: {
        title: 'Time',
        viewWindow: {min: 0, max: 6},
        gridlines: {
            color: 'transparent'
        }
    }

};

const rootProps = {
    'data-testid': '1'
}

const shippingEstimationDetailsChart = (props) => {
    let data = [
        ['ID', 'Delivery Days', 'Cost']
    ];

    props.data.map(item => data.push([item.service_type, item.delivery_days, item.shipping_amount.amount]));

    let vmax = 0;
    let hmax = 0;

    if (data.length > 1) {
        for (let i = 0; i < data.length; i++) {
            if (data[i][2] > vmax) {
                vmax = data[i][2] * 1.2;
            }
            if (data[i][1] > hmax) {
                hmax = data[i][1] + 1;
            }
        }
    }

    options.vAxis.viewWindow.max = vmax;
    options.hAxis.viewWindow.max = hmax;

    return <Chart
            width={'1200px'}
            height={'800px'}
            chartType="BubbleChart"
            loader={<div>Loading Chart</div>}
            data={data}
            options={options}
            rootProps={rootProps}
        />
}

export default shippingEstimationDetailsChart;