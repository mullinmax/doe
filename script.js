document.getElementById('add-factor-btn').addEventListener('click', addFactorInput);
document.getElementById('generate-array-btn').addEventListener('click', generateAndDisplayArray);

let factorCount = 0;

function addFactorInput() {
    factorCount++;
    const factorDiv = document.createElement('div');
    factorDiv.className = 'factor';
    factorDiv.innerHTML = `
        <label for="factorName${factorCount}">Factor Name:</label>
        <input type="text" id="factorName${factorCount}" placeholder="Factor ${factorCount}">
        <label for="factorValues${factorCount}">Values:</label>
        <input type="text" id="factorValues${factorCount}" placeholder="e.g. 1,2,4 or H,M,L">
    `;
    document.getElementById('factors-container').appendChild(factorDiv);
}

function updateEstimatedRows() {
    const factors = Array.from(document.querySelectorAll('.factor')).map(factor => {
        return factor.querySelector('input[type="text"]:last-child').value.split(',').length;
    });
    const totalFactorial = factors.reduce((acc, val) => acc * val, 1);
    const reductionSlider = document.getElementById('reduction');
    const reduction = parseInt(reductionSlider.value, 10);
    const estimatedRows = Math.ceil(totalFactorial / reduction);

    // Adjust the slider's maximum value based on the constraints
    while (estimatedRows <= 2 * factors.length && reductionSlider.max > 2) {
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
        return factor.querySelector('input[type="text"]:last-child').value.split(',').length;
    });
    const reduction = parseInt(document.getElementById('reduction').value, 10);

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
        const factorNameInput = document.querySelector(`#factor-name-${i}`);
        const factorName = factorNameInput ? factorNameInput.value : `Factor ${i}`;
        tableHeaders += `<th>${factorName}</th>`;
    }

    let tableRows = '';
    array.forEach((row, rowIndex) => {
        let rowData = `<td>Experiment ${rowIndex + 1}</td>`;
        row.forEach(value => {
            rowData += `<td>${value}</td>`;
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
}

function addMeasurementColumn() {
    const table = document.querySelector('#array-display table');
    const header = table.querySelector('thead tr');
    const th = document.createElement('th');
    th.textContent = 'Measurement';
    header.appendChild(th);

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        td.appendChild(input);
        row.appendChild(td);
    });
}

window.addEventListener('load', async () => {
    await loadPyodideAndPackages();
});

let pyodideInstance = null;

async function loadPyodideAndPackages() {
    if (pyodideInstance) {
        return;
    }

    pyodideInstance = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/" });
    await pyodideInstance.loadPackage(['numpy']);
    const pythonCode = await fetch('https://mullinmax.github.io/doe/src/gsd.py').then(resp => resp.text());
    pyodideInstance.runPython(pythonCode);
}
