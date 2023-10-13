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
    // Assuming a basic L8 array for 2-level factors
    const arrayDiv = document.createElement('div');
    arrayDiv.id = 'array-display';
    arrayDiv.innerHTML = `
        <h2>Orthogonal Array (L8) with Results</h2>
        <table>
            <thead>
                <tr>
                    <th>Experiment</th>
                    <th>Factor 1</th>
                    <th>Factor 2</th>
                    <th>Factor 3</th>
                    <th>Result</th>
                </tr>
            </thead>
            <tbody>
                <!-- Experiment rows will be added dynamically -->
            </tbody>
        </table>
        <button id="analyze-btn">Analyze Results</button>
    `;
    document.querySelector('.container').appendChild(arrayDiv);

    // Add rows for experiments
    const tbody = arrayDiv.querySelector('tbody');
    for (let i = 0; i < 8; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Experiment ${i+1}</td>
            <td>1</td>
            <td>2</td>
            <td>1</td>
            <td><input type="number" placeholder="Enter Result"></td>
        `;
        tbody.appendChild(row);
    }

    document.getElementById('analyze-btn').addEventListener('click', analyzeResults);
}

function analyzeResults() {
    // Basic analysis: compute the average result for each level of each factor
    // This is a very rudimentary analysis; in a full-fledged tool, you'd perform more sophisticated statistical analyses

    let averages = { factor1: [0, 0], factor2: [0, 0], factor3: [0, 0] }; // Assuming 3 factors with 2 levels each for simplicity
    let counts = { factor1: [0, 0], factor2: [0, 0], factor3: [0, 0] };

    const rows = document.querySelectorAll('#array-display tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const result = parseFloat(cells[4].querySelector('input').value);

        ['factor1', 'factor2', 'factor3'].forEach((factor, index) => {
            const level = parseInt(cells[index + 1].textContent) - 1; // 0-based index
            averages[factor][level] += result;
            counts[factor][level]++;
        });
    });

    ['factor1', 'factor2', 'factor3'].forEach(factor => {
        averages[factor][0] /= counts[factor][0];
        averages[factor][1] /= counts[factor][1];
    });

    // Display basic conclusions
    const conclusionsDiv = document.createElement('div');
    conclusionsDiv.id = 'conclusions';
    conclusionsDiv.innerHTML = `
        <h2>Basic Analysis</h2>
        <p>Average result for Factor 1, Level 1: ${averages.factor1[0].toFixed(2)}</p>
        <p>Average result for Factor 1, Level 2: ${averages.factor1[1].toFixed(2)}</p>
        <p>Average result for Factor 2, Level 1: ${averages.factor2[0].toFixed(2)}</p>
        <p>Average result for Factor 2, Level 2: ${averages.factor2[1].toFixed(2)}</p>
        <p>Average result for Factor 3, Level 1: ${averages.factor3[0].toFixed(2)}</p>
        <p>Average result for Factor 3, Level 2: ${averages.factor3[1].toFixed(2)}</p>
    `;

    document.querySelector('.container').appendChild(conclusionsDiv);
}
