import pytest
import numpy as np

from src.taguchi import generate_taguchi_array

def test_output_shape():
    for num_cols in range(2, 10):  # Testing for 2 to 9 columns
        array = generate_taguchi_array(num_cols)
        assert array.shape[1] == num_cols
        assert np.log2(array.shape[0]) % 1 == 0  # Check if number of rows is a power of two

def test_orthogonality():
    for num_cols in range(2, 10):  # Testing for 2 to 9 columns
        array = generate_taguchi_array(num_cols)
        for i in range(num_cols):
            for j in range(i+1, num_cols):
                assert np.dot(array[:, i], array[:, j]) == 0

def test_two_level_design():
    for num_cols in range(2, 10):  # Testing for 2 to 9 columns
        array = generate_taguchi_array(num_cols)
        assert np.all((array == -1) | (array == 1))

def test_specific_sizes():
    sizes_to_test = [3, 4, 5, 7]
    for size in sizes_to_test:
        array = generate_taguchi_array(size)
        assert array.shape[1] == size
def test_extended_orthogonality():
    for num_cols in range(2, 16):  # Testing for 2 to 15 columns
        array = generate_taguchi_array(num_cols)
        for i in range(num_cols):
            for j in range(i+1, num_cols):
                assert np.dot(array[:, i], array[:, j]) == 0

def test_row_equality():
    for num_cols in range(2, 16):  # Testing for 2 to 15 columns
        array = generate_taguchi_array(num_cols)
        rows_set = set(tuple(row) for row in array)
        assert len(rows_set) == array.shape[0]

def test_level_balance():
    for num_cols in range(2, 16):  # Testing for 2 to 15 columns
        array = generate_taguchi_array(num_cols)
        for col in array.T:
            assert np.sum(col) == 0

def test_randomized_testing():
    for _ in range(50):  # 50 random tests
        num_cols = np.random.randint(2, 16)
        array = generate_taguchi_array(num_cols)
        # Check orthogonality for the generated array
        for i in range(num_cols):
            for j in range(i+1, num_cols):
                assert np.dot(array[:, i], array[:, j]) == 0
        # Check level balance for the generated array
        for col in array.T:
            assert np.sum(col) == 0

def test_interaction_depth():
    array = generate_taguchi_array(8)
    deep_interaction_col = array[:, 0] * array[:, 1] * array[:, 2] * array[:, 3]
    # Ensure deep interaction column is orthogonal to all other columns
    assert all([np.dot(deep_interaction_col, array[:, i]) == 0 for i in range(8)])
