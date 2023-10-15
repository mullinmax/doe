document.getElementById('add-factor-btn').addEventListener('click', addFactorInput);
document.getElementById('generate-array-btn').addEventListener('click', generateAndDisplayArray);

let factorCount = 0;

function addFactorInput() {
    factorCount++;
    const factorDiv = document.createElement('div');
    factorDiv.className = 'factor';
    factorDiv.innerHTML = `
        <label>Factor ${factorCount} Levels (comma separated):</label>
        <input type="text" placeholder="e.g. 1,2,4 or H,M,L">
    `;
    document.getElementById('factors-container').appendChild(factorDiv);
}

async function generateAndDisplayArray() {
    const factors = Array.from(document.querySelectorAll('.factor')).map(factor => {
        return factor.querySelector('input[type="text"]').value.split(',').length;
    });

    // Load Pyodide and Python packages
    await loadPyodideAndPackages();

    // Run the Python code using Pyodide
    const resultFromPython = pyodide.runPython(`gsd(${JSON.stringify(factors)})`);

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
        tableHeaders += `<th>Factor ${i}</th>`;
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

let pyodideLoaded = false;

async function loadPyodideAndPackages() {
    if (pyodideLoaded) {
        return;
    }

    await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/" });

    // Check if Pyodide is defined
    if (typeof pyodide === 'undefined') {
        throw new Error("Pyodide failed to load properly.");
    }

    await pyodide.loadPackage(['numpy']);
    const pythonCode = await fetch('https://mullinmax.github.io/doe/src/gsd.py').then(resp => resp.text());
    pyodide.runPython(pythonCode);

    pyodideLoaded = true;
}

