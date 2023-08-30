/**
 * Project: supply-chain
 * Description: Supply Chain Management and Logistics computation applications
 * Author: Adam Ballinger
 * Created: 2023
 * License: MIT License   
*/

const mfgPlanning = require("./mfg-planning.js");
const dataObjects = require("./data-objects.js");

const dataSet = mfgPlanning.getMDO("./test/data.xlsx", "concise");

dataSet.inventoryPlan = mfgPlanning.generateHorizontalPlan(dataSet, "verbose")


console.log({
   message: "index.js run successful.",
});
