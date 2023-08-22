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
var routings = panelData.readExcel("./test/data.xlsx", "routings")

console.log({
   message: "Run successful.",
   items,
   forecast,
   test: panelData.getVariations(forecast, "item")
});