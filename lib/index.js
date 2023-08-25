/**
 * Project: supply-chain
 * Description: Supply Chain Management and Logistics computation applications
 * Author: Adam Ballinger
 * Created: 2023
 * License: MIT License   
*/

const panelData = require("./panel-data.js");

var items = panelData.readExcel("./test/data.xlsx", "items", 'item');
var forecast = panelData.readExcel("./test/data.xlsx", "forecast");
var requirements = panelData.readExcel("./test/data.xlsx", "requirements");

var requirement_matrix = panelData.createMatrix(requirements, "resource", "item", "quantity");
var forecast_matrix = panelData.createMatrix(forecast, "item", "month", "quantity");


var agg_forecast_requirements = panelData.dot(requirement_matrix, forecast_matrix);

console.log({
   message: "Run successful.",
   agg_forecast_requirements
});
