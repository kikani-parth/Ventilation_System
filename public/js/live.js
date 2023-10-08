const socket = new WebSocket('ws://localhost:3000/live');

socket.addEventListener('open', (event) => {
    console.log('WebSocket connection opened:', event);
});

socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    const message = JSON.parse(data.message);

    //Update the live page fields
    document.getElementById('fanSpeed').textContent = message.speed;
    document.getElementById('pressure').textContent = message.pressure;
    document.getElementById('co2Level').textContent = message.co2;
    document.getElementById('rh').textContent = message.rh;
    document.getElementById('temperature').textContent = message.temp;
});

/* Mode Toggle event listener */
const modeToggle = document.getElementById('modeToggle');
modeToggle.addEventListener('change', () => {
    const pressureSlider = document.getElementById('pressureSlider');
    const fanSpeedSlider = document.getElementById('fanSpeedSlider');

    if (modeToggle.checked) {
        // Auto mode (Show pressure slider, hide fan speed slider)
        pressureSlider.style.display = 'block';
        fanSpeedSlider.style.display = 'none';
    } else {
        // Manual mode (Show fan speed slider, hide pressure slider)
        pressureSlider.style.display = 'none';
        fanSpeedSlider.style.display = 'block';
    }
});


/* Pressure form event listener */
const pressureForm = document.getElementById('pressureForm');
pressureForm.addEventListener('change', (e) => {
    e.preventDefault();

    const pressureInput = document.getElementById('pressureInput');

    // Create a JSON message with the desired pressure value
    const message = {
        auto: true,
        pressure: parseInt(pressureInput.value),    //store pressure as int value
    };

    // Send the JSON message to the server
    socket.send(JSON.stringify(message));

    // Update the UI to reflect the desired pressure value immediately
    //document.getElementById('pressure').textContent = desiredPressure;
});


/* Fan speed form event listener */
const fanSpeedForm = document.getElementById('fanSpeedForm');
fanSpeedForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fanSpeedInput = document.getElementById('fanSpeedInput');

    // Create a JSON message with the desired fan speed value
    const message = {
        topic: 'controller/settings',
        fanSpeed: fanSpeedInput.value,
    };

    // Send the JSON message to the server
    socket.send(JSON.stringify(message));

    // You can also update the UI to reflect the desired fan speed value immediately if needed
    //document.getElementById('fanSpeed').textContent = desiredFanSpeed + '%';
});