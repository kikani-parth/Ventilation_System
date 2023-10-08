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