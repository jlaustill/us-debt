import {useRef, useState} from 'react'
import map from "lodash/map";
import at from "lodash/at";
import sortBy from "lodash/sortBy";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import * as Highcharts from 'highcharts';
import {HighchartsReact} from 'highcharts-react-official';
import data from "../data/usdebt.json";

const growthData = map(sortBy(data, 'year'), o => at(o, ["year", "debtChange"]));

// The integration exports only a default component that at the same time is a
// namespace for the related Props interface (HighchartsReact.Props) and
// RefObject interface (HighchartsReact.RefObject). All other interfaces
// like Options come from the Highcharts module itself.

const options: Highcharts.Options = {
    title: {
        text: 'United States National Debt Over Time'
    },
    series: [{
        name: "Growth Rate",
        type: 'line',
        data: growthData
    }]
};

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
            />
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App
