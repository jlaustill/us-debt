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
const minYear = 1970;
const maxYear = 2024;


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
        max: maxY,
        title: {text: "Percent %"}
    }, {
        min: 0,
        max: 40000,
        opposite: true,
        title: {text: "Billions USD"}
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

            chart.renderer
                .text(president.name, leftPoint, chart.plotTop + 50, true)
                .css({
                    width: rightPoint - leftPoint,       // Set the width for wrapping
                    textOverflow: 'wrap', // Enable text wrapping
                })
                .add();
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
            
            <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h2>Data Sources</h2>
                <p>This visualization uses data from official U.S. government sources to ensure accuracy and reliability:</p>
                
                <div style={{ marginBottom: '20px' }}>
                    <h3>National Debt Data</h3>
                    <ul>
                        <li><a href="https://fiscaldata.treasury.gov/datasets/historical-debt-outstanding/" target="_blank" rel="noopener noreferrer">U.S. Treasury Fiscal Data - Historical Debt Outstanding</a></li>
                        <li><a href="https://treasurydirect.gov/government/historical-debt-outstanding/" target="_blank" rel="noopener noreferrer">TreasuryDirect - Historical Debt Outstanding</a></li>
                        <li><a href="https://fred.stlouisfed.org/series/GFDEBTN" target="_blank" rel="noopener noreferrer">FRED - Federal Debt: Total Public Debt</a></li>
                    </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3>GDP Data</h3>
                    <ul>
                        <li><a href="https://www.bea.gov/data/gdp/gross-domestic-product" target="_blank" rel="noopener noreferrer">Bureau of Economic Analysis - GDP Data</a></li>
                        <li><a href="https://apps.bea.gov/itable/?ReqID=70&step=1" target="_blank" rel="noopener noreferrer">BEA Interactive Data Application</a></li>
                        <li><a href="https://fred.stlouisfed.org/tags/series?t=bea%3Bgdp" target="_blank" rel="noopener noreferrer">FRED - GDP Data Series</a></li>
                    </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3>Inflation Data (Consumer Price Index)</h3>
                    <ul>
                        <li><a href="https://www.bls.gov/cpi/" target="_blank" rel="noopener noreferrer">Bureau of Labor Statistics - Consumer Price Index</a></li>
                        <li><a href="https://www.bls.gov/regions/mid-atlantic/data/consumerpriceindexhistorical_us_table.htm" target="_blank" rel="noopener noreferrer">BLS - Historical CPI Tables</a></li>
                        <li><a href="https://fred.stlouisfed.org/series/CPIAUCSL" target="_blank" rel="noopener noreferrer">FRED - Consumer Price Index for All Urban Consumers</a></li>
                    </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3>Federal Spending Data</h3>
                    <ul>
                        <li><a href="https://www.whitehouse.gov/omb/information-resources/budget/historical-tables/" target="_blank" rel="noopener noreferrer">Office of Management and Budget - Historical Tables</a></li>
                        <li><a href="https://www.govinfo.gov/app/details/BUDGET-2025-TAB" target="_blank" rel="noopener noreferrer">Government Publishing Office - Budget Historical Tables</a></li>
                        <li><a href="https://www.cbo.gov/data/budget-economic-data" target="_blank" rel="noopener noreferrer">Congressional Budget Office - Budget and Economic Data</a></li>
                    </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3>Population Data</h3>
                    <ul>
                        <li><a href="https://fred.stlouisfed.org/series/POPTHM" target="_blank" rel="noopener noreferrer">FRED - U.S. Population (Monthly)</a></li>
                        <li><a href="https://fred.stlouisfed.org/release?rid=118" target="_blank" rel="noopener noreferrer">FRED - Annual Population Estimates</a></li>
                        <li><a href="https://fred.stlouisfed.org/source?soid=19" target="_blank" rel="noopener noreferrer">FRED - U.S. Census Bureau Data</a></li>
                    </ul>
                </div>

                <p style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>
                    <strong>Note:</strong> All data is sourced from official U.S. government agencies to ensure accuracy and reliability. 
                    Debt figures are adjusted to 2000 USD using Consumer Price Index data from the Bureau of Labor Statistics.
                    Growth rates are calculated based on inflation-adjusted debt values.
                </p>
            </div>
        </>
    )
}

export default App
