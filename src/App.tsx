import {useRef, useState} from 'react'
import map from "lodash/map";
import at from "lodash/at";
import sortBy from "lodash/sortBy";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import {HighchartsReact} from 'highcharts-react-official';
import 'highcharts/modules/annotations';
import data from "../data/usdebt.json";
import Highcharts from 'highcharts';
import AnnotationsModule from 'highcharts/modules/annotations';

// Initialize the module
AnnotationsModule(Highcharts);


const growthData = map(sortBy(data, 'year'), o => at(o, ["year", "debtChange"]));

// The integration exports only a default component that at the same time is a
// namespace for the related Props interface (HighchartsReact.Props) and
// RefObject interface (HighchartsReact.RefObject). All other interfaces
// like Options come from the Highcharts module itself.

const maxY: number = 25;
const minY: number = -5;
const minYear = 1978;
const maxYear = 2016;

const presidents = [{
    name: "Jimmy Carter",
    from: 1977,
    to: 1981,
    party: "Democrat"
}, {
    name: "Ronald Reagan",
    from: 1981,
    to: 1989,
    party: "Republican"
}, {
    name: "George H. W. Bush",
    from: 1989,
    to: 1993,
    party: "Republican"
}, {
    name: "Bill Clinton",
    from: 1993,
    to: 2001,
    party: "Democrat"
}, {
    name: "George W. Bush",
    from: 2001,
    to: 2009,
    party: "Republican"
}, {
    name: "Barack Obama",
    from: 2009,
    to: 2017,
    party: "Democrat"
}];

const senateControl = [{
    party: "Democrat",
    from: 1977,
    to: 1979,
}, {
    party: "Democrat",
    from: 1979,
    to: 1981,
}, {
    party: "Democrat",
    from: 1981,
    to: 1983,
}, {
    party: "Republican",
    from: 1983,
    to: 1985,
}, {
    party: "Republican",
    from: 1985,
    to: 1987,
}, {
    party: "Democrat",
    from: 1987,
    to: 1989,
}, {
    party: "Democrat",
    from: 1989,
    to: 1991,
}, {
    party: "Democrat",
    from: 1991,
    to: 1993,
}, {
    party: "Democrat",
    from: 1993,
    to: 1995,
}, {
    party: "Republican",
    from: 1995,
    to: 1997,
}, {
    party: "Republican",
    from: 1997,
    to: 1999,
}, {
    party: "Republican",
    from: 1999,
    to: 2001,
}, {
    party: "Republican",
    from: 2001,
    to: 2003,
}, {
    party: "Republican",
    from: 2003,
    to: 2005,
}, {
    party: "Republican",
    from: 2005,
    to: 2007,
}, {
    party: "Republican",
    from: 2007,
    to: 2009,
}, {
    party: "Democrat",
    from: 2009,
    to: 2011,
}, {
    party: "Democrat",
    from: 2011,
    to: 2013,
}, {
    party: "Democrat",
    from: 2013,
    to: 2015,
}, {
    party: "Democrat",
    from: 2015,
    to: 2017,
}];

const houseControl = [{
    party: "Democrat",
    from: 1977,
    to: 1979,
}, {
    party: "Democrat",
    from: 1979,
    to: 1981,
}, {
    party: "Democrat",
    from: 1981,
    to: 1983,
}, {
    party: "Democrat",
    from: 1983,
    to: 1985,
}, {
    party: "Democrat",
    from: 1985,
    to: 1987,
}, {
    party: "Democrat",
    from: 1987,
    to: 1989,
}, {
    party: "Democrat",
    from: 1989,
    to: 1991,
}, {
    party: "Democrat",
    from: 1991,
    to: 1993,
}, {
    party: "Democrat",
    from: 1993,
    to: 1995,
}, {
    party: "Republican",
    from: 1995,
    to: 1997,
}, {
    party: "Republican",
    from: 1997,
    to: 1999,
}, {
    party: "Republican",
    from: 1999,
    to: 2001,
}, {
    party: "Republican",
    from: 2001,
    to: 2003,
}, {
    party: "Republican",
    from: 2003,
    to: 2005,
}, {
    party: "Republican",
    from: 2005,
    to: 2007,
}, {
    party: "Democrat",
    from: 2007,
    to: 2009,
}, {
    party: "Democrat",
    from: 2009,
    to: 2011,
}, {
    party: "Republican",
    from: 2011,
    to: 2013,
}, {
    party: "Republican",
    from: 2013,
    to: 2015,
}, {
    party: "Republican",
    from: 2015,
    to: 2017,
}];

const options
    = {
    title: {
        text: 'United States National Debt Over Time'
    },
    yAxis: {
        min: minY,
        max: maxY
    },
    xAxis: {
        min: 1978,
        max: 2016
    },
    series: [{
        name: "Growth Rate",
        type: 'line',
        data: growthData
    }]
};

const load = (chart) => {
    for (const president of presidents) {
        const beggingYear = president.from < minYear ? minYear : president.from;
        const endingYear = president.to > maxYear ? maxYear : president.to;

        const leftPoint = chart.series[0].xAxis.toPixels(chart.series[0].points.find(p => p.x === beggingYear).x);
        const rightPoint = chart.series[0].xAxis.toPixels(chart.series[0].points.find(p => p.x === endingYear).x);

        chart.renderer.rect(leftPoint, chart.plotTop, rightPoint - leftPoint, chart.plotHeight / 3).attr({
            // stroke: 'fuchsia',
            zIndex: -1,
            fill: president.party === "Democrat" ? 'rgba(23, 76, 250, 0.25)' : "rgba(250, 22, 22, 0.25)"
        }).add();
    }

    for (const house of houseControl) {
        const beggingYear = house.from < minYear ? minYear : house.from;
        const endingYear = house.to > maxYear ? maxYear : house.to;

        const leftPoint = chart.series[0].xAxis.toPixels(chart.series[0].points.find(p => p.x === beggingYear).x);
        const rightPoint = chart.series[0].xAxis.toPixels(chart.series[0].points.find(p => p.x === endingYear).x);

        chart.renderer.rect(leftPoint, chart.plotTop + (chart.plotHeight / 3), rightPoint - leftPoint, chart.plotHeight / 3).attr({
            // stroke: 'fuchsia',
            zIndex: -1,
            fill: house.party === "Democrat" ? 'rgba(23, 76, 250, 0.25)' : "rgba(250, 22, 22, 0.25)"
        }).add();
    }

    for (const senate of senateControl) {
        const beggingYear = senate.from < minYear ? minYear : senate.from;
        const endingYear = senate.to > maxYear ? maxYear : senate.to;

        const leftPoint = chart.series[0].xAxis.toPixels(chart.series[0].points.find(p => p.x === beggingYear).x);
        const rightPoint = chart.series[0].xAxis.toPixels(chart.series[0].points.find(p => p.x === endingYear).x);

        chart.renderer.rect(leftPoint, chart.plotTop + (chart.plotHeight / 3 * 2), rightPoint - leftPoint, chart.plotHeight / 3).attr({
            // stroke: 'fuchsia',
            zIndex: -1,
            fill: senate.party === "Democrat" ? 'rgba(23, 76, 250, 0.25)' : "rgba(250, 22, 22, 0.25)"
        }).add();
    }
}

function App() {
    const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
    const [count, setCount] = useState(0);

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo"/>
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo"/>
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            {JSON.stringify(growthData, null, 2)}
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
                ref={chartComponentRef}
                callback={load}
            />
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App
