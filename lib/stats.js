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

/**
 * Gathers statistics from a dataObject with single-column records.
 *
 * @param {Object} data - The data object to analyze.
 * @param {number} z - the Z-score to use when detrmining outliers
 * @return {Object} An object containing the statistics of the data.
 */
function calc(data, z=3.0) {

    const firstRecord = data[Object.keys(data)[0]];
    let field = Object.keys(firstRecord)[0];

    let stats = {
        count: 0,
        max: 0,
        min: Infinity,
        outliers: {}
    };

    let comp = {
        sum: 0,
        sumSquaredDeviations: 0
    };

    let values = [];

    // Initial data scrape.
    for (const record in data) {
        if (data.hasOwnProperty(record)) {
            let value = data[record][field]
            stats.count++;
            comp.sum += value;
            values.push(value);
            if(value > stats.max) {
                stats.max = value;
            }
            if(value < stats.min) {
                stats.min = value;
            }
        }
    }

    // Calc average.
    stats.average = comp.sum / stats.count;

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

    // Secondary data scrape to sum the squared deviations from the average.
    for (const i in values) {
        comp.sumSquaredDeviations += (values[i] - stats.average) ** 2;
    }    

    // Calc statistics
    comp.variance_p = comp.sumSquaredDeviations / stats.count;
    comp.variance_s = comp.sumSquaredDeviations / (stats.count - 1);
    stats.stdDev_p = Math.sqrt(comp.variance_p);
    stats.stdDev_s = Math.sqrt(comp.variance_s);
    stats.lcl = stats.average - z * stats.stdDev_s;
    stats.ucl = stats.average + z * stats.stdDev_s;

    // Identify outliers
    for (const record in data) {
        if (data.hasOwnProperty(record)) {
            let value = data[record][field]
            if(value > stats.ucl || value < stats.lcl) {
                stats.outliers[record] = value;
            }
        }
    }

    // If there are outliers, calculated the adjusted average and standard deviation without outliers.
    if(Object.keys(stats.outliers).length > 0) {
        // Calc adjusted average
        comp.sumWithoutOutliers = comp.sum;
        for(record in stats.outliers) {
            let value = stats.outliers[record]
            comp.sumWithoutOutliers -= value;
        }
        stats.average_adj = comp.sumWithoutOutliers / (stats.count - Object.keys(stats.outliers).length);

        comp.sumSqDevWithoutOutliers = 0;
        // Calc the adjusted stdDev
        for (const i in ) {
            comp.sumSqDevWithoutOutliers += (values[i] - stats.average) ** 2;
        }  
        comp.variance_adj = comp.sumSqDevWithoutOutliers / (stats.count - Object.keys(stats.outliers).length);
        stats.stdDev_adj = Math.sqrt(comp.variance_adj);
    }

    return stats;
}

module.exports = 
{
    calc
};