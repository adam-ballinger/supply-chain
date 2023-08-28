/**
 * @fileoverview Utility functions for manufacturing planning functions.
 * 
 * This module is a part of the supply-chain package used for supply chain management and logistics. The module is primarily
 * focused on manufacturing planning functions that involve processing and computing data from a Manufacturing Data Object (MDO).
 * 
 * The MDO is a structured data object that serves as a foundational repository of information for production planning and resource
 * management purposes. It encapsulates various aspects of items, resources, forecasts, requirements, and constraints required for
 * manufacturing. The structure of the MDO is as follows:
 * 
 * Manufacturing Data Object:
 * 
 *  {
 *      items: {item: {description}},
 *      resources: {resource: {description}},
 *      forecast: {id: {item, period, quantity}},
 *      requirements: {id: {item, resource, quantity, routingVersion}},
 *      constraints: {id: {resource, period, quantity}}
 *  }
 * 
 * Here's a breakdown of each component within the MDO:
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
        constraints: dataObjects.readExcel(loc, "constraints")
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

// Calculate available resource hours for constrained resources in an MDO and return as a horizontal timeline of available hours.
function calcAvailableHours(MDO, log) {

    // Compute the constraints matrix and get a list of constrained resources.
    // Constrained resources are any resources in listed in MDO[constraints].
    // Resources not listed in MDO[constraints] are assumed to be unconstrained.
    const constraint_matrix = dataObjects.createMatrix(MDO["constraints"], "resource", "period", "constraint");
    const constrained_resources = Object.keys(constraint);

    // Get requirements data for constrained resources.
    var select_requirements = dataObjects.filter(MDO["requirements"], {"resource": constrained_resources}, "includes");

    // Create matrices from the forecast and select_requirements data
    var forecast_matrix = dataObjects.createMatrix(MDO["forecast"], "item", "period", "forecast");
    var requirements_matrix = dataObjects.createMatrix(select_requirements, "resource", "item", "requirement");
    
    // Compute the aggregate requirements matrix as the product of requirements and forecast.
    const agg_requirements_matrix = computation.matrix_mult(requirements_matrix, forecast_matrix);

    // Compute the result as the difference between constraint and aggreagate requirements.
    const result = computation.difference(constraint_matrix, agg_requirements_matrix);

    // Log output to the console if desired.
    switch(log) {
        case "verbose":
            console.log({
                message: "Computation of available hours on constrained resources successful.",
                constrained_resources,
                constraint_matrix,
                agg_requirements_matrix,
                result
            });
            break;
        
        case "concise":
            console.log({
                message: "Computation of available hours on constrained resources successful."
            })
            break;

        default:
            break;
    }

    return result;

}

/**
 * Generate a safety stock inventory plan data object from a Manufacturing Data Set (MDO). 
 * 
 * @param {Object} MDO - A Manufacturing Data Object.
 * @param {string} log - Optional logging parameter. Use "concise" or "verbose".
 * @returns {Object} - A new inventory plan object.
 * 
 * Each inventory plan entry contains an item's planned inventory for a specific period and a classification.
 * This utility generates a safetyStock classification only.
 * 
 */
function generateInventoryPlan(MDO, log) {

    const result = {};
    var i = 0;

    for(const id in MDO.forecast) {
        let item = MDO.forecast[id].item;

        result[i] = {};
        result[i].item = item;
        result[i].period = MDO.forecast[id].period;
        result[i].inventory = MDO.forecast[id].forecast * MDO.items[item]["safetyStock"];
        result[i].classification = "safetyStock";

        i++;
    }

    switch(log) {
        case "verbose":
            console.log({
                message: "Inventory Plan successful.",
                result              
            })
            break;

        case "concise":
            console.log({
                message: "Inventory Plan successful."
            })
            break;  
            
        case "debug":
            console.log({
                message: "Debugging mfg-planning.generateInventoryPlan.",
                result
            })

        default:
            break;
    }

    return result;

}





/**
 * Create a build plan data object from a Manufacturing Data Object. The build plan should anticipate what will be
 * built in each period.
 * 
 * @param {Object} MDO - A Manufacturing Data Object. The MDO must include a forecast, inventory, and inventory plan
 * @param {string} log - Optional logging parameter. Use "concise" or "verbose".
 * @returns {Object} - A new data object where each key (id) is associated with a build plan entry. 
 * 
 * Each build plan entry contains an item's planned quantity to be built for a specific period.
 * 
 */
function generateBuildPlan(MDO, log) {

    var result = {};

    var inventoryPlanMatrix = dataObjects.createMatrix(MDO.inventoryPlan, "item", "period", "inventory");
    

    switch(log) {
        case "verbose":
            console.log({
                message: "Build Plan successful.",
                result              
            })
            break;

        case "concise":
            console.log({
                message: "Build Plan successful."
            })
            break;    

        default:
            break;
    }

    return result;
} 

module.exports = {getMDO, calcAvailableHours, generateInventoryPlan, generateBuildPlan};