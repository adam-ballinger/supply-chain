/**
 * Project: supply-chain
 * Description: Safety Stock Analysis
 * Author: Adam Ballinger
 * Created: 2023  
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
function calcSupplyStats(loc, tab) {

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

/**
 * Evaluates demand data and returns demand statistics
 * 
 * @param {string} loc - The file location of the data
 * @param {string} tab - the spreadsheet tab of the data
 * @returns {Object} - a data object with the demand statistics by item
 */
function calcDemandStats(loc, tab) {

   const demandStats = {};

   // Read excel file.
   let shippingData = dataObjects.readExcel(loc, tab);

   // Filter data to only include OK org.
   shippingData = dataObjects.filter(shippingData, {'Org': 'OK'});   

   // Get a list of items to evaluate.
   const items = dataObjects.getVariations(shippingData, 'Item');

   // Loop through each item.
   for(const i in items) {
      // Filter data to items[i].
      let itemData = dataObjects.filter(shippingData, {'Item': items[i]});
      demandStats[items[i]] = stats.calc(itemData, 'Shipped Qty', 4);
   }


   return demandStats;
}

let supplyStats = calcSupplyStats('./test/20231228 supply and demand variation.xlsx', 'Production');
let demandStats = calcDemandStats('./test/20231228 supply and demand variation.xlsx', 'Shipping')

console.log('supplyStats:');
console.log(supplyStats);

console.log('demandStats:');
console.log(demandStats);


let safetyStocks = {}

for(const item in supplyStats) {

   safetyStocks[item].z = 2.17;
   safetyStocks[item] = {};

   safetyStocks[item].averageLeadTime = 10;
   safetyStocks[item].leadTimeStdDev = supplyStats[item].stdDev_adj;
   safetyStocks[item].averageSales = demandStats[item].average_adj;
   safetyStocks[item].demandStdDev = demandStats[item].stdDev_adj;

   safetyStocks[item].supplyComponent = safetyStocks[item].averageSales * safetyStocks[item].leadTimeStdDev;
   safetyStocks[item].demandComponent = Math.sqrt(safetyStocks[item].averageLeadTime * safetyStocks[item].demandStdDev ** 2);

   safetyStocks[item].recommendation = safetyStocks[item].z * Math.sqrt(safetyStocks[item].demandComponent ** 2 + safetyStocks[item].supplyComponent ** 2);
}

console.log('Recommended Safety Stocks:');
console.log(safetyStocks);