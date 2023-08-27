/**
 * @fileoverview Utility functions for planning functions.
 * 
 * This planning module is a part of the supply-chain package used for supply chain planning and 
 * resource management. The module is primarily focused on planning functions that involve processing
 * and computing data from a Common Data Set.
 * 
 * The "Common Data Set" used in this module is a structured data object that serves as a foundational
 * repository of information for planning and resource management purposes. It encapsulates various
 * aspects of items, resources, forecasts, requirements, and capacities required for effective
 * planning within a supply chain or resource management context. The structure of the Common Data Set
 * is as follows:
 * 
 * Common Data Set:
 * 
 *  {
 *      items: {item: {description}},
 *      resources: {resource: {description}},
 *      forecast: {id: {item, period, quantity}},
 *      requirements: {id: {item, resource, quantity, routingVersion}},
 *      capacities: {id: {resource, period, quantity}}
 *  }
 * 
 * Here's a breakdown of each component within the Common Data Set:
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
 * capacities: An object where each key is an identifier (id) associated with a capacity entry. Each
 * capacity entry contains information about the available capacity of a specific resource for a given
 * period.
 * 
 * To get a sample Common Data Set in excel, use the link below:
 * 
 *  https://github.com/adam-ballinger/supply-chain/blob/c688c1831f9cb9c6f366287054a64cc1e1a50c0a/test/data.xlsx
 * 
 */

const panelData = require("./data-objects.js");
const computation = require("./computation.js");


// Function to be used to get planning data from an excel file. 
function getCommonDataSet(loc, log) {
    
    // Read the common data set from an excel file.
    const result = {
        items: panelData.readExcel(loc, "items", "item"),
        resources: panelData.readExcel(loc, "resources", "resource"),
        forecast: panelData.readExcel(loc, "forecast"),
        requirements: panelData.readExcel(loc, "requirements"),
        capacities: panelData.readExcel(loc, "capacities")
    };

    switch(log) {
        case "verbose":
            console.log({
                message: "Common Data Set load successful.",
                loc,
                items: result.items,
                resources: result.resources,
                forecast: result.forecast,
                requirements: result.requirements,
                capacities: result.capacities
            });
            break;
        
        case "concise":
            console.log({
                message: "Common Data Set load successful."
            })
            break;

        default:
            break;
    }

    return result;
}

// Calculate available resource hours for constrained resources in a dataSet and return as a horizontal plan.
function calcAvailableHours(dataSet, log) {

    // Compute the capacities matrix and get a list of constrained resources.
    // Constrained resources are any resources in listed in dataSet[capacities].
    // Resources not listed in dataSet[capacities] are assumed to be unconstrained.
    const capacity = panelData.createMatrix(dataSet["capacities"], "resource", "period", "quantity");
    const constrained_resources = Object.keys(capacity);

    // Get requirements data for constrained resources.
    var select_requirements = panelData.filter(dataSet["requirements"], {"resource": constrained_resources}, "includes");

    // Create matrices from the forecast and select_requirements data
    var forecast_matrix = panelData.createMatrix(dataSet["forecast"], "item", "period", "quantity");
    var requirements_matrix = panelData.createMatrix(select_requirements, "resource", "item", "quantity");
    
    // Compute the aggregate requirements matrix as the product of requirements and forecast .
    const agg_requirements = computation.matrix_mult(requirements_matrix, forecast_matrix);

    // Compute the result as the difference between capacity and aggreagate requirements.
    const result = computation.difference(capacity, agg_requirements);

    // Log output to the console if desired.
    switch(log) {
        case "verbose":
            console.log({
                message: "Computation of available hours on constrained resources successful.",
                constrained_resources,
                capacity,
                agg_requirements,
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

module.exports = {getCommonDataSet, calcAvailableHours};