import pytest
import numpy as np

# Assuming the gsd function and its helper functions are imported from a module named 'gsd_module'
from src.gsd import (
    gsd,
    _make_partitions,
    _make_orthogonal_arrays,
    _make_latin_square,
    _map_partitions_to_design,
)

def test_gsd_basic():
    levels = [2, 3]
    reduction = 2
    result = gsd(levels, reduction)
    assert isinstance(result, np.ndarray)
    assert result.shape[1] == len(levels)

def test_gsd_invalid_levels():
    with pytest.raises(ValueError):
        gsd([2.5, 3], 2)

def test_gsd_invalid_reduction():
    with pytest.raises(ValueError):
        gsd([2, 3], 0)

def test_gsd_invalid_n():
    with pytest.raises(ValueError):
        gsd([2, 3], 2, n=0)

def test_make_partitions():
    result = _make_partitions([2, 3], 2)
    assert len(result) == 2
    assert all(isinstance(part, list) for part in result)

def test_make_latin_square():
    result = _make_latin_square(3)
    assert result.shape == (3, 3)

def test_make_orthogonal_arrays():
    latin_square = _make_latin_square(3)
    result = _make_orthogonal_arrays(latin_square, 3)
    assert len(result) == 3
    assert all(mat.shape[1] == 3 for mat in result)

def test_map_partitions_to_design():
    partitions = _make_partitions([2, 3], 2)
    orthogonal_array = _make_orthogonal_arrays(_make_latin_square(2), 2)[0]
    result = _map_partitions_to_design(partitions, orthogonal_array)
    assert isinstance(result, np.ndarray)
    assert result.shape[1] == 2
