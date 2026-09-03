import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from "recharts";

export default function Charts({ tasks }) {
    const projectData = {};

    tasks.forEach(task => {
        projectData[task.project] =
            (projectData[task.project] || 0) + task.actualHours;
    });

    const chartData = Object.entries(projectData).map(([name, value]) => ({
        name,
        value,
    }));

    const COLORS = [
        "#2563eb",
        "#16a34a",
        "#dc2626",
        "#d97706",
        "#9333ea",
    ];

    return (
        <>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={chartData} dataKey="value" label>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={index}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" />
                </BarChart>
            </ResponsiveContainer>
        </>
    );
}
