const fs = require('fs');

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
            result += `
            <td class="text-right">${hp[h][rows[i]][columns[j]].toLocaleString()}</td>
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

function generatePlanningView(data, loc) {
    // Create the HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Planning View</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-0evHe/X+R7YkIZDRvuzKMRqM+OrBnVFBL6DOitfPri4tjfHxaWutUpFmBp4vmVor" crossorigin="anonymous">
      </head>
      <body>
        <div class="container py-4">
          <header class="pb-3 mb-4 border-bottom">
            <h1>VS Planning View</h1>
          </header>
          <div class="container py-4">
            <h3>Horizontal Plan (Inventory Management)</h3>
            <div class="container pt-5">
              <p>A Horizontal Plan lays out the planned inventory, supply, and demand for a specific item for each period.</p>
            </div>
    `;

    let hp = data.horizontalPlan
    for(const h in hp) {
        let rows = Object.keys(hp[h]);
        let columns = Object.keys(hp[h][rows[0]]);
    
        htmlContent += `
            <div class="container pt-5">
              <h5>${h} - ${data.items[h].description}</h5>
              <h6>Strategy: ${data.items[h].strategy}</h6>
              <table class="table table-hover table-sm">
                <thead>
                  <tr>
                    <th></th>       
        `

        // Generate table headers
        for(let i = 0; i < columns.length; i++) {
            htmlContent += `
                <th scope="col">${columns[i]}</th>
            `
        }

        htmlContent += `
            </tr>
          </thead>
          <tbody>    
        `

        // Loop through the hp and generate table rows and columns
        for(let i  = 0; i < rows.length; i++) {
            htmlContent += `
                <tr>
                <th scope="row">${rows[i]}</th>
            `
            
            for(let j = 0; j < columns.length; j++) {
                htmlContent += `
                <td class="text-right">${hp[h][rows[i]][columns[j]].toLocaleString()}</td>
                `
            }
            
            htmlContent += `
                </tr>
            `;
        }

        htmlContent += `
              
            </tbody>
          </table>
        </div>
        `
    }
       
    // Create Resource table
    htmlContent += `
        </div>
        <div class="container py-4">
          <h3>RYG (Resource Management)</h3>
          <div class="container pt-5">
            <h5>Aggregate Resource Requirements</h5>
            <p>The Aggregate Resource Requirements matrix shows the total hours required for every resource per period.</p>
            <table class="table table-hover table-sm">
                <thead>
                  <tr>
                    <th></th>
    `

    let rows = Object.keys(data.aggRequirements);
    let columns = Object.keys(data.aggRequirements[rows[0]]);

    // Generate table headers
    for(let i = 0; i < columns.length; i++) {
        htmlContent += `
            <th scope="col">${columns[i]}</th>
        `
    }

    for(let i  = 0; i < rows.length; i++) {
        htmlContent += `
            <tr>
            <th scope="row">${rows[i]}</th>
        `
        
        for(let j = 0; j < columns.length; j++) {
            htmlContent += `
            <td class="text-right">${data.aggRequirements[rows[i]][columns[j]].toLocaleString()}</td>
            `
        }
        
        htmlContent += `
            </tr>
        `;
    }

    htmlContent += `      
        </tbody>
      </table>
    </div>
    <div class="container pt-5">
      <h5>Constraints Matrix</h5>
      <p>The constraints matrix lays out how many hours of capacity each constrained resource has per period.</p>

    `






    // Complete the HTML content
    htmlContent += `
        
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