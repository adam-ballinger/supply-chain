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

// Compute the piecewise division of two matrices.
function piecewiseDivision(matrixA, matrixB) {
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
            result[rowsA[i]][colsA[j]] = matrixA[rowsA[i]][colsA[j]] / matrixB[rowsA[i]][colsA[j]];
        }
    }

    return result;

}

/**
 * Add any number of matrices together
 * 
 * @param {Array} matrices Array of matrices to be added.
 * @returns A matrix that is the addition of all matrices.
 */
function add(matrices) {

    const keys = Object.keys(matrices);
    const rows = Object.keys(matrices[keys[0]]);
    const cols= Object.keys(matrices[keys[0]][rows[0]]);
    const result = {};

    for(let j = 0; j < rows.length; j++) {
        result[rows[j]] = {};
        for(let k = 0; k < cols.length; k++) {
            result[rows[j]][cols[k]] = 0;
        }
    }

    for(let i = 0; i < keys.length; i++) {
        for(let j = 0; j < rows.length; j++) {
            for(let k = 0; k < cols.length; k++) {
                result[rows[j]][cols[k]] += matrices[keys[i]][rows[j]][cols[k]]
            }
        }
    }

    return result;
}


/**
 * Add a scalar value to every value of a matrix
 * 
 * @param {Object} matrixA Matrix to be added to.
 * @param {number} scalar Scalar value to be added to each element of matrixA
 * @returns A matrix.
 */
function scalar_add(matrixA, scalar) {
    const rowsA = Object.keys(matrixA);
    const colsA = Object.keys(matrixA[rowsA[0]]);
    
    const result = {};

    for(let i = 0; i < rowsA.length; i++) {
        result[rowsA[i]] = {};
        for(let j = 0; j < colsA.length; j++) {
            result[rowsA[i]][colsA[j]] = matrixA[rowsA[i]][colsA[j]] + scalar;
        }
    }

    return result;
}

/**
 * Sum columns of a matrix
 * 
 * @param {Object} matrixA Matrix of columns to be summed
 * @returns A row vector of all column sums
 */
function sum_columns(matrixA) {
    const rowsA = Object.keys(matrixA);
    const colsA = Object.keys(matrixA[rowsA[0]]);
    
    const result = {};

    for(let j = 0; j < colsA.length; j++) {
        let column_sum = 0;
        for(let i = 0; i < rowsA.length; i++) {
            column_sum += matrixA[rowsA[i]][colsA[j]]
        }
        result[colsA[j]] = column_sum
    }

    return result;
}

/**
 * Raise every value of a matrix to the power of a scalar value.
 * 
 * @param {Object} matrixA Matrix to be raised.
 * @param {number} scalar Scalar power.
 * @returns A matrix raised to the power of a scalar value.
 */
function power(matrixA, scalar) {
    const rowsA = Object.keys(matrixA);
    const colsA = Object.keys(matrixA[rowsA[0]]);
    
    const result = {};

    for(let i = 0; i < rowsA.length; i++) {
        result[rowsA[i]] = {};
        for(let j = 0; j < colsA.length; j++) {
            result[rowsA[i]][colsA[j]] = matrixA[rowsA[i]][colsA[j]] ** scalar;
        }
    }

    return result;
}

module.exports = {
    matrix_mult,
    scalar_mult,
    difference,
    piecewiseDivision,
    add, 
    scalar_add,
    sum_columns,
    power
};