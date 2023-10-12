const socket = new WebSocket('ws://localhost:3000/charts');

// Event listener for the Drop-down menu button
let chartType = 'bar', previousChartType, doughnutChart;
document.getElementById('chartType').addEventListener('change', () => {
    // Get the selected chart type
    chartType = document.getElementById('chartType').value;

    // Toggle the display based on the chart type
    toggleInputDisplay();

    // Empty chart type value (will get it again when update button is pressed)
    chartType = undefined;

});

// Event listener for the "Update Chart" button
document.getElementById('updateChart').addEventListener('click', () => {
    // Get the selected chart type
    doughnutChart = document.getElementById('chartType').value;
    if (doughnutChart === 'doughnut') {
        // Hide the page navigation
        document.getElementById('pagination').style.display = 'none';

        // Update the previous chart type
        previousChartType = doughnutChart;

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
        // Store the previous chart type value
        previousChartType = chartType;

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

let chartData, rawChartData, lineChartData, doughnutChartData, chart;
socket.addEventListener('message', (event) => {
    chartData = JSON.parse(event.data);
    // If it is an MQTT message, exit the function
    if ('topic' in chartData) {
        return;
    }

    /* Database Error Handling */

    // If no data is available for the requested range, alert the user and exit the event listener
    if ('rangeError' in chartData) {
        alert('No data available for the selected range!');
        return;
    }
    // Else if no MongoDB document found for the requested sample nr, alert the user and exit the event listener
    else if ('nrError' in chartData) {
        alert('No data available for the requested sample number!');
        return;
    }
    rawChartData = chartData;
    lineChartData = chartData;
    doughnutChartData = chartData;

    // If a chart does not exist, create a new chart. Otherwise, update the existing chart
    if (!chart) {
        createChart();
    } else {
        updateChart(chartData);
    }

});

let canvasElement;

function createChart() {
    /*
    // Extract the relevant data for the chart
    chartData = mongoDBData.map(item => ({
        nr: item.nr,
        speed: item.speed,
        pressure: item.pressure,
        co2: item.co2,
        rh: item.rh,
        temp: item.temp
    }));
*/
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
        //case 'doughnut':
        // createDoughnutChart();
        // break;
        default:
            createDoughnutChart();
            //console.error('Invalid chart type:', chartType);
            return;
    }
}

function newBarChart(data) {
    let delayed;
    chart = new Chart(canvasElement, {
        type: 'bar',
        data: {
            labels: data.map(item => item.nr),
            datasets: [
                {
                    label: 'Speed',
                    data: data.map(item => item.speed),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Pressure',
                    data: data.map(item => item.pressure),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'CO2',
                    data: data.map(item => item.co2),
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1
                },
                {
                    label: 'RH',
                    data: data.map(item => item.rh),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Temperature',
                    data: data.map(item => item.temp),
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            aspectRatio: 2.7,
            maintainAspectRatio: false,
            // Set a delay animation
            animation: {
                onComplete: () => {
                    delayed = true;
                },
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 150 + context.datasetIndex * 50;
                    }
                    return delay;
                },
            },
            scales: {
                x: {
                    stacked: true   // Stack the bar graph
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            }
        }
    })
}

let currentPage = 1;        // Current page number
const itemsPerPage = 25;    // Number of items to display per page
function renderPartialChart() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Display the initially hidden page navigation buttons
    document.getElementById('pagination').style.display = 'block';

    // Divide the chartData array into a smaller array whose length = 25
    const slicedData = chartData.slice(startIndex, endIndex);

    if (chartType === 'bar') {
        newBarChart(slicedData);
    } else {
        newLineChart(slicedData);
    }
}

function updatePartialChart() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const slicedData = rawChartData.slice(startIndex, endIndex);

    updateChart(slicedData);
}

function createBarChart() {
    if (chartData.length > 25) {
        renderPartialChart();
    } else {
        newBarChart(rawChartData);
    }
}

function newLineChart(data) {
    chart = new Chart(canvasElement, {
        type: 'line',
        data: {
            labels: data.map(item => item.nr),
            datasets: [
                {
                    label: 'Speed',
                    data: data.map(item => item.speed),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Pressure',
                    data: data.map(item => item.pressure),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'CO2',
                    data: data.map(item => item.co2),
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'RH',
                    data: data.map(item => item.rh),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Temperature',
                    data: data.map(item => item.temp),
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            scales: {
                aspectRatio: 3,
                maintainAspectRatio: false,
                x: {
                    beginAtZero: true
                },
                /*
                y: {
                    beginAtZero: false
                }
                */
            }
        }
    });

}

function createLineChart() {
    if (chartData.length > 25) {
        renderPartialChart();
    } else {
        newLineChart(lineChartData);
    }
}

function createDoughnutChart() {
    chart = new Chart(canvasElement, {
        type: 'doughnut',
        data: {
            labels: ['Speed', 'Pressure', 'CO2', 'RH', 'Temperature'],
            datasets: [
                {
                    data: [doughnutChartData.speed,
                        doughnutChartData.pressure,
                        doughnutChartData.co2,
                        doughnutChartData.rh,
                        doughnutChartData.temp,
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

function updateChart(data) {
    // Check if chart type has changed
    if (chartType !== previousChartType) {
        // Remove existing chart
        chart.destroy();

        // Reset page number before creating new chart
        currentPage = 1;
        // Update the correct Page number
        document.getElementById('currentPage').textContent = 'Page ' + currentPage;

        // Create new chart based on the selected type
        switch (chartType) {
            case 'bar':
                createBarChart();
                break;
            case 'line':
                createLineChart();
                break;
            //case 'doughnut':
            // createDoughnutChart();
            // break;
            default:
                createDoughnutChart();
                //console.error('Invalid chart type:', chartType);
                return;
        }
    }
    // If chart type has not changed, update the existing chart with new datasets
    else {
        if (doughnutChart === 'doughnut') {
            // Update the chart data (for doughnut chart)
            chart.data.datasets[0].data = [doughnutChartData.speed,
                doughnutChartData.pressure,
                doughnutChartData.co2,
                doughnutChartData.rh,
                doughnutChartData.temp,
            ];
        } else {
            if (data.length > 25) {
                currentPage = 1;
                updatePartialChart();
            } else {
                if (rawChartData.length <= 25) {
                    // Hide the page navigation
                    document.getElementById('pagination').style.display = 'none';
                } else {
                    // Display the initially hidden page navigation buttons
                    document.getElementById('pagination').style.display = 'block';

                    // Update the correct Page number
                    document.getElementById('currentPage').textContent = 'Page ' + currentPage;

                }
                // Update the chart data (for bar chart or line chart)
                chart.data.labels = data.map(item => item.nr);
                chart.data.datasets[0].data = data.map(item => item.speed);
                chart.data.datasets[1].data = data.map(item => item.pressure);
                chart.data.datasets[2].data = data.map(item => item.co2);
                chart.data.datasets[3].data = data.map(item => item.rh);
                chart.data.datasets[4].data = data.map(item => item.temp);
            }

        }

        // Update the previous chart
        chart.update();
    }
}

function goToPage(pageNumber) {
    currentPage = pageNumber;
    updatePartialChart();
}

// Add event listeners for pagination buttons
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        // Store the previous chart type value
        previousChartType = chartType;
        goToPage(currentPage - 1);
        document.getElementById('currentPage').textContent = 'Page ' + currentPage;
    }
});
document.getElementById('nextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(rawChartData.length / itemsPerPage);    // Total number of pages where chart will be displayed

    if (currentPage < totalPages) {
        // Store the previous chart type value
        previousChartType = chartType;
        goToPage(currentPage + 1);
        document.getElementById('currentPage').textContent = 'Page ' + currentPage;

    }
});