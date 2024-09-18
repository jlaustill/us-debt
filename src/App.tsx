import {useRef} from 'react'
import map from "lodash/map";
import at from "lodash/at";
import sortBy from "lodash/sortBy";

import {HighchartsReact} from 'highcharts-react-official';
import 'highcharts/modules/annotations';
import data from "./data/us-debt";
import presidents from "./data/presidents.ts";
import senateControl from "./data/senate-control.ts";
import houseControl from "./data/house-control.ts";
import Highcharts, {Chart, Point} from 'highcharts';


const growthData = map(sortBy(data, 'year'), o => at(o, ["year", "debtGrowthRate"]));
const debtData = map(sortBy(data, 'year'), o => at(o, ["year", "debt"]));
const adjustedDebtData = map(sortBy(data, 'year'), o => at(o, ["year", "adjustedDebt"]));

// The integration exports only a default component that at the same time is a
// namespace for the related Props interface (HighchartsReact.Props) and
// RefObject interface (HighchartsReact.RefObject). All other interfaces
// like Options come from the Highcharts module itself.

const maxY: number = 25;
const minY: number = -5;
const minYear = 1978;
const maxYear = 2023;


const options
    = {
    title: {
        text: 'United States National Debt Over Time'
    },
    chart: {
        height: "100%",
    },
    yAxis: [{
        min: minY,
        max: maxY
    }, {
        min: 0,
        max: 40000,
        opposite: true
    }],
    xAxis: {
        min: minYear,
        max: maxYear
    },
    series: [{
        name: "Growth Rate",
        type: 'line',
        data: growthData,
        color: "black",
        yAxis: 0
    }, {
        name: "Unadjusted Debt",
        type: 'line',
        data: debtData,
        color: "green",
        yAxis: 1
    }, {
        name: "Debt in 2000 USD",
        type: 'line',
        data: adjustedDebtData,
        color: "blue",
        yAxis: 1
    }]
};

const load = (chart: Chart) => {
    for (const president of presidents) {
        const beggingYear = president.from < minYear ? minYear : president.from;
        const endingYear = president.to > maxYear ? maxYear : president.to;

        try {
            const leftPoint = chart.series[0].xAxis.toPixels(chart.series[0].points.find(p => p.x === beggingYear)?.x || 0);
            const rightPoint = chart.series[0].xAxis.toPixels(chart.series[0].points.find(p => p.x === endingYear)?.x || 0);

            chart.renderer.rect(leftPoint, chart.plotTop, rightPoint - leftPoint, chart.plotHeight / 3).attr({
                // stroke: 'fuchsia',
                zIndex: -1,
                fill: president.party === "Democrat" ? 'rgba(23, 76, 250, 0.25)' : "rgba(250, 22, 22, 0.25)"
            }).add();
        } catch (error) {
            console.log(`Failed to display president ${president.name} with this erro: ${error}`);
        }
    }

    for (const house of houseControl) {
        const beggingYear = house.from < minYear ? minYear : house.from;
        const endingYear = house.to > maxYear ? maxYear : house.to;

        try {
            const leftPoint = chart.series[0].xAxis.toPixels(chart.series[0].points.find(p => p.x === beggingYear)?.x || 0);
            const rightPoint = chart.series[0].xAxis.toPixels(chart.series[0].points.find(p => p.x === endingYear)?.x || 0);

            chart.renderer.rect(leftPoint, chart.plotTop + (chart.plotHeight / 3), rightPoint - leftPoint, chart.plotHeight / 3).attr({
                // stroke: 'fuchsia',
                zIndex: -1,
                fill: house.party === "Democrat" ? 'rgba(23, 76, 250, 0.25)' : "rgba(250, 22, 22, 0.25)"
            }).add();
        } catch (error) {
            console.log(`Failed to add house ${house.party} with error: ${error}`);
        }
    }

    for (const senate of senateControl) {
        const beggingYear = senate.from < minYear ? minYear : senate.from;
        const endingYear = senate.to > maxYear ? maxYear : senate.to;

        try {
            const leftPoint: number | undefined = chart.series[0].xAxis.toPixels(chart.series[0].points.find((p: Point) => p.x === beggingYear)?.x || 0);
            const rightPoint: number | undefined = chart.series[0].xAxis.toPixels(chart.series[0].points.find((p: Point) => p.x === endingYear)?.x || 0);

            if (leftPoint && rightPoint) {
                chart.renderer.rect(leftPoint, chart.plotTop + (chart.plotHeight / 3 * 2), rightPoint - leftPoint, chart.plotHeight / 3).attr({
                    // stroke: 'fuchsia',
                    zIndex: -1,
                    fill: senate.party === "Democrat" ? 'rgba(23, 76, 250, 0.25)' : "rgba(250, 22, 22, 0.25)"
                }).add();
            }
        } catch (error) {
            console.log(`Failed to add senate ${senate.party} with error: ${error}`);
        }
    }
}

function App() {
    const chartComponentRef = useRef<HighchartsReact.RefObject | null>(null);

    return (
        <>
            <h1>United States Of America - National Debt Owed Over Time</h1>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
                ref={chartComponentRef}
                callback={load}
            />
        </>
    )
}

export default App
