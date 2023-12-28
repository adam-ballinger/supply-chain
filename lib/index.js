/**
 * Project: supply-chain
 * Description: Supply Chain Management and Logistics computation applications
 * Author: Adam Ballinger
 * Created: 2023
 * License: MIT License   
*/

// Import libraries with analysis tools.
const dataObjects = require('./data-objects.js');
const stats = require('./stats.js');

// Read excel file.
let productionData = dataObjects.readExcel('../test/20231228 supply and demand variation.xlsx', 'Production');

// Filter to item 43336.
productionData = dataObjects.filter(productionData, {'Item Number': '43336'});

// Filter productionData to only include OK org.
productionData = dataObjects.filter(productionData, {'Org': 'OK'});

// Remove unfinished jobs.
productionData = dataObjects.filter(productionData, {'Completed Qty': 0}, '>');

// Map days between 'Scheduled Completion' and 'Actual Completion' to the prodution data.
for (const key in productionData) {
   let scheduled = productionData[key]['Scheduled Completion'];
   let actual = productionData[key]['Actual Completion'];
   productionData[key].daysBetween = dataObjects.daysBetween(scheduled, actual);
}

// Rip days between data object.
const supplyVariationData = dataObjects.rip(productionData, ['daysBetween']);

// Calc statistics for supplyVariationData
const supplyStats = stats.calc(supplyVariationData);

console.log(supplyVariationData);
console.log(supplyStats);
