/**
 * @fileoverview Utility functions for calculating statistics.
 * 
 * In this utility, data objects are assumed to be represented as a nested objects where the
 * outer object represents the records (rows) and the inner objects represent the fields.
 * 
 * Example:
 * const dataObject = {
 *     item1: {description: "Flagship model", cost: 10.00, price: 14.00},
 *     item2: {description: "Economy Model", cost: 7.00, price: 9.50}
 * }
 * 
 */

const computation = require('./computation.js');
const dataObjects = require('./data-objects.js');

/**
 * Gathers statistics of a specified column of a data object.
 *
 * @param {Object} data - The data object to analyze.
 * @param {string} column - The column of data to analyze
 * @param {number} z - the Z-score to use when detrmining outliers
 * @return {Object} An object containing the statistics of the data.
 */
function calc(data, column, z=3.0) {

    let stats = {
        count: Object.keys(data).length,
        average: calc_average(data, column),
        max: 0,
        min: Infinity,
        outliers: {}
    };

    let values = [];

    // Initial data scrape.
    for (const record in data) {
        if (data.hasOwnProperty(record)) {
            let value = data[record][column]
            values.push(value);
            if(value > stats.max) {
                stats.max = value;
            }
            if(value < stats.min) {
                stats.min = value;
            }
        }
    }

    // Sort the values array
    values.sort((a, b) => a - b);

    // Calculate median.
    if (stats.count % 2 === 0) {
        // If even number of records
        let mid1 = values[(stats.count / 2) - 1];
        let mid2 = values[stats.count / 2];
        stats.median = (mid1 + mid2) / 2;
    } else {
        // If odd number of records
        stats.median = values[Math.floor(stats.count / 2)];
    }   

    // Calc statistics
    stats.stdDev_s = calc_stdDev(data, column, 'sample', stats.average);
    stats.stdDev_p = calc_stdDev(data, column, 'population', stats.average);
    stats.lcl = stats.average - z * stats.stdDev_s;
    stats.ucl = stats.average + z * stats.stdDev_s;

    // Identify outliers
    for (const record in data) {
        if (data.hasOwnProperty(record)) {
            let value = data[record][column]
            if(value > stats.ucl || value < stats.lcl) {
                stats.outliers[record] = value;
            }
        }
    }

    // If there are outliers, calculated the adjusted average and standard deviation without outliers.
    if(Object.keys(stats.outliers).length > 0) {
        
        let data_adj = dataObjects.remove(data, Object.keys(stats.outliers));
        stats.average_adj = calc_average(data_adj, column);
        stats.stdDev_adj = calc_stdDev(data_adj, column);
    }

    return stats;
}

/**
 * Average of a data set
 * 
 * @param {Object} data Data to be averaged.
 * @param {string} column Column name to be averaged.
 * @returns {Object} Average of the single column data.
 */
function calc_average(data, column) {

    let select_data = dataObjects.rip(data, [column]);
    let count = Object.keys(select_data).length;
    let sum = computation.sum_columns(select_data)[column];

    let average = sum / count;

    return average;
}

/**
 * Standard Deviation of a data set
 * 
 * @param {Object} data Data to be analyzed.
 * @param {string} column Column name to be analyzed.
 * @param {boolean} stdDevType Use 'sample' or 'population'.
 * @param {number} average If known, supply an average value to optimize computation.
 * @returns {Object} Standard Deviation of the single column data.
 */
function calc_stdDev(data, column, stdDevType='sample', average=null) {
    
    let select_data = dataObjects.rip(data, [column]);
    let count = Object.keys(select_data).length;

    if(average == null) {
        average = calc_average(select_data, column);
    }

    let deviations = computation.scalar_add(select_data, -average);
    let squaredDeviations = computation.power(deviations, 2);
    let sumSquaredDeviations = computation.sum_columns(squaredDeviations)[column];
    let variance = null;
    
    if(stdDevType == 'sample') {
        variance = sumSquaredDeviations / (count - 1);
    } else if(stdDevType == 'population'){
        variance = sumSquaredDeviations / count;
    } else {
        throw new Error('stdDevType must be "sample" or "population".');
    }

    let stdDev = Math.sqrt(variance);

    return stdDev;
}

module.exports = 
{
    calc
};