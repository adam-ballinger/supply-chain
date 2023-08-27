/**
 * Project: supply-chain
 * Description: Supply Chain Management and Logistics computation applications
 * Author: Adam Ballinger
 * Created: 2023
 * License: MIT License   
*/

const planning = require("./planning.js");

const dataSet = planning.getCommonDataSet("./test/data.xlsx", "concise");

const availableHours = planning.calcAvailableHours(dataSet, "verbose");

console.log({
   message: "index.js run successful.",
});
