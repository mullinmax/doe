document.getElementById('add-factor-btn').addEventListener('click', addFactorInput);
document.getElementById('generate-array-btn').addEventListener('click', generateArray);

let factorCount = 0;

function addFactorInput() {
    factorCount++;
    const factorDiv = document.createElement('div');
    factorDiv.className = 'factor';
    factorDiv.innerHTML = `
        <label>Factor ${factorCount} Name:</label>
        <input type="text" placeholder="Factor Name">
        <label>Levels:</label>
        <input type="text" placeholder="e.g. 1,2,4 or H,M,L">
    `;
    document.getElementById('factors-container').appendChild(factorDiv);
}

function generateArray() {
    // Clear any existing array
    const existingArray = document.getElementById('array-display');
    if (existingArray) {
        existingArray.remove();
    }

    const factors = Array.from(document.querySelectorAll('.factor')).map(factor => {
        return {
            name: factor.querySelector('input[type="text"]').value,
            levels: factor.querySelector('input[type="text"]:nth-child(3)').value.split(',')
        };
    });

    const arrayDiv = document.createElement('div');
    arrayDiv.id = 'array-display';
    let tableHeaders = '<th>Experiment</th>';
    factors.forEach(factor => {
        tableHeaders += `<th>${factor.name}</th>`;
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

    // Basic L8 array for 2-level factors (placeholder, can be expanded for more complex arrays)
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
        rowValues.forEach((value, index) => {
            rowData += `<td>${factors[index].levels[value - 1]}</td>`;
        });
        rowData += '<td><input type="number" placeholder="Enter Result"></td>';
        row.innerHTML = rowData;
        tbody.appendChild(row);
    });

    document.getElementById('analyze-btn').addEventListener('click', analyzeResults);
}

function analyzeResults() {
    const factors = Array.from(document.querySelectorAll('.factor')).map(factor => {
        return {
            name: factor.querySelector('input[type="text"]').value,
            levels: factor.querySelector('input[type="text"]:nth-child(3)').value.split(',')
        };
    });
    const rows = document.querySelectorAll('#array-display tbody tr');
    let averages = {};
    let counts = {};

    factors.forEach(factor => {
        averages[factor.name] = factor.levels.map(() => 0);
        counts[factor.name] = factor.levels.map(() => 0);
    });

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const result = parseFloat(cells[cells.length - 1].querySelector('input').value);

        factors.forEach((factor, index) => {
            const levelIndex = factor.levels.indexOf(cells[index + 1].textContent);
            averages[factor.name][levelIndex] += result;
            counts[factor.name][levelIndex]++;
        });
    });

    Object.keys(averages).forEach(factorName => {
        averages[factorName] = averages[factorName].map((sum, index) => sum / counts[factorName][index]);
    });

    const conclusionsDiv = document.createElement('div');
    conclusionsDiv.id = 'conclusions';
    let conclusionsContent = '<h2>Basic Analysis</h2>';
    Object.keys(averages).forEach(factorName => {
        factors.find(factor => factor.name === factorName).levels.forEach((level, index) => {
            conclusionsContent += `
                <p>Average result for ${factorName}, Level ${level}: ${averages[factorName][index].toFixed(2)}</p>
            `;
        });
    });
    conclusionsDiv.innerHTML = conclusionsContent;
    document.querySelector('.container').appendChild(conclusionsDiv);
}
