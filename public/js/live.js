const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', (event) => {
    console.log('WebSocket connection opened:', event);
});

socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    const message = JSON.parse(data.message);

    const notificationElement = document.getElementById('notification');
    if (message.error) {
        // Display the error message
        notificationElement.textContent = 'Unable to reach target pressure!';
        notificationElement.style.display = 'block';
    } else {
        notificationElement.style.display = 'none'; // Hide the notification
    }

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


// Input event listener for the pressure slider
const pressureInput = document.getElementById('pressureInput');
const pressureValue = document.getElementById('pressureValue');
pressureInput.addEventListener('input', () => {
    // Update the pressureValue span with the current slider value
    pressureValue.textContent = pressureInput.value;
});

// Input event listener for the fan speed slider
const fanSpeedInput = document.getElementById('fanSpeedInput');
const fanSpeedValue = document.getElementById('fanSpeedValue');
fanSpeedInput.addEventListener('input', () => {
    // Update the fanSpeedValue span with the current slider value
    fanSpeedValue.textContent = fanSpeedInput.value;
});


/* Pressure form event listener */
const pressureForm = document.getElementById('pressureForm');
pressureForm.addEventListener('change', (e) => {
    e.preventDefault();

    // Create a JSON message with the desired pressure value
    const message = {
        auto: true,
        pressure: parseInt(pressureInput.value),    //store pressure as int value
    };

    // Send the JSON message to the server
    socket.send(JSON.stringify(message));
});


/* Fan speed form event listener */
const fanSpeedForm = document.getElementById('fanSpeedForm');
fanSpeedForm.addEventListener('change', (e) => {
    e.preventDefault();

    // Create a JSON message with the desired fan speed value
    const message = {
        auto: false,
        speed: parseInt(fanSpeedInput.value),   //store speed as int value
    };

    // Send the JSON message to the server
    socket.send(JSON.stringify(message));
});