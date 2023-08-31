/**
 * @fileoverview Utility functions for manufacturing planning.
 * 
 * This module is a part of the supply-chain package used for supply chain management and logistics. This module is primarily
 * focused on manufacturing planning functions that involve processing and computing data from a Manufacturing Data Object (MDO).
 * 
 * The MDO is a structured data object that serves as a foundational repository of information for production planning and resource
 * management purposes. It encapsulates various aspects of items, resources, forecasts, requirements, and constraints required for
 * manufacturing. Some functions require additional data, such as build plans or inventory plans
 * 
 * Manufacturing Data Object mandatory data:
 * 
 *  {
 *      items: {item: {description}},
 *      resources: {resource: {description}},
 *      forecast: {id: {item, period, quantity}},
 *      requirements: {id: {item, resource, quantity, routingVersion}},
 *      constraints: {id: {resource, period, quantity}},
 *      calendar: {period: {startDate, ... }}
 *  }
 * 
 * Here's a breakdown of each mandatory component within the MDO:
 * 
 * items: An object where each key represents an item identifier and the corresponding value contains
 * item-specific information (such as a description).
 * 
 * resources: An object where each key represents a resource identifier, and the corresponding value
 * contains resource-specific information (such as a description).
 * 
 * forecast: An object where each key is an identifier (id) associated with a forecast entry. Each
 * forecast entry contains information about an item's forecasted quantity for a specific period.
 * 
 * requirements: An object where each key is an identifier (id) associated with a requirement entry.
 * Each requirement entry contains information about the quantity of a specific item required by a
 * particular resource, along with routing information.
 * 
 * constraints: An object where each key is an identifier (id) associated with a constraint entry. Each
 * constraint entry contains information about the manufacturing constraint of a specific resource for a given
 * period.
 * 
 * calendar: A data object where each key represensts a period identifier. Not sure what will go here yet, but I know it will be
 * important.
 * 
 * To get a sample MDO in excel, use the link below:
 * 
 *  https://github.com/adam-ballinger/supply-chain/blob/c688c1831f9cb9c6f366287054a64cc1e1a50c0a/test/data.xlsx
 * 
 */

const dataObjects = require("./data-objects.js");
const computation = require("./computation.js");


// Function to be used to get a Manufacturing Data Object from an excel file. 
function getMDO(loc, log) {
    
    // Read the MDO from an excel file.
    const result = {
        items: dataObjects.readExcel(loc, "items", "item"),
        resources: dataObjects.readExcel(loc, "resources", "resource"),
        forecast: dataObjects.readExcel(loc, "forecast"),
        requirements: dataObjects.readExcel(loc, "requirements"),
        constraints: dataObjects.readExcel(loc, "constraints"),
        calendar: dataObjects.readExcel(loc, "calendar", "period")
    };

    switch(log) {
        case "verbose":
            console.log({
                message: "MDO load successful.",
                loc,
                items: result.items,
                resources: result.resources,
                forecast: result.forecast,
                requirements: result.requirements,
                constraints: result.constraints
            });
            break;
        
        case "concise":
            console.log({
                message: "MDO load successful."
            })
            break;

        default:
            break;
    }

    return result;
}


/**
 * 
 * @param {Object} MDO - A Manufacturing Data Object.
 * @param {string} log - Optional logging parameter. Use "concise" or "verbose".
 * @returns {Object} - A collection of Horizontal Plans indexed by item number.
 * 
 * Generate Horizontal Plans for all items in an MDO.
 * 
 * Each Horizontal plan is a data object with different planning calculations as rows, and periods as columns.
 * 
 * Example (Data Object):
 * 
 * {
 *  item1:
 *      {
 *          Safety Stock Plan: {period1, period2, ... periodN},         
 *          Cycle Stock Plan: {period1, period2, ... periodN}, 
 *          Level Load Plan: {period1, period2, ... periodN},
 *          Total Inv. Plan: {period1, period2, ... periodN},
 *          Beginning Inventory: {period1, period2, ... periodN},
 *          Sales Forecast: {period1, period2, ... periodN},
 *          Production Plan: {period1, period2, ... periodN},
 *          Ending Inventory: {period1, period2, ... periodN} 
 *      },
 *  item2: { ... },
 *  item3: { ... }
 *  
 * }
 * 
 * Example (Table):
 * 
 *  Item: 43346
 *                          |202308 |202309 |202310 |202311 |202312 |202401
 *      -----------------------------------------------------------------------
 *      Safety Stock Plan   |4800   |4800   |4800   |4800   |4800   |4800  
 *      Cycle Stock Plan    |1386   |1386   |1386   |1386   |1386   |1386 
 *      Level Load Plan     |0      |1000   |2000   |2000   |1000   |0
 *      Total Inv. Plan     |6186   |7186   |8186   |8186   |7186   |6186
 *      Beginning Inventory |13000  |7000   |7186   |8186   |8186   |7186
 *      Sales Forecast      |6000   |6500   |5900   |6800   |9000   |9400
 *      Production Plan     |3786   |6686   |6900   |6800   |8000   |8400
 *      Ending Inventory    |6186   |7186   |8186   |8186   |7186   |6186
 *  
 * Item 43337 
 * 
 *      ...
 * 
 * Item 43348
 * 
 *      ... 
 * 
 */
function generateHorizontalPlan(MDO, log) {

    var result = {};

    var forecastMatrix = dataObjects.createMatrix(MDO.forecast, "item", "period", "forecast");

    for(const item in MDO.items) {

        result[item] = {
            "Safety Stock Plan": {},
            "Cycle Stock Plan": {},
            "Level Load Plan": {},
            "Total Inv. Plan": {},
            "Beginning Inventory": {},
            "Sales Forecast": {},
            "Production Plan": {},
            "Ending Inventory": {}                
        };

        // Find highest sales period for calculating safety stock.
        let maxPeriodForecast = 0;
        let maxPeriod = null;
        let safetyStock = null;
        let cycleStock = null;
        let itemForecast = dataObjects.filter(MDO.forecast, {"item": item}, "==");

        for(const id in itemForecast) {
            if(itemForecast[id].forecast > maxPeriodForecast) {
                maxPeriodForecast = itemForecast[id].forecast;
                maxPeriod = itemForecast[id].period;
            }
        }

        // Set safety stock level based on strategy
        if(MDO.items[item].strategy == "Reactive Level Load - Fast") {
            safetyStock = Math.round(maxPeriodForecast / MDO.calendar[maxPeriod].days * 8);
            cycleStock = Math.round(MDO.items[item].FOQ * 0.5);
        } else if(MDO.items[item].strategy == "Reactive Level Load - Slow") {
            safetyStock = Math.round(maxPeriodForecast / MDO.calendar[maxPeriod].days * 20);
            cycleStock = Math.round(MDO.items[item].FOQ * 0.5);
        } else {
            safetyStock = 0;
            cycleStock = 0;
        }

        // For each period in the calendar, generate the horizontal plan.
        let periods = Object.keys(MDO.calendar);
        for(let i = 0; i < periods.length; i++) {

            let period = periods[i]

            result[item]["Safety Stock Plan"][period] = safetyStock;
            result[item]["Cycle Stock Plan"][period] = cycleStock;
            result[item]["Level Load Plan"][period] = 0;
            result[item]["Total Inv. Plan"][period] = safetyStock + cycleStock;
            if(i == 0){
                result[item]["Beginning Inventory"][period] = MDO.items[item].currentInventory;
            } else {
                result[item]["Beginning Inventory"][period] = result[item]["Ending Inventory"][periods[i-1]];
            }

            result[item]["Sales Forecast"][period] = forecastMatrix[item][period];
            if(result[item]["Total Inv. Plan"][period] + result[item]["Sales Forecast"][period] < result[item]["Beginning Inventory"][period]) {
                result[item]["Production Plan"][period] = 0
            } else {
                result[item]["Production Plan"][period] = result[item]["Total Inv. Plan"][period] + result[item]["Sales Forecast"][period] - result[item]["Beginning Inventory"][period];
            }
            result[item]["Ending Inventory"][period] = result[item]["Beginning Inventory"][period] - result[item]["Sales Forecast"][period] + result[item]["Production Plan"][period];
        }

    }

    switch(log) {
        case "verbose":
            console.log({message: "Generate Horizontal Plan successful."});
            for(const item in result) {
                console.log({
                    "item": item,
                    "Horizontal Plan": result[item]
                });
            }
            break;

        case "concise":
            console.log({
                message: "Generate Horizontal Plan successful."
            });
            break;  

        default:
            break;
    }

    return result;

}

/**
 * 
 * @param {Object} data - Manufacturing Data Object. MDO must have a horizontalPlan property.
 * @param {string} log - Optional logging parameter. Use "concise", "verbose", or null.
 * @returns {Object} - Returns a matrix of aggregate requirements by resource by period.
 * 
 * Generate a matrix of aggregate resource requirements on every resource.
 * 
 */
function calculateAggRequirements(data, log) {

    let requirementsMatrix = dataObjects.createMatrix(data.requirements, "resource", "item", "requirement");

    let productionMatrix = {};

    for(const item in data.items) {
        productionMatrix[item] = data.horizontalPlan[item]["Production Plan"];
    }

    result = computation.matrix_mult(requirementsMatrix, productionMatrix);

    switch(log) {
        case "verbose":
            console.log({
                message: "Generate Aggregate Requirements matrix successful.",
                requirementsMatrix,
                productionMatrix,
                result
            });
            break;

        case "concise":
            console.log({
                message: "Generate Aggregate Requirements matrix successful."
            });
            break;  

        default:
            break;
    }

    return result;
}

/**
 * 
 * @param {Object} data - A Manufacturing data object which must include and aggRequirements matrix.
 * @param {string} log - Optional logging parameter. Use "concise", "verbose", or null.
 * @returns Returns a matrix of ratios that represent how many hours are required on a resource
 * as a percentage of capacity.
 * 
 * calculate the RYG matrix for constrained resources.
 * 
 */
function calculateRYG(data, log) {

    let constraintsMatrix = dataObjects.createMatrix(data.constraints, "resource", "period", "constraint");
    let constrainedResources = Object.keys(constraintsMatrix);
    let aggRequirements = dataObjects.crossCut(data.aggRequirements, constrainedResources);

    let result = computation.piecewiseDivision(aggRequirements, constraintsMatrix);

    switch(log) {
        case "verbose":
            console.log({
                message: "Generate RYG matrix successful.",
                result
            });
            break;

        case "concise":
            console.log({
                message: "Generate RYG matrix successful."
            });
            break;  

        default:
            break;
    }

    return result;

}

module.exports = {getMDO, generateHorizontalPlan, calculateAggRequirements, calculateRYG};