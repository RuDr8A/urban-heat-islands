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


export default function EnvironmentalChart({
    data
}) {

    if (!data || data.length === 0) {

        return (
            <p>
                Select a location to view environmental trends.
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

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Line
                        type="monotone"
                        dataKey="NDVI"
                        name="NDVI"
                        stroke="#2a9d8f"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                    />

                    <Line
                        type="monotone"
                        dataKey="NDBI"
                        name="NDBI"
                        stroke="#f4a261"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                    />

                    <Line
                        type="monotone"
                        dataKey="NDWI"
                        name="NDWI"
                        stroke="#457b9d"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    );
}