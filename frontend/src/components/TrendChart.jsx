import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";


export default function TrendChart({
    data
}) {

    if (!data || data.length === 0) {

        return (
            <p>
                Select a location to view its historical trend.
            </p>
        );

    }


    return (

        <div
            style={{
                width: "100%",
                height: "400px"
            }}
        >

            <ResponsiveContainer
                width="100%"
                height="100%"
            >

                <LineChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20
                    }}
                >

                    <CartesianGrid
                        strokeDasharray="3 3"
                    />

                    <XAxis
                        dataKey="Year"
                    />

                    <YAxis
                        label={{
                            value: "LST (°C)",
                            angle: -90,
                            position: "insideLeft"
                        }}
                    />

                    <Tooltip />

                    <Legend />

                    <Line
                        type="monotone"
                        dataKey="LST"
                        name="Surface Temperature"
                        stroke="#e63946"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    );
}