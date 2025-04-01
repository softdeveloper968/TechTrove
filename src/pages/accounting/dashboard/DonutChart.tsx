import React, { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';

interface DonutChartProps {
    chartConfig: ChartConfiguration | null;
}

const DonutChart: React.FC<DonutChartProps> = ({ chartConfig }) => {
    const chartContainer = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (chartContainer.current && chartConfig) {
            const chartInstance = new Chart(chartContainer.current, chartConfig);

            return () => {
                chartInstance.destroy();
            };
        }
    }, [chartConfig]);

    if (!chartConfig) {
        return <div>Loading...</div>; // or any other fallback UI
    }
    return <canvas ref={chartContainer} id="myChart" />;
};

export default DonutChart;
