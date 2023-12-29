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


/**
 * Evaluates supply data and returns supply statistics.
 * 
 * @param {string} loc - The file location of the data
 * @param {string} tab - the spreadsheet tab of the data
 * @returns {Object} - a data object with the supply variation statistics by item
 */
function generateSupplyStats(loc, tab) {

   const supplyStats = {};

   // Read excel file.
   let productionData = dataObjects.readExcel(loc, tab);

   // Filter data to only include OK org.
   productionData = dataObjects.filter(productionData, {'Org': 'OK'});   
   
   // Remove unfinished jobs.
   productionData = dataObjects.filter(productionData, {'Completed Qty': 0}, '>');

   // Get a list of items to evaluate.
   const items = dataObjects.getVariations(productionData, 'Item Number');

   // Loop through each item.
   for(const i in items){
      // Filter data to items[i].
      let itemData = dataObjects.filter(productionData, {'Item Number': items[i]});

      // Map days between 'Scheduled Completion' and 'Actual Completion' to the prodution data.
      for (const key in itemData) {
         let scheduled = itemData[key]['Scheduled Completion'];
         let actual = itemData[key]['Actual Completion'];
         itemData[key].daysBetween = dataObjects.daysBetween(scheduled, actual);
      }

      // Calc statistics for supplyVariationData and add to the result
      supplyStats[items[i]] = stats.calc(itemData, 'daysBetween');

   }

   return supplyStats;
}

let supplyStats = generateSupplyStats('./test/20231228 supply and demand variation.xlsx', 'Production');

console.log(supplyStats)