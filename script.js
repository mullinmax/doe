// Ensure Pyodide is loaded on page load
let pyodideInstance = null;

async function loadPyodideAndPackages() {
    if (pyodideInstance) {
        return;
    }

    pyodideInstance = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/" });
    await pyodideInstance.loadPackage(['numpy']);
    const pythonCode = await fetch('https://mullinmax.github.io/doe/src/gsd.py').then(resp => resp.text());
    pyodideInstance.runPython(pythonCode);
    
    const generateArrayButton = document.getElementById('generate-array-btn');
    generateArrayButton.disabled = false;

}

loadPyodideAndPackages();

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('add-factor-btn').addEventListener('click', addFactorInput);
    document.getElementById('generate-array-btn').addEventListener('click', generateAndDisplayArray);
    document.getElementById('reduction').addEventListener('input', updateEstimatedRows);
    updateEstimatedRows();
});


document.getElementById('add-factor-btn').addEventListener('click', addFactorInput);
document.getElementById('generate-array-btn').addEventListener('click', generateAndDisplayArray);

let factorCount = 0;
let factorData = {};  // Store factor names and levels

function addFactorInput() {
    factorCount++;
    const factorDiv = document.createElement('div');
    factorDiv.className = 'factor';
    factorDiv.innerHTML = `
        <label>Factor ${factorCount} Name:</label>
        <input type="text" id="factor-name-${factorCount}" placeholder="e.g. Temperature">
        <label>Factor ${factorCount} Levels (comma separated):</label>
        <input type="text" id="factor-levels-${factorCount}" placeholder="e.g. H,M,L">
    `;
    document.getElementById('factors-container').appendChild(factorDiv);
}

function updateEstimatedRows() {
    const factors = Array.from(document.querySelectorAll('.factor')).map(factor => {
        return factor.querySelector('input[type="text"]').value.split(',').length;
    });
    const totalFactorial = factors.reduce((acc, val) => acc * val, 1);
    const reductionSlider = document.getElementById('reduction');
    const reduction = parseInt(reductionSlider.value, 10);
    const estimatedRows = Math.ceil(totalFactorial / reduction);

    // Adjust the slider's maximum value based on the constraints
    while (estimatedRows <= factors.length && reductionSlider.max > 2) {
        reductionSlider.max = reductionSlider.max - 1;
        reductionSlider.value = reductionSlider.max;
        updateEstimatedRows();
        return;
    }

    document.getElementById('reductionValue').textContent = reductionSlider.value;
    document.getElementById('estimatedRows').textContent = `Estimated Rows: ${estimatedRows}`;
}

async function generateAndDisplayArray() {
    const factors = Array.from(document.querySelectorAll('.factor')).map(factor => {
        return factor.querySelector('input[id^="factor-levels-"]').value.split(',').length;
    });
    const reduction = parseInt(document.getElementById('reduction').value, 10);

    // Store factor names and levels
    for (let i = 1; i <= factorCount; i++) {
        const factorName = document.getElementById(`factor-name-${i}`).value;
        const factorLevels = document.getElementById(`factor-levels-${i}`).value.split(',');
        factorData[`factor${i}`] = {
            name: factorName,
            levels: factorLevels
        };
    }

    // Load Pyodide and Python packages
    await loadPyodideAndPackages();

    // Run the Python code using Pyodide
    const resultFromPython = pyodideInstance.runPython(`gsd(${JSON.stringify(factors)}, ${reduction})`);

    // Display the result in a table
    displayArrayInTable(resultFromPython.toJs());
}

function displayArrayInTable(array) {
    // Clear any existing array
    const existingArray = document.getElementById('array-display');
    if (existingArray) {
        existingArray.remove();
    }

    const arrayDiv = document.createElement('div');
    arrayDiv.id = 'array-display';
    let tableHeaders = '<th>Experiment</th>';
    for (let i = 1; i <= factorCount; i++) {
        tableHeaders += `<th>${factorData[`factor${i}`].name}</th>`;
    }

    let tableRows = '';
    array.forEach((row, rowIndex) => {
        let rowData = `<td>#${rowIndex + 1}</td>`;
        row.forEach((value, colIndex) => {
            const factorLevels = factorData[`factor${colIndex + 1}`].levels;
            rowData += `<td>${factorLevels[value]}</td>`;
        });
        tableRows += `<tr>${rowData}</tr>`;
    });

    arrayDiv.innerHTML = `
        <h2>Generated Orthogonal Array</h2>
        <table>
            <thead>
                <tr>
                    ${tableHeaders}
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
    document.querySelector('.container').appendChild(arrayDiv);

    document.getElementById('add-measurement-btn').style.display = 'block';

}

function addMeasurementColumn() {
    const arrayDisplay = document.getElementById('array-display');
    if (!arrayDisplay) {
        alert('Please generate the array first.');
        return;
    }

    const columnName = prompt('Enter the name for the measurement column:');
    if (!columnName) {
        return;
    }

    // Add header
    const tableHeader = arrayDisplay.querySelector('thead tr');
    const headerCell = document.createElement('th');
    headerCell.textContent = columnName;
    tableHeader.appendChild(headerCell);

    // Add input cells to each row
    const tableRows = arrayDisplay.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        cell.appendChild(input);
        row.appendChild(cell);
    });
}
