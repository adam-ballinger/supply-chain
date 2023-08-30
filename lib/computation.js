/**
 * @fileoverview Utility functions for perfoming computation with Utility functions for performing
 * computation with data matrices.
 * 
 * In this utility, data matrices are assumed to be represented as nested objects where the
 * outer object represents the records (rows) and the inner objects represent the fields (columns).
 * 
 * Example:
 * const matrixA = {
 *     item1: {cost: 10.00, price: 14.00},
 *     item2: {cost: 7.00, price: 9.50}
 * }
 * 
 */

// Compute the matrix multiplication between matrix A and matrix B.
function matrix_mult(matrixA, matrixB) {
    
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

// Compute a scalar multiplication of a matrix.
function scalar_mult(matrixA, scalar) {
    
    const rowsA = Object.keys(matrixA);
    const colsA = Object.keys(matrixA[rowsA[0]]);
    
    const result = {};

    for(let i = 0; i < rowsA.length; i++) {
        result[rowsA[i]] = {};
        for(let j = 0; j < colsA.length; j++) {
            result[rowsA[i]][colsA[j]] = matrixA[rowsA[i]][colsA[j]] * scalar;
        }
    }

    return result;
    
}

// Compute the difference of two matrices.
function difference(matrixA, matrixB) {

    const rowsA = Object.keys(matrixA);
    const colsA = Object.keys(matrixA[rowsA[0]]);
    const rowsB = Object.keys(matrixB);
    const colsB = Object.keys(matrixB[rowsB[0]]);

    if((rowsA.length !== rowsB.length) || (colsA.length !== colsB.length)) {
        throw new Error("Invalid matrix dimensions for subtraction");
    }


    const result = {};

    for(let i = 0; i < rowsA.length; i++) {
        result[rowsA[i]] = {};
        for(let j = 0; j < colsA.length; j++) {
            result[rowsA[i]][colsA[j]] = matrixA[rowsA[i]][colsA[j]] - matrixB[rowsA[i]][colsA[j]];
        }
    }

    return result;

}


module.exports = {matrix_mult, scalar_mult, difference}