# Ventilation_System_UI

This project implements a User Interface for a Ventilation System.
The UI has two pages:
## 1. Live
   The Ventilation  System data will be displayed in 'real time' on this page. The user can select between the 2 modes: **Manual** and **Auto**.
   - In Manual mode, the user can set the fan speed from  0 - 100 %. 

   ![image](https://github.com/kikani-parth/Ventilation_System_UI/assets/99806873/a791543e-6f62-4443-9f73-94ebe2d0f48d)
   
   - In Auto mode, The user can set the target pressure from 0 - 120 Pa. If the target pressure cannot be reached within at most 100 seconds, an error message pops up on the page.

   ![image](https://github.com/kikani-parth/Ventilation_System_UI/assets/99806873/d4919b72-6965-43a3-8db2-de930ece4af5)

   
## 2. Charts
   On the charts page, the user can select between 3 types of charts to visualize Ventilation  System data: **Stacked Bar Chart, Line Chart and a Doughnut Chart.**

   - To visualize data for Stacked Bar Chart and Line Chart, the user has to select a date & time range. If the data contains more than 25 samples, then the chart splits and the user can navigate the chart through the provided buttons on the page.
  
     ![image](https://github.com/kikani-parth/Ventilation_System_UI/assets/99806873/8d3b4814-1e34-4543-9e98-cdab6c6c20dc)


     **Stacked Bar Chart:**
     
     ![image](https://github.com/kikani-parth/Ventilation_System_UI/assets/99806873/5cd3db98-9f9c-4a20-8c36-f1d9c8861f49)
     
     **Line Chart:**
     
     ![image](https://github.com/kikani-parth/Ventilation_System_UI/assets/99806873/0e3e5e47-79d5-4d9e-8867-7d5147d8cd15)


   - For the doughnut chart, the user can enter a sample number to get data and the chart will be displayed on the page.
     
     ![image](https://github.com/kikani-parth/Ventilation_System_UI/assets/99806873/f32cdc46-34fd-4131-9e81-1aeb7f28c241)
  
     **Doughnut Chart:**
     
     ![image](https://github.com/kikani-parth/Ventilation_System_UI/assets/99806873/7c480201-50d6-4461-8fed-e423ec48da3e)


