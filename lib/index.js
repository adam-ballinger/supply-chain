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

const data = mfgPlanning.getMDO("./test/data.xlsx", "concise");

data.horizontalPlan = mfgPlanning.generateHorizontalPlan(data, "concise");

data.aggRequirements = mfgPlanning.calculateAggRequirements(data, "verbose");

display.generatePlanningView(data, "test/output.html");

console.log({
   message: "index.js run successful.",
});
