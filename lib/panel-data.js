/**
 * @fileoverview Utility functions for working panel data.
 * 
 * In this utility, panel data is assumed to be represented as a nested objects where the
 * outer object represents the records (rows) and the inner objects represent the fields.
 * 
 * Example:
 * const panelData = {
 *     item1: {description: "Flagship model", cost: 10.00, price: 14.00},
 *     item2: {description: "Economy Model", cost: 7.00, price: 9.50}
 * }
 * 
 */

const reader = require('xlsx');

// Read a xlsx file and return as JSON.
function readExcel(loc, sheet_name=null, index_col=null, params={'cellDates': true}) {
    
    // Attempt to get an array of JSON from reader.xlsx
    try {
        // Check for sheet_name parameter, set to first sheet if sheet_name=null.
        let file = reader.readFile(loc, params);
        if(sheet_name === null) {
            sheet_name = file.SheetNames[0];
        }
        array = reader.utils.sheet_to_json(file.Sheets[sheet_name]);
    } catch(error) {
        return(error);
    }

    const result = {};

    // If index_col is null, the utility will create a 0 based integer index.
    if(index_col == null) {
        for(let i = 0; i < array.length; i++) {
            result[i] = array[i];
        }
    }
    
    // If index col is specified, the utility will use that column as the index.
    else {
        for(let i = 0; i < array.length; i++) {
            index = array[i][index_col];
            delete array[i][index_col];
            result[index] = array[i];
        }
    }

    return result;
}

// Filter panel data.
function filter(data, parameters, comparison="==") {

    const result = {};

    // Check for comparison types
    if(comparison == "==") {
        for(const param in parameters) {
            for(const record in data) {
                if(data[record][param] == parameters[param]) {
                    result[record] = data[record];
                }
            }
        }
    }

    // Throw an error is the comparison is not allowed.
    else {
        throw new Error('Comparison not allowed.');
    }

    return result;

}

// Get variations of a field within panel data.
function getVariations(data, field) {
    result = [];

    for(const record in data) {
        if(!result.includes(data[record][field])) {
            result.push(data[record][field]);
        }
    }

    return result;
}

// Create a matrix from a table.
function createMatrix(data, row_feild, column_feild, value_feild) {
    
    let rows = getVariations(data, row_feild);
    let columns = getVariations(data, column_feild);

    result = {};

    for(let i = 0; i < rows.length; i++) {

        result[rows[i]] = {}
        for(let j = 0; j < columns.length; j++) {
            result[rows[i]][columns[j]] = 0
        }
    }

    for(const key in data) {
        let row = data[key][row_feild];
        let col = data[key][column_feild];
        let val = data[key][value_feild];
        
        result[row][col] += val;
    }

    return result;
}

// Compute the matrix multiplication between matrix A and matrix B.
function dot(matrixA, matrixB) {
    
    const rowsA = Object.keys(matrixA);
    const colsA = Object.keys(matrixA[rowsA[0]]);
    const rowsB = Object.keys(matrixB);
    const colsB = Object.keys(matrixB[rowsB[0]]);

    const result = {};

    if(colsA.length !== rowsB.length) {
        throw new Error("Invalid matrix dimensions for multiplication");
    }

    for(let i = 0; i < rowsA.length; i++) {
        result[rowsA[i]] = {}
        for(let j = 0; j < colsB.length; j++) {
            result[rowsA[i]][colsB[j]] = 0;
            for(let k = 0; k < colsA.length; k++) {
                result[rowsA[i]][colsB[j]] += matrixA[rowsA[i]][colsA[k]] * matrixB[rowsB[k]][colsB[j]];
            }
        }
    }

    return result;

}


module.exports = {readExcel, filter, createMatrix, getVariations, createMatrix, dot};