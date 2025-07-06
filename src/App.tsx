import {useRef, useState} from 'react'
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

// Type cast function to help with yAxis access
const getSeriesYAxis = (series: Highcharts.Series): number | undefined => {
    const options = series.options as { yAxis?: number };
    return options.yAxis;
};


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
        gridLineColor: 'rgba(0, 0, 0, 0.05)',
        gridLineWidth: 1,
        lineColor: '#d1d5db',
        tickColor: '#d1d5db',
        plotLines: [
            // Subtle vertical lines for major political transitions
            { value: 1981, color: 'rgba(0, 0, 0, 0.1)', width: 1, dashStyle: 'Dot' }, // Reagan
            { value: 1993, color: 'rgba(0, 0, 0, 0.1)', width: 1, dashStyle: 'Dot' }, // Clinton
            { value: 2001, color: 'rgba(0, 0, 0, 0.1)', width: 1, dashStyle: 'Dot' }, // Bush
            { value: 2009, color: 'rgba(0, 0, 0, 0.1)', width: 1, dashStyle: 'Dot' }, // Obama
            { value: 2017, color: 'rgba(0, 0, 0, 0.1)', width: 1, dashStyle: 'Dot' }, // Trump
            { value: 2021, color: 'rgba(0, 0, 0, 0.1)', width: 1, dashStyle: 'Dot' }  // Biden
        ]
    },
    plotOptions: {
        series: {
            events: {
                legendItemClick: function(this: Highcharts.Series) {
                    const chart = this.chart;
                    
                    // Wait for the visibility change to take effect
                    setTimeout(() => {
                        // Check which series are visible for each axis
                        const growthSeriesVisible = chart.series.some((s: Highcharts.Series) => s.visible && getSeriesYAxis(s) === 0);
                        const billionsSeriesVisible = chart.series.some((s: Highcharts.Series) => s.visible && getSeriesYAxis(s) === 1);
                        const populationSeriesVisible = chart.series.some((s: Highcharts.Series) => s.visible && getSeriesYAxis(s) === 2);
                        
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
                            const visibleBillionsSeries = chart.series.filter((s: Highcharts.Series) => s.visible && getSeriesYAxis(s) === 1);
                            
                            if (visibleBillionsSeries.length > 0) {
                                let minVal = Infinity;
                                let maxVal = -Infinity;
                                
                                visibleBillionsSeries.forEach((s: Highcharts.Series) => {
                                    s.points.forEach((point: Highcharts.Point) => {
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
                            const populationSeries = chart.series.find((s: Highcharts.Series) => s.name === 'Population');
                            if (populationSeries && populationSeries.visible) {
                                let minPop = Infinity;
                                let maxPop = -Infinity;
                                
                                populationSeries.points.forEach((point: Highcharts.Point) => {
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
        existingOverlays.forEach((overlay: Element) => {
            overlay.remove();
        });
    } catch {
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

const load = (chart: Chart, setIsChartLoading: (loading: boolean) => void) => {
    renderPoliticalOverlays(chart);
    setIsChartLoading(false);
}

function App() {
    const chartComponentRef = useRef<HighchartsReact.RefObject | null>(null);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isChartLoading, setIsChartLoading] = useState(true);

    return (
        <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
            <header style={{ 
                textAlign: 'center', 
                marginBottom: '30px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '40px 20px',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ 
                    fontSize: 'clamp(24px, 4vw, 42px)',
                    fontWeight: '700',
                    margin: '0 0 15px 0',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                    United States National Debt
                </h1>
                <p style={{ 
                    fontSize: 'clamp(16px, 2vw, 20px)',
                    margin: '0',
                    opacity: '0.9',
                    fontWeight: '300'
                }}>
                    Interactive Analysis • 1970-2024 • Open Source
                </p>
            </header>
            
            <main 
                role="main"
                aria-label="Interactive chart of US national debt data"
                style={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    marginBottom: '30px',
                    position: 'relative',
                    minHeight: '400px'
                }}
            >
                {isChartLoading && (
                    <div 
                        role="status"
                        aria-live="polite"
                        aria-label="Loading chart data"
                        style={{
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            right: '0',
                            bottom: '0',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '12px',
                            zIndex: 1000,
                            flexDirection: 'column',
                            gap: '20px'
                        }}
                    >
                        <div 
                            aria-hidden="true"
                            style={{
                                width: '50px',
                                height: '50px',
                                border: '4px solid #e5e7eb',
                                borderTop: '4px solid #2563eb',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}
                        ></div>
                        <p style={{
                            color: '#6b7280',
                            fontSize: '16px',
                            fontWeight: '500',
                            margin: '0'
                        }}>
                            Loading chart data...
                        </p>
                    </div>
                )}
                <div 
                    role="img"
                    aria-label="Interactive line chart showing US national debt from 1970 to 2024. Chart displays debt growth rate, inflation-adjusted debt amounts, GDP, federal spending, and population data. Political context shown with colored background areas for presidential terms and congressional control."
                    tabIndex={0}
                >
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={options}
                        ref={chartComponentRef}
                        callback={(chart: Chart) => load(chart, setIsChartLoading)}
                    />
                </div>
            </main>
            
            <section 
                aria-label="Chart usage instructions"
                style={{ 
                    marginBottom: '30px', 
                    backgroundColor: '#fff7ed', 
                    borderRadius: '12px', 
                    border: '2px solid #fed7aa',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
            >
                <button
                    onClick={() => setIsGuideOpen(!isGuideOpen)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsGuideOpen(!isGuideOpen);
                        }
                    }}
                    aria-expanded={isGuideOpen}
                    aria-controls="user-guide-content"
                    aria-label={`${isGuideOpen ? 'Hide' : 'Show'} chart usage instructions`}
                    style={{
                        width: '100%',
                        padding: '20px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#ea580c'
                    }}
                >
                    <span>📖 How to Use This Chart</span>
                    <span 
                        aria-hidden="true"
                        style={{ 
                            fontSize: '20px',
                            transform: isGuideOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                        }}
                    >
                        ▼
                    </span>
                </button>
                
                {isGuideOpen && (
                    <div 
                        id="user-guide-content"
                        role="region"
                        aria-label="Chart interaction instructions"
                        style={{ 
                            padding: '0 20px 20px 20px',
                            borderTop: '1px solid #fed7aa'
                        }}
                    >
                        <ol style={{ 
                            listStyle: 'none',
                            padding: '0',
                            margin: '15px 0 0 0',
                            display: 'grid', 
                            gap: '15px'
                        }}>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <span 
                                    aria-hidden="true"
                                    style={{ 
                                        minWidth: '24px',
                                        height: '24px',
                                        backgroundColor: '#ea580c',
                                        color: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    1
                                </span>
                                <div>
                                    <strong>Toggle Data Series:</strong> Click any item in the legend below the chart to show/hide that data series. The chart will automatically adjust its axes and scaling.
                                </div>
                            </li>
                            
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <span 
                                    aria-hidden="true"
                                    style={{ 
                                        minWidth: '24px',
                                        height: '24px',
                                        backgroundColor: '#ea580c',
                                        color: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    2
                                </span>
                                <div>
                                    <strong>Compare Different Metrics:</strong> View debt alongside GDP, federal spending, and population data. Mix and match series to explore relationships.
                                </div>
                            </li>
                            
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <span 
                                    aria-hidden="true"
                                    style={{ 
                                        minWidth: '24px',
                                        height: '24px',
                                        backgroundColor: '#ea580c',
                                        color: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    3
                                </span>
                                <div>
                                    <strong>Political Context:</strong> Colored background areas show presidential terms, House control (middle), and Senate control (bottom) to provide political context.
                                </div>
                            </li>
                            
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <span 
                                    aria-hidden="true"
                                    style={{ 
                                        minWidth: '24px',
                                        height: '24px',
                                        backgroundColor: '#ea580c',
                                        color: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    4
                                </span>
                                <div>
                                    <strong>Inflation-Adjusted vs Nominal:</strong> Toggle between raw dollar amounts and inflation-adjusted values (to 2000 USD) for accurate historical comparisons.
                                </div>
                            </li>
                        </ol>
                    </div>
                )}
            </section>
            
            <section 
                aria-label="Share this visualization"
                style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px', textAlign: 'center', border: '2px solid #0ea5e9' }}
            >
                <h3 style={{ color: '#1f2937', marginBottom: '15px' }}>Share This Visualization</h3>
                <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
                    Help spread awareness about US debt trends by sharing this interactive visualization
                </p>
                <nav aria-label="Social sharing options">
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                        <a 
                            href="https://x.com/intent/tweet?text=Check%20out%20this%20interactive%20US%20National%20Debt%20visualization%20%F0%9F%93%8A%20Track%20debt%20growth%2C%20compare%20with%20GDP%20%26%20spending%2C%20see%20political%20impacts%20from%201970-2024.%20All%20data%20verified%20from%20government%20sources%21&url=https%3A%2F%2Fjlaustill.github.io%2Fus-debt%2F&hashtags=USDebt,DataViz,OpenSource,Economics"
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Share on X (opens in new tab)"
                            style={{ 
                                color: '#000000', 
                                textDecoration: 'none', 
                                fontWeight: 'bold',
                                padding: '10px 20px',
                                backgroundColor: '#ffffff',
                                borderRadius: '6px',
                                border: '2px solid #000000',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#000000';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.color = '#000000';
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.outline = '2px solid #000000';
                                e.currentTarget.style.outlineOffset = '2px';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.outline = 'none';
                            }}
                        >
                            <span aria-hidden="true">𝕏</span>
                            Share on X
                        </a>
                        <a 
                            href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fjlaustill.github.io%2Fus-debt%2F"
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Share on Facebook (opens in new tab)"
                            style={{ 
                                color: '#1877f2', 
                                textDecoration: 'none', 
                                fontWeight: 'bold',
                                padding: '10px 20px',
                                backgroundColor: '#ffffff',
                                borderRadius: '6px',
                                border: '2px solid #1877f2',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#1877f2';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.color = '#1877f2';
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.outline = '2px solid #1877f2';
                                e.currentTarget.style.outlineOffset = '2px';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.outline = 'none';
                            }}
                        >
                            <span aria-hidden="true">📘</span>
                            Share on Facebook
                        </a>
                        <a 
                            href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fjlaustill.github.io%2Fus-debt%2F"
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Share on LinkedIn (opens in new tab)"
                            style={{ 
                                color: '#0077b5', 
                                textDecoration: 'none', 
                                fontWeight: 'bold',
                                padding: '10px 20px',
                                backgroundColor: '#ffffff',
                                borderRadius: '6px',
                                border: '2px solid #0077b5',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#0077b5';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.color = '#0077b5';
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.outline = '2px solid #0077b5';
                                e.currentTarget.style.outlineOffset = '2px';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.outline = 'none';
                            }}
                        >
                            <span aria-hidden="true">💼</span>
                            Share on LinkedIn
                        </a>
                    </div>
                </nav>
            </section>
            
            <section 
                aria-label="Data sources and methodology"
                style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}
            >
                <h2>Data Sources</h2>
                <p>This visualization uses data from official U.S. government sources to ensure accuracy and reliability:</p>
                
                <div style={{ marginBottom: '20px' }}>
                    <h3>National Debt Data</h3>
                    <ul>
                        <li><a href="https://fiscaldata.treasury.gov/datasets/historical-debt-outstanding/" target="_blank" rel="noopener noreferrer" aria-label="U.S. Treasury Fiscal Data - Historical Debt Outstanding (opens in new tab)">U.S. Treasury Fiscal Data - Historical Debt Outstanding</a></li>
                        <li><a href="https://treasurydirect.gov/government/historical-debt-outstanding/" target="_blank" rel="noopener noreferrer" aria-label="TreasuryDirect - Historical Debt Outstanding (opens in new tab)">TreasuryDirect - Historical Debt Outstanding</a></li>
                        <li><a href="https://fred.stlouisfed.org/series/GFDEBTN" target="_blank" rel="noopener noreferrer" aria-label="FRED - Federal Debt: Total Public Debt (opens in new tab)">FRED - Federal Debt: Total Public Debt</a></li>
                    </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3>GDP Data</h3>
                    <ul>
                        <li><a href="https://www.bea.gov/data/gdp/gross-domestic-product" target="_blank" rel="noopener noreferrer" aria-label="Bureau of Economic Analysis - GDP Data (opens in new tab)">Bureau of Economic Analysis - GDP Data</a></li>
                        <li><a href="https://apps.bea.gov/itable/?ReqID=70&step=1" target="_blank" rel="noopener noreferrer" aria-label="BEA Interactive Data Application (opens in new tab)">BEA Interactive Data Application</a></li>
                        <li><a href="https://fred.stlouisfed.org/tags/series?t=bea%3Bgdp" target="_blank" rel="noopener noreferrer" aria-label="FRED - GDP Data Series (opens in new tab)">FRED - GDP Data Series</a></li>
                    </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3>Inflation Data (Consumer Price Index)</h3>
                    <ul>
                        <li><a href="https://www.bls.gov/cpi/" target="_blank" rel="noopener noreferrer" aria-label="Bureau of Labor Statistics - Consumer Price Index (opens in new tab)">Bureau of Labor Statistics - Consumer Price Index</a></li>
                        <li><a href="https://www.bls.gov/regions/mid-atlantic/data/consumerpriceindexhistorical_us_table.htm" target="_blank" rel="noopener noreferrer" aria-label="BLS - Historical CPI Tables (opens in new tab)">BLS - Historical CPI Tables</a></li>
                        <li><a href="https://fred.stlouisfed.org/series/CPIAUCSL" target="_blank" rel="noopener noreferrer" aria-label="FRED - Consumer Price Index for All Urban Consumers (opens in new tab)">FRED - Consumer Price Index for All Urban Consumers</a></li>
                    </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3>Federal Spending Data</h3>
                    <ul>
                        <li><a href="https://www.whitehouse.gov/omb/information-resources/budget/historical-tables/" target="_blank" rel="noopener noreferrer" aria-label="Office of Management and Budget - Historical Tables (opens in new tab)">Office of Management and Budget - Historical Tables</a></li>
                        <li><a href="https://www.govinfo.gov/app/details/BUDGET-2025-TAB" target="_blank" rel="noopener noreferrer" aria-label="Government Publishing Office - Budget Historical Tables (opens in new tab)">Government Publishing Office - Budget Historical Tables</a></li>
                        <li><a href="https://www.cbo.gov/data/budget-economic-data" target="_blank" rel="noopener noreferrer" aria-label="Congressional Budget Office - Budget and Economic Data (opens in new tab)">Congressional Budget Office - Budget and Economic Data</a></li>
                    </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3>Population Data</h3>
                    <ul>
                        <li><a href="https://fred.stlouisfed.org/series/POPTHM" target="_blank" rel="noopener noreferrer" aria-label="FRED - U.S. Population Monthly data (opens in new tab)">FRED - U.S. Population (Monthly)</a></li>
                        <li><a href="https://fred.stlouisfed.org/release?rid=118" target="_blank" rel="noopener noreferrer" aria-label="FRED - Annual Population Estimates (opens in new tab)">FRED - Annual Population Estimates</a></li>
                        <li><a href="https://fred.stlouisfed.org/source?soid=19" target="_blank" rel="noopener noreferrer" aria-label="FRED - U.S. Census Bureau Data (opens in new tab)">FRED - U.S. Census Bureau Data</a></li>
                    </ul>
                </div>

                <p style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>
                    <strong>Note:</strong> All data is sourced from official U.S. government agencies to ensure accuracy and reliability. 
                    Debt figures are adjusted to 2000 USD using Consumer Price Index data from the Bureau of Labor Statistics.
                    Growth rates are calculated based on inflation-adjusted debt values.
                </p>
            </section>
            
            <footer 
                role="contentinfo"
                aria-label="Open source information and repository links"
                style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f4f8', borderRadius: '8px', textAlign: 'center', borderTop: '3px solid #2563eb' }}
            >
                <h3 style={{ color: '#1f2937', marginBottom: '15px' }}>Open Source & Transparency</h3>
                <p style={{ fontSize: '16px', color: '#374151', marginBottom: '15px' }}>
                    This visualization is completely open source! We believe in transparency and encourage everyone to verify our data and methodology.
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                    Found an error or have an improvement? We welcome contributions! Feel free to review our code, data sources, and calculations.
                </p>
                <nav aria-label="GitHub repository links">
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <a 
                            href="https://github.com/jlaustill/us-debt" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="View source code on GitHub (opens in new tab)"
                            style={{ 
                                color: '#2563eb', 
                                textDecoration: 'none', 
                                fontWeight: 'bold',
                                padding: '8px 16px',
                                backgroundColor: '#ffffff',
                                borderRadius: '6px',
                                border: '2px solid #2563eb',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.color = '#2563eb';
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.outline = '2px solid #2563eb';
                                e.currentTarget.style.outlineOffset = '2px';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.outline = 'none';
                            }}
                        >
                            View Source Code
                        </a>
                        <a 
                            href="https://github.com/jlaustill/us-debt/issues" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Report issues on GitHub (opens in new tab)"
                            style={{ 
                                color: '#059669', 
                                textDecoration: 'none', 
                                fontWeight: 'bold',
                                padding: '8px 16px',
                                backgroundColor: '#ffffff',
                                borderRadius: '6px',
                                border: '2px solid #059669',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#059669';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.color = '#059669';
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.outline = '2px solid #059669';
                                e.currentTarget.style.outlineOffset = '2px';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.outline = 'none';
                            }}
                        >
                            Report Issues
                        </a>
                    </div>
                </nav>
            </footer>
        </div>
    )
}

export default App
