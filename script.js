document.addEventListener("DOMContentLoaded", function() {
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

    function generateAndDisplayArray() {
        const factors = Array.from(document.querySelectorAll('.factor')).map(factor => {
            return factor.querySelector('input[type="text"]').value.split(',').length;
        });

        // Call the Python function using Brython
        const resultFromPython = __BRYTHON__.run_script(`gsd(${JSON.stringify(factors)})`);

        // Parse the result and display it in a table
        const array = JSON.parse(resultFromPython);
        displayArrayInTable(array);
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

    // Load the Python code when the page loads
    loadPythonCode();

    function loadPythonCode() {
        fetch('src/gsd.py')
        .then(response => response.text())
        .then(data => {
            document.getElementById('dynamic-python').textContent = data;
            // Delay Brython initialization
            setTimeout(() => {
                brython();
            }, 1000);
        })
        .catch(error => {
            console.error("Error loading Python code:", error);
        });
    }
    
});