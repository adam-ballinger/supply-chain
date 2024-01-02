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

/**
 * Computes the norm inverse (z-score) of a probability.
 * 
 * @param {number} p - Probability for which to compute z.
 * @returns {number} z-score
 */
function normInverse(p) {
    // Expanded table of precalculated z-scores for standard normal distribution in 0.01 increments
    const zTable = {
        0.000000001: -6,
        0.00000001: -5.61, 0.0000001: -5.2, 0.000001: -4.75,
        0.00001: -4.26, 0.0001: -3.72, 0.001: -3.09, 0.005: -2.58,
        0.01: -2.33, 0.02: -2.05, 0.03: -1.88, 0.04: -1.75, 0.05: -1.64,
        0.06: -1.55, 0.07: -1.48, 0.08: -1.41, 0.09: -1.34, 0.10: -1.28,
        0.11: -1.23, 0.12: -1.17, 0.13: -1.13, 0.14: -1.08, 0.15: -1.04,
        0.16: -0.99, 0.17: -0.95, 0.18: -0.92, 0.19: -0.88, 0.20: -0.84,
        0.21: -0.81, 0.22: -0.77, 0.23: -0.74, 0.24: -0.71, 0.25: -0.67,
        0.26: -0.64, 0.27: -0.61, 0.28: -0.58, 0.29: -0.55, 0.30: -0.52,
        0.31: -0.50, 0.32: -0.47, 0.33: -0.44, 0.34: -0.41, 0.35: -0.39,
        0.36: -0.36, 0.37: -0.33, 0.38: -0.31, 0.39: -0.28, 0.40: -0.25,
        0.41: -0.23, 0.42: -0.20, 0.43: -0.18, 0.44: -0.15, 0.45: -0.13,
        0.46: -0.10, 0.47: -0.08, 0.48: -0.05, 0.49: -0.03, 0.50:  0.00,
        0.51:  0.03, 0.52:  0.05, 0.53:  0.08, 0.54:  0.10, 0.55:  0.13,
        0.56:  0.15, 0.57:  0.18, 0.58:  0.20, 0.59:  0.23, 0.60:  0.25,
        0.61:  0.28, 0.62:  0.31, 0.63:  0.33, 0.64:  0.36, 0.65:  0.39,
        0.66:  0.41, 0.67:  0.44, 0.68:  0.47, 0.69:  0.50, 0.70:  0.52,
        0.71:  0.55, 0.72:  0.58, 0.73:  0.61, 0.74:  0.64, 0.75:  0.67,
        0.76:  0.71, 0.77:  0.74, 0.78:  0.77, 0.79:  0.81, 0.80:  0.84,
        0.81:  0.88, 0.82:  0.92, 0.83:  0.95, 0.84:  0.99, 0.85:  1.04,
        0.86:  1.08, 0.87:  1.13, 0.88:  1.17, 0.89:  1.23, 0.90:  1.28,
        0.91:  1.34, 0.92:  1.41, 0.93:  1.48, 0.94:  1.55, 0.95:  1.64,
        0.96:  1.75, 0.97:  1.88, 0.98:  2.05, 0.985: 2.17, 0.99:  2.33, 
        0.995: 2.58, 0.999: 3.09, 0.9999: 3.72, 0.99999: 4.26,
        0.999999: 4.75, 0.9999999: 5.20, 0.99999999: 5.61,
        0.999999999: 6.00
    };  

    // Find the two closest known values
    let lowerP = 0, higherP = 1;
    for (let key in zTable) {
        if (Number(key) == p ) return zTable[Number(p)];
        if (Number(key) <= p && Number(key) > lowerP) lowerP = Number(key);
        if (Number(key) >= p && Number(key) < higherP) higherP = Number(key);
    }

    // Linear interpolation
    const lowerZ = zTable[lowerP];
    const higherZ = zTable[higherP];

    const interpolatedZ = lowerZ + (higherZ - lowerZ) * ((p - lowerP) / (higherP - lowerP));

    return interpolatedZ;
}


module.exports = 
{
    calc,
    normInverse
};