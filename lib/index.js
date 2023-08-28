/**
 * Project: supply-chain
 * Description: Supply Chain Management and Logistics computation applications
 * Author: Adam Ballinger
 * Created: 2023
 * License: MIT License   
*/

const mfgPlanning = require("./mfg-planning.js");
const dataObjects = require("./data-objects.js");

const dataSet = mfgPlanning.getMDO("./test/data.xlsx", "verbose");

dataSet.inventoryPlan = mfgPlanning.generateInventoryPlan(dataSet, "verbose");

var inventoryMatrix = dataObjects.createMatrix(dataSet.inventoryPlan, "item", "period", "inventory");

console.log({
   message: "index.js run successful.",
   inventoryMatrix

});
