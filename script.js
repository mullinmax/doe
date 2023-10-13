document.getElementById('add-factor-btn').addEventListener('click', addFactorInput);
document.getElementById('generate-array-btn').addEventListener('click', generateArray);

let factorCount = 0;

function addFactorInput() {
    factorCount++;
    const factorDiv = document.createElement('div');
    factorDiv.className = 'factor';
    factorDiv.innerHTML = `
        <label>Factor ${factorCount}:</label>
        <input type="text" placeholder="Factor Name">
        <input type="number" placeholder="Number of Levels" min="2">
    `;
    document.getElementById('factors-container').appendChild(factorDiv);
}

function generateArray() {
    // Clear any existing array
    const existingArray = document.getElementById('array-display');
    if (existingArray) {
        existingArray.remove();
    }

    const factors = document.querySelectorAll('.factor');
    const arrayDiv = document.createElement('div');
    arrayDiv.id = 'array-display';
    let tableHeaders = '<th>Experiment</th>';
    factors.forEach((_, index) => {
        tableHeaders += `<th>Factor ${index + 1}</th>`;
    });
    tableHeaders += '<th>Result</th>';

    arrayDiv.innerHTML = `
        <h2>Orthogonal Array with Results</h2>
        <table>
            <thead>
                <tr>
                    ${tableHeaders}
                </tr>
            </thead>
            <tbody>
                <!-- Experiment rows will be added dynamically -->
            </tbody>
        </table>
        <button id="analyze-btn">Analyze Results</button>
    `;
    document.querySelector('.container').appendChild(arrayDiv);

    // Basic L8 array for 2-level factors
    const l8Array = [
        [1, 1, 1],
        [1, 2, 2],
        [2, 1, 2],
        [2, 2, 1],
        [3, 1, 2],
        [3, 2, 1],
        [4, 1, 1],
        [4, 2, 2]
    ];

    const tbody = arrayDiv.querySelector('tbody');
    l8Array.forEach((rowValues, rowIndex) => {
        const row = document.createElement('tr');
        let rowData = `<td>Experiment ${rowIndex + 1}</td>`;
        rowValues.slice(0, factors.length).forEach(value => {
            rowData += `<td>${value}</td>`;
        });
        rowData += '<td><input type="number" placeholder="Enter Result"></td>';
        row.innerHTML = rowData;
        tbody.appendChild(row);
    });

    document.getElementById('analyze-btn').addEventListener('click', analyzeResults);
}

function analyzeResults() {
    const factors = document.querySelectorAll('.factor');
    const rows = document.querySelectorAll('#array-display tbody tr');
    let averages = {};
    let counts = {};

    factors.forEach((_, index) => {
        const factorName = `factor${index + 1}`;
        averages[factorName] = [0, 0];
        counts[factorName] = [0, 0];
    });

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const result = parseFloat(cells[cells.length - 1].querySelector('input').value);

        factors.forEach((_, index) => {
            const factorName = `factor${index + 1}`;
            const level = parseInt(cells[index + 1].textContent) - 1; // 0-based index
            averages[factorName][level] += result;
            counts[factorName][level]++;
        });
    });

    Object.keys(averages).forEach(factor => {
        averages[factor][0] /= counts[factor][0];
        averages[factor][1] /= counts[factor][1];
    });

    const conclusionsDiv = document.createElement('div');
    conclusionsDiv.id = 'conclusions';
    let conclusionsContent = '<h2>Basic Analysis</h2>';
    Object.keys(averages).forEach(factor => {
        conclusionsContent += `
            <p>Average result for ${factor}, Level 1: ${averages[factor][0].toFixed(2)}</p>
            <p>Average result for ${factor}, Level 2: ${averages[factor][1].toFixed(2)}</p>
        `;
    });
    conclusionsDiv.innerHTML = conclusionsContent;
    document.querySelector('.container').appendChild(conclusionsDiv);
}
