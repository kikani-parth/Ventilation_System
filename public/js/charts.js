const socket = new WebSocket('ws://localhost:3000/charts');

// Event listener for the Drop-down menu button
let chartType, previousChartType;
document.getElementById('chartType').addEventListener('change', () => {
    // Store the previous chart type value (if any)
    previousChartType = chartType;

    // Get the selected chart type
    chartType = document.getElementById('chartType').value;

    // Toggle the display based on the chart type
    toggleInputDisplay();

});

// Event listener for the "Update Chart" button
document.getElementById('updateChart').addEventListener('click', () => {
    if (chartType === 'doughnut') {
        // Get nr value
        const nr = document.getElementById('nr').value;

        // Check if the nr field is filled
        if (!nr) {
            alert('Please fill the \'nr\' field!');
            return;
        }

        // Validate the nr
        if (nr < 0) {
            alert('Please enter a number starting from 0');
            return;
        }

        const samplenr = {nr: nr};
        // Send the nr to the server
        socket.send(JSON.stringify(samplenr));
    } else {
        // Get the selected chart type
        chartType = document.getElementById('chartType').value;

        // Get the start and end date values
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        // Get the start and end time values
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;

        // Check if all the fields are filled
        if (!startDate || !endDate || !startTime || !endTime) {
            alert('Please fill all the fields!');
            return;
        }

        // Construct date objects
        const startDateObj = new Date(startDate + 'T' + startTime);
        const endDateObj = new Date(endDate + 'T' + endTime);

        // Validate user input
        if (startDateObj >= endDateObj) {
            alert('\'End date or time\' should be after \'Start date or time\'.');
            return;
        }

        const userInput = {
            startDate,
            endDate,
            startTime,
            endTime,
        };

        // Send the userInput to the server
        socket.send(JSON.stringify(userInput));
    }

});

function toggleInputDisplay() {
    const rangeSelector = document.getElementById('rangeSelector');
    const doughnutChartInput = document.getElementById('doughnutChartInput');

    if (chartType === 'doughnut') {
        // Hide the range selector
        rangeSelector.style.display = 'none';

        // Display the input field for Doughnut chart
        doughnutChartInput.style.display = 'block';
    } else {
        // Display the range selector
        rangeSelector.style.display = 'block';

        // Hide input field for Doughnut chart
        doughnutChartInput.style.display = 'none';
    }
}

let mongoDBData, chartData, chart;
socket.addEventListener('message', (event) => {
    const rawData = JSON.parse(event.data);

    // If it is an MQTT message, exit the function
    if ('topic' in rawData) {
        return;
    }

    /* Database Error Handling */

    // If no data is available for the requested range, alert the user and exit the event listener
    if ('rangeError' in rawData) {
        alert('No data available for the selected range!');
        return;
    }
    // Else if no MongoDB document found for the requested sample nr, alert the user and exit the event listener
    else if ('nrError' in rawData) {
        alert('No data available for the requested sample number!');
        return;
    }

    // Check if rawData is an object and wrap it in an array if needed
    if (Array.isArray(rawData)) {
        mongoDBData = rawData;
    } else {
        mongoDBData = [rawData];
    }

    // If a chart does not exist, create a new chart. Otherwise, update the existing chart
    if (!chart) {
        createChart();
    } else {
        updateChart();
    }

});

let canvasElement;

function createChart() {
    // Extract the relevant data for the chart
    chartData = mongoDBData.map(item => ({
        nr: item.nr,
        speed: item.speed,
        pressure: item.pressure,
        co2: item.co2,
        rh: item.rh,
        temp: item.temp
    }));

    // Get the canvas element and its context
    canvasElement = document.getElementById('chartId').getContext('2d');

    // Chart creation based on the selected type
    switch (chartType) {
        case 'bar':
            createBarChart();
            break;
        case 'line':
            createLineChart();
            break;
        case 'doughnut':
            createDoughnutChart();
            break;
        default:
            console.error('Invalid chart type:', chartType);
            return;
    }


}

function createBarChart() {
    chart = new Chart(canvasElement, {
        type: 'bar',
        data: {
            labels: chartData.map(item => item.nr),
            datasets: [
                {
                    label: 'Speed',
                    data: chartData.map(item => item.speed),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Pressure',
                    data: chartData.map(item => item.pressure),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'CO2',
                    data: chartData.map(item => item.co2),
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1
                },
                {
                    label: 'RH',
                    data: chartData.map(item => item.rh),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Temperature',
                    data: chartData.map(item => item.temp),
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            }
        }
    })
}

function createLineChart() {
    chart = new Chart(canvasElement, {
        type: 'line',
        data: {
            labels: chartData.map(item => item.nr),
            datasets: [
                {
                    label: 'Speed',
                    data: chartData.map(item => item.speed),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Pressure',
                    data: chartData.map(item => item.pressure),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'CO2',
                    data: chartData.map(item => item.co2),
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'RH',
                    data: chartData.map(item => item.rh),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Temperature',
                    data: chartData.map(item => item.temp),
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createDoughnutChart() {
    chart = new Chart(canvasElement, {
        type: 'doughnut',
        data: {
            labels: ['Speed', 'Pressure', 'CO2', 'RH', 'Temperature'],
            datasets: [
                {
                    data: [chartData.map(item => item.speed),
                        chartData.map(item => item.pressure),
                        chartData.map(item => item.co2),
                        chartData.map(item => item.rh),
                        chartData.map(item => item.temp),
                    ],
                    backgroundColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                    ],
                },
            ],
        },
        options: {
            cutout: '50%',
            responsive: true,
        },
    });
}


function updateChart() {
    // Extract the relevant data for the chart
    chartData = mongoDBData.map(item => ({
        nr: item.nr,
        speed: item.speed,
        pressure: item.pressure,
        co2: item.co2,
        rh: item.rh,
        temp: item.temp
    }));

    // Check if chart type has changed
    if (chartType !== previousChartType) {
        // Remove existing chart
        chart.destroy();

        // Create new chart based on the selected type
        switch (chartType) {
            case 'bar':
                createBarChart();
                break;
            case 'line':
                createLineChart();
                break;
            case 'doughnut':
                createDoughnutChart();
                break;
            default:
                console.error('Invalid chart type:', chartType);
                return;
        }
    }
    // If chart type has not changed, update the existing chart with new datasets
    else {
        if (chartType === 'doughnut') {
            // Update the chart data (for doughnut chart)
            chart.data.datasets[0].data = [chartData.map(item => item.speed),
                chartData.map(item => item.pressure),
                chartData.map(item => item.co2),
                chartData.map(item => item.rh),
                chartData.map(item => item.temp),
            ];
        } else {
            // Update the chart data (for bar chart or line chart)
            chart.data.labels = chartData.map(item => item.nr);
            chart.data.datasets[0].data = chartData.map(item => item.speed);
            chart.data.datasets[1].data = chartData.map(item => item.pressure);
            chart.data.datasets[2].data = chartData.map(item => item.co2);
            chart.data.datasets[3].data = chartData.map(item => item.rh);
            chart.data.datasets[4].data = chartData.map(item => item.temp);
        }

        // Update the previous chart
        chart.update();
    }
}

