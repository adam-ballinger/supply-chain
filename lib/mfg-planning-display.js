const fs = require('fs');
const dataObjects = require("./data-objects.js")

function generateHTMLTable(table) {
    
    let rows = Object.keys(table);
    let columns = Object.keys(table[rows[0]]);
    
    result = `
      <table class="table table-hover table-sm">
        <thead>
          <tr>
            <th></th>
    `;

    for(let i = 0; i < columns.length; i++) {
        result += `
            <th scope="col">${columns[i]}</th>
        `;
    }

    result += `
        </tr>
      </thead>
      <tbody>    
    `;

    for(let i  = 0; i < rows.length; i++) {
        result += `
            <tr>
            <th scope="row">${rows[i]}</th>
        `;
        
        for(let j = 0; j < columns.length; j++) {
          try {
            result += `
            <td class="text-right">${table[rows[i]][columns[j]].toLocaleString()}</td>
            `;
          } catch {
            result += `
            <td class="text-right"></td>
            `;
          }
        }
        
        result += `
            </tr>
        `;
    }

    result += `
        </tbody>
      </table>
    `;

    return result;
}

function generateRYGTable(table) {
    
    let rows = Object.keys(table);
    let columns = Object.keys(table[rows[0]]);
    
    result = `
      <table class="table table-hover table-sm">
        <thead>
          <tr>
            <th></th>
    `;

    for(let i = 0; i < columns.length; i++) {
        result += `
            <th scope="col">${columns[i]}</th>
        `;
    }

    result += `
        </tr>
      </thead>
      <tbody>    
    `;

    for(let i  = 0; i < rows.length; i++) {
        result += `
            <tr>
            <th scope="row">${rows[i]}</th>
        `;
        
        for(let j = 0; j < columns.length; j++) {
            let style = "";
            let value = table[rows[i]][columns[j]];
            if(value > 1) {
                style = "background-color: #ea4335; color: white;";
            } else if(value > 0.9) {
                style = "background-color: #fbbc04";
            }
            result += `
            <td class="text-right" style="${style}">${value.toLocaleString()}</td>
            `;
        }
        
        result += `
            </tr>
        `;
    }

    result += `
        </tbody>
      </table>
    `;

    return result;
}

function generatePlanningView(data, loc, title) {
    // Create the HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${title}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-0evHe/X+R7YkIZDRvuzKMRqM+OrBnVFBL6DOitfPri4tjfHxaWutUpFmBp4vmVor" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body>
        <div class="container py-4">
          <header class="pb-3 mb-4 border-bottom">
            <h1>VS Planning View</h1>
          </header>
          <div class="container py-4 mt-4">
            <h3>Items</h3>
            <div class="container pt-5">
              ${generateHTMLTable(data.items)}
            </div>
          </div>
          <div class="container py-4 mt-4">
            <h3>Horizontal Plans - Inventory Management</h3>
            <div class="container pt-5">
              <p>A Horizontal Plan lays out the planned inventory, supply, and demand for a specific item for each period.</p>
            </div>
    `;

    // Create Horizontal Plan tables.
    let hp = data.horizontalPlan
    for(const h in hp) {
    
        htmlContent += `
            <div class="container pt-5">
              <h5>${h} - ${data.items[h].description}</h5>
              <h6>Strategy: ${data.items[h].strategy}</h6>
        `

        htmlContent += generateHTMLTable(hp[h])

        htmlContent += `</div>`
    }



    // Create Aggregate Inventory Table
    htmlContent += `
        <div class="container pt-5">
          <h5>Aggregate Inventory Table</h5>
          <p>The Aggregate Inventory Table shows the dollar value of total inventory each period.</p>
    `

    htmlContent += generateHTMLTable(data.aggInventoryPlan)

    htmlContent += `</div>`
    htmlContent += `</div>`

      
    // Create Resource table
    htmlContent += `
        <div class="container py-4 mt-4">
          <h3>RYG - Resource Management</h3>
          <div class="container pt-5">
            <h5>Resources</h5>
            ${generateHTMLTable(data.resources)}
          </div>
          <div class="container pt-5">
            <h5>Aggregate Resource Requirements</h5>
            <p>The Aggregate Resource Requirements matrix shows the total hours required for every resource per period.</p>
            ${generateHTMLTable(data.aggRequirements)}
          </div>
          <div class="container pt-5">
            <h5>Constraints Matrix</h5>
            <p>The constraints matrix lays out how many hours of capacity each constrained resource has per period.</p>
            ${generateHTMLTable(dataObjects.createMatrix(data.constraints, "resource", "period", "constraint"))}      
          </div>
          <div class="container pt-5">
            <h5>RYG</h5>
            <p>The RYG matrix lays out the demand on constrained resources as a percentage of capacity.</p>
            ${generateRYGTable(data.ryg)}      
          </div>
        </div>    
      </body>
      </html>
    `;
  
    fs.writeFileSync(loc, htmlContent);
    console.log({
        "message": "HTML file created",
        "file loc": loc
    })
}


  
module.exports = {generatePlanningView}