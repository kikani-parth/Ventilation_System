const socket = new WebSocket('ws://localhost:3000/live');

socket.addEventListener('open', (event) => {
    console.log('WebSocket connection opened:', event);
});

function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value;
    socket.send(message);
    messageInput.value = '';
}