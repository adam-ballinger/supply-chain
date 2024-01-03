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
 * For this analysis, the supply data evaluated is Performance Cycle Times.
 * 
 * Performance Cycle Times is the time between each job completion, provided that two jobs are not completed
 * back-to-back. If jobs are completed on the same day or one day apart, they are considered to be a part
 * of the same performance cycle.
 * 
 * The purpose of the function is to collect the average standard deviation and standard deviations of performance
 * cycle times, to be used in the combined uncertainty safety stock formula.
 * 
 * @param {string} loc - The file location of the data
 * @param {string} tab - the spreadsheet tab of the data
 * @returns {Object} - a data object with the supply variation statistics by item
 */
function calcSupplyStats(loc, tab) {

    const supplyStats = {};
    const performanceCycleTimes = {};
 
    // Read excel file.
    let productionData = dataObjects.readExcel(loc, tab);
 
    // Filter data to only include OK org.
    productionData = dataObjects.filter(productionData, {'Org': 'OK'});   
    
    // Remove unfinished jobs.
    productionData = dataObjects.filter(productionData, {'Completed Qty': 0}, '>');
 
    // Get a list of items to evaluate.
    const items = dataObjects.getVariations(productionData, 'Item Number');
 
    // Loop through each item, evaluating production data to determine perfromance cycle time.
    for(const i in items){
        
        // Get filtered data for each item.
        let itemData = dataObjects.filter(productionData, {'Item Number': items[i]});
 
        performanceCycleTimes[items[i]] = {};

        let keys = Object.keys(itemData);

        //Loop through each production record to determine the performance cycle time (days)
        // Start on i=1 (2nd record) since i=1 marks the end of the first performance cycle
        for(let j = 1; j < keys.length; j++) {
            let performanceCycleStart = itemData[keys[j-1]]['Actual Completion'];
            let performanceCycleEnd = itemData[keys[j]]['Actual Completion'];
            let performanceCycleTime = dataObjects.daysBetween(performanceCycleStart, performanceCycleEnd);

            /**
             * If the production completion dates are only 1 day apart, those should not count as unique
             * performance cycles. They are likely continuations of the same performance cycle 
            */
           if(performanceCycleTime > 1) {
                performanceCycleTimes[items[i]][keys[j]] = {'Performance Cycle Time': performanceCycleTime};
           }          
        }
        console.log(performanceCycleTimes[items[i]]);
        supplyStats[items[i]] = stats.calc(performanceCycleTimes[items[i]], 'Performance Cycle Time', 3);
 
    }
 
    return supplyStats;
 }

/**
 * Evaluates demand data and returns demand statistics.
 * 
 * For this analysis, the demand data evaluated is the average and standard deviation of daily sales data.
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

let supplyStats = calcSupplyStats('./data/20231228 supply and demand variation.xlsx', 'Production');
let demandStats = calcDemandStats('./data/20231228 supply and demand variation.xlsx', 'Shipping')

console.log('supplyStats:');
console.log(supplyStats);

console.log('demandStats:');
console.log(demandStats);


let safetyStocks = {}

for(const item in supplyStats) {

    safetyStocks[item] = {};
    safetyStocks[item].p = 0.985;
    safetyStocks[item].z = stats.normInverse(safetyStocks[item].p);

    safetyStocks[item].averagePerformanceCylce = supplyStats[item].average_adj;
    safetyStocks[item].performanceCycleStdDev = supplyStats[item].stdDev_adj;
    safetyStocks[item].averageSales = demandStats[item].average_adj;
    safetyStocks[item].demandStdDev = demandStats[item].stdDev_adj;

    safetyStocks[item].supplyComponent = safetyStocks[item].averageSales * safetyStocks[item].performanceCycleStdDev;
    safetyStocks[item].demandComponent = Math.sqrt(safetyStocks[item].averagePerformanceCylce * safetyStocks[item].demandStdDev ** 2);

    safetyStocks[item].recommendation = safetyStocks[item].z * Math.sqrt(safetyStocks[item].demandComponent ** 2 + safetyStocks[item].supplyComponent ** 2);
}

console.log('Recommended Safety Stocks:');
console.log(safetyStocks);