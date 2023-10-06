/**
 * Project: supply-chain
 * Description: Supply Chain Management and Logistics computation applications
 * Author: Adam Ballinger
 * Created: 2023
 * License: MIT License   
*/

const mfgPlanning = require("./mfg-planning.js");
const dataObjects = require("./data-objects.js");
const display = require("./display.js");
const computation = require("./computation.js")

const data = mfgPlanning.getMDO("./test/Plastic Door Bottoms Raw.xlsx", "concise");

data.horizontalPlan = mfgPlanning.generateHorizontalPlan(data, "concise");

data.aggRequirements = mfgPlanning.calculateAggRequirements(data, "concise");

data.ryg = mfgPlanning.calculateRYG(data, "concise");

data.aggInventoryPlan = mfgPlanning.calculateAggInventoryPlan(data, "concise");

display.generatePlanningView(data, "test/output raw.html");

console.log({
   message: "index.js run successful."
});
