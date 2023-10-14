# Ventilation_System_UI

This project implements a User Interface for a Ventilation System.
The UI has two pages:
1. Live:
   The Ventialtion System data will be displayed in 'real time' on this page. The user can select between the 2 modes: Manual and Auto.
   - In Manual mode, the user can set the fan speed from  0 - 100 %.
   - In Auto mode, The user can set the target pressure from 0 - 120 Pa
   
2. Charts:
   On the charts page, the user can select between 3 types of charts to visualize Ventialtion System data: Stacked Bar Chart, Line Chart and a Doughnut Chart.
   - To visualize data for Stacked Bar Chart and Line Chart, the user has to select a date & time range. If the data contains more than 25 samples, then the chart splits and the user can navigate the chart through      the provided buttons on the page.
   - For the doughnut chart, the user can enter a sample number to get data and the chart will be displayed on the page.
