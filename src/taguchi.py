import numpy as np

def generate_taguchi_array(num_cols):
    """
    Generate a Taguchi array with two-level design for a specified number of columns.
    
    Parameters:
    - num_cols: Number of columns (factors) desired in the array.
    
    Returns:
    - A Taguchi orthogonal array with the specified number of columns.
    """
    
    # Determine the base array size required
    base_array_size = 2**np.ceil(np.log2(num_cols + 1))
    
    # Initialize the base array
    base_array = np.array([[-1 if (i // (2**j)) % 2 == 0 else 1 for j in range(int(np.log2(base_array_size)))] for i in range(int(base_array_size))])
    
    # If the number of columns is more than the base array size minus one, generate new columns
    while base_array.shape[1] < num_cols:
        for i in range(base_array.shape[1]):
            for j in range(i+1, base_array.shape[1]):
                new_col = base_array[:, i] * base_array[:, j]
                
                # Check if new column is orthogonal to all existing columns
                orthogonal = all([np.dot(new_col, base_array[:, k]) == 0 for k in range(base_array.shape[1])])
                
                if orthogonal:
                    base_array = np.hstack((base_array, new_col.reshape(-1, 1)))
                    if base_array.shape[1] == num_cols:
                        break
            if base_array.shape[1] == num_cols:
                break
                
    return base_array
