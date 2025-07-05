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
import Highcharts, {Chart} from 'highcharts';


const growthData = map(sortBy(data, 'year'), o => at(o, ["year", "debtGrowthRate"]));
const debtData = map(sortBy(data, 'year'), o => at(o, ["year", "debt"]));
const adjustedDebtData = map(sortBy(data, 'year'), o => at(o, ["year", "adjustedDebt"]));
const spendingData = map(sortBy(data, 'year'), o => at(o, ["year", "spending"]));
const adjustedSpendingData = map(sortBy(data, 'year'), o => at(o, ["year", "adjustedSpending"]));
const gdpData = map(sortBy(data, 'year'), o => at(o, ["year", "gdp"]));
const adjustedGdpData = map(sortBy(data, 'year'), o => at(o, ["year", "adjustedGdp"]));
const populationData = map(sortBy(data, 'year'), o => at(o, ["year", "population"]));

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
        text: 'United States National Debt Over Time',
        style: {
            color: '#1f2937',
            fontSize: '20px',
            fontWeight: 'bold'
        }
    },
    legend: {
        align: 'center',
        verticalAlign: 'bottom',
        backgroundColor: 'transparent',
        borderWidth: 0,
        itemStyle: {
            color: '#374151',
            fontSize: '12px'
        }
    },
    chart: {
        height: "100%",
        backgroundColor: '#ffffff',
        style: {
            fontFamily: 'Arial, sans-serif'
        },
    },
    yAxis: [{
        // Growth Rate axis
        min: minY,
        max: maxY,
        title: {
            text: "Debt Growth Rate (%)",
            style: {
                color: '#374151',
                fontWeight: 'bold'
            }
        },
        labels: {
            style: {
                color: '#374151',
                fontSize: '11px'
            }
        },
        gridLineColor: '#e5e7eb',
        lineColor: '#d1d5db',
        tickColor: '#d1d5db',
        plotLines: [{
            color: '#374151',
            width: 2,
            value: 0,
            dashStyle: 'dash',
            label: {
                text: 'Zero Growth',
                align: 'right',
                style: {
                    color: '#374151',
                    fontSize: '11px'
                }
            }
        }]
    }, {
        // Debt/GDP/Spending axis (Billions USD)
        min: 0,
        opposite: true,
        title: {
            text: "Billions USD",
            style: {
                color: '#374151',
                fontWeight: 'bold'
            }
        },
        labels: {
            style: {
                color: '#374151',
                fontSize: '11px'
            }
        },
        gridLineColor: '#e5e7eb',
        lineColor: '#d1d5db',
        tickColor: '#d1d5db'
    }, {
        // Population axis (Millions)
        min: 200,
        max: 350,
        opposite: true,
        offset: 80,
        visible: false,
        title: {
            text: "",
            style: {
                color: '#374151',
                fontWeight: 'bold'
            }
        },
        labels: {
            enabled: false,
            style: {
                color: '#374151',
                fontSize: '11px'
            }
        },
        gridLineColor: 'transparent',
        lineColor: '#d1d5db',
        tickColor: '#d1d5db'
    }],
    xAxis: {
        min: minYear,
        max: maxYear,
        title: {
            text: 'Year',
            style: {
                color: '#374151',
                fontWeight: 'bold'
            }
        },
        labels: {
            style: {
                color: '#374151',
                fontSize: '11px'
            }
        },
        gridLineColor: '#e5e7eb',
        lineColor: '#d1d5db',
        tickColor: '#d1d5db'
    },
    plotOptions: {
        series: {
            events: {
                legendItemClick: function(this: any) {
                    const chart = this.chart;
                    
                    // Wait for the visibility change to take effect
                    setTimeout(() => {
                        // Check which series are visible for each axis
                        const growthSeriesVisible = chart.series.some((s: any) => s.visible && s.yAxis.index === 0);
                        const billionsSeriesVisible = chart.series.some((s: any) => s.visible && s.yAxis.index === 1);
                        const populationSeriesVisible = chart.series.some((s: any) => s.visible && s.yAxis.index === 2);
                        
                        // Show/hide axes based on visible series
                        chart.yAxis[0].update({ 
                            visible: growthSeriesVisible,
                            labels: { enabled: growthSeriesVisible },
                            title: { text: growthSeriesVisible ? "Debt Growth Rate (%)" : "" }
                        }, false);
                        
                        chart.yAxis[1].update({ 
                            visible: billionsSeriesVisible,
                            labels: { enabled: billionsSeriesVisible },
                            title: { text: billionsSeriesVisible ? "Billions USD" : "" }
                        }, false);
                        
                        chart.yAxis[2].update({ 
                            visible: populationSeriesVisible,
                            labels: { enabled: populationSeriesVisible },
                            title: { text: populationSeriesVisible ? "Population (Millions)" : "" }
                        }, false);
                        
                        // Auto-zoom for billions USD axis
                        if (billionsSeriesVisible) {
                            const visibleBillionsSeries = chart.series.filter((s: any) => s.visible && s.yAxis.index === 1);
                            
                            if (visibleBillionsSeries.length > 0) {
                                let minVal = Infinity;
                                let maxVal = -Infinity;
                                
                                visibleBillionsSeries.forEach((s: any) => {
                                    s.points.forEach((point: any) => {
                                        if (point.y !== null && point.y !== undefined) {
                                            minVal = Math.min(minVal, point.y);
                                            maxVal = Math.max(maxVal, point.y);
                                        }
                                    });
                                });
                                
                                if (minVal !== Infinity && maxVal !== -Infinity) {
                                    const margin = (maxVal - minVal) * 0.1;
                                    chart.yAxis[1].setExtremes(Math.max(0, minVal - margin), maxVal + margin, false);
                                }
                            }
                        }
                        
                        // Auto-zoom for population axis
                        if (populationSeriesVisible) {
                            const populationSeries = chart.series.find((s: any) => s.name === 'Population');
                            if (populationSeries && populationSeries.visible) {
                                let minPop = Infinity;
                                let maxPop = -Infinity;
                                
                                populationSeries.points.forEach((point: any) => {
                                    if (point.y !== null && point.y !== undefined) {
                                        minPop = Math.min(minPop, point.y);
                                        maxPop = Math.max(maxPop, point.y);
                                    }
                                });
                                
                                if (minPop !== Infinity && maxPop !== -Infinity) {
                                    const margin = (maxPop - minPop) * 0.1;
                                    chart.yAxis[2].setExtremes(minPop - margin, maxPop + margin, false);
                                }
                            }
                        }
                        
                        chart.redraw();
                        
                        // Re-render political overlays after axis changes
                        setTimeout(() => {
                            renderPoliticalOverlays(chart);
                        }, 50);
                    }, 10);
                }
            }
        }
    },
    series: [{
        name: "Debt Growth Rate",
        type: 'line',
        data: growthData,
        yAxis: 0,
        lineWidth: 2,
        visible: true,
        marker: {
            enabled: true,
            radius: 3
        },
        zones: [{
            value: 0,
            color: '#16a34a', // Green for negative values (debt shrinking)
            fillColor: 'rgba(22, 163, 58, 0.1)'
        }, {
            color: '#dc2626', // Red for positive values (debt growing)
            fillColor: 'rgba(220, 38, 38, 0.1)'
        }]
    }, {
        name: "Debt (Inflation-Adjusted)",
        type: 'line',
        data: adjustedDebtData,
        color: "#2563eb",
        yAxis: 1,
        lineWidth: 2,
        visible: true
    }, {
        name: "Debt (Nominal)",
        type: 'line',
        data: debtData,
        color: "#16a34a",
        yAxis: 1,
        lineWidth: 2,
        visible: false
    }, {
        name: "GDP (Inflation-Adjusted)",
        type: 'line',
        data: adjustedGdpData,
        color: "#7c3aed",
        yAxis: 1,
        lineWidth: 2,
        visible: false
    }, {
        name: "GDP (Nominal)",
        type: 'line',
        data: gdpData,
        color: "#db2777",
        yAxis: 1,
        lineWidth: 2,
        visible: false
    }, {
        name: "Spending (Inflation-Adjusted)",
        type: 'line',
        data: adjustedSpendingData,
        color: "#ea580c",
        yAxis: 1,
        lineWidth: 2,
        visible: false
    }, {
        name: "Spending (Nominal)",
        type: 'line',
        data: spendingData,
        color: "#dc2626",
        yAxis: 1,
        lineWidth: 2,
        visible: false
    }, {
        name: "Population",
        type: 'line',
        data: populationData,
        color: "#059669",
        yAxis: 2,
        lineWidth: 2,
        visible: false
    }]
};

const renderPoliticalOverlays = (chart: Chart) => {
    // Remove existing political overlay elements by class
    try {
        const existingOverlays = chart.container.querySelectorAll('.political-overlay');
        existingOverlays.forEach((overlay: any) => {
            if (overlay.destroy) {
                overlay.destroy();
            } else {
                overlay.remove();
            }
        });
    } catch (error) {
        // Ignore cleanup errors
    }

    for (const president of presidents) {
        // Only show presidents whose terms have started and overlap with our data range
        if (president.from > maxYear) {
            continue; // Skip future presidents beyond our data
        }
        
        const beggingYear = president.from < minYear ? minYear : president.from;
        const endingYear = president.to > maxYear ? maxYear : president.to;

        try {
            const leftPoint = chart.xAxis[0].toPixels(beggingYear);
            const rightPoint = chart.xAxis[0].toPixels(endingYear);

            chart.renderer.rect(leftPoint, chart.plotTop, rightPoint - leftPoint, chart.plotHeight / 3).attr({
                zIndex: -1,
                fill: president.party === "Democrat" ? 'rgba(23, 76, 250, 0.25)' : "rgba(250, 22, 22, 0.25)",
                class: 'political-overlay'
            }).add();

            chart.renderer
                .text(president.name, leftPoint, chart.plotTop + 50, true)
                .css({
                    width: rightPoint - leftPoint,
                    textOverflow: 'wrap',
                })
                .attr({
                    class: 'political-overlay'
                })
                .add();
        } catch (error) {
            console.log(`Failed to display president ${president.name} with this error: ${error}`);
        }
    }

    for (const house of houseControl) {
        // Only show house control periods that overlap with our data range
        if (house.from > maxYear) {
            continue; // Skip future periods beyond our data
        }
        
        const beggingYear = house.from < minYear ? minYear : house.from;
        const endingYear = house.to > maxYear ? maxYear : house.to;

        try {
            const leftPoint = chart.xAxis[0].toPixels(beggingYear);
            const rightPoint = chart.xAxis[0].toPixels(endingYear);

            chart.renderer.rect(leftPoint, chart.plotTop + (chart.plotHeight / 3), rightPoint - leftPoint, chart.plotHeight / 3).attr({
                zIndex: -1,
                fill: house.party === "Democrat" ? 'rgba(23, 76, 250, 0.25)' : "rgba(250, 22, 22, 0.25)",
                class: 'political-overlay'
            }).add();
        } catch (error) {
            console.log(`Failed to add house ${house.party} with error: ${error}`);
        }
    }

    for (const senate of senateControl) {
        // Only show senate control periods that overlap with our data range
        if (senate.from > maxYear) {
            continue; // Skip future periods beyond our data
        }
        
        const beggingYear = senate.from < minYear ? minYear : senate.from;
        const endingYear = senate.to > maxYear ? maxYear : senate.to;

        try {
            const leftPoint = chart.xAxis[0].toPixels(beggingYear);
            const rightPoint = chart.xAxis[0].toPixels(endingYear);

            chart.renderer.rect(leftPoint, chart.plotTop + (chart.plotHeight / 3 * 2), rightPoint - leftPoint, chart.plotHeight / 3).attr({
                zIndex: -1,
                fill: senate.party === "Democrat" ? 'rgba(23, 76, 250, 0.25)' : "rgba(250, 22, 22, 0.25)",
                class: 'political-overlay'
            }).add();
        } catch (error) {
            console.log(`Failed to add senate ${senate.party} with error: ${error}`);
        }
    }
}

const load = (chart: Chart) => {
    renderPoliticalOverlays(chart);
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
