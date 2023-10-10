import {Chart} from "chart.js/auto";

// Get the canvas element and its context
let canvasElement = document.getElementById('myChart').getContext('2d');

// Chart creation
let chart = new Chart(canvasElement, {
    type:'bar'
})
