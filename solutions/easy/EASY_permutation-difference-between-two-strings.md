# Permutation Difference between Two Strings

**Difficulty:** Easy
**Tags:** Hash Table, String

## Problem Description
<p>You are given two strings <code>s</code> and <code>t</code> such that every character occurs at most once in <code>s</code> and <code>t</code> is a permutation of <code>s</code>.</p>

<p>The <strong>permutation difference</strong> between <code>s</code> and <code>t</code> is defined as the <strong>sum</strong> of the absolute difference between the index of the occurrence of each character in <code>s</code> and the index of the occurrence of the same character in <code>t</code>.</p>

<p>Return the <strong>permutation difference</strong> between <code>s</code> and <code>t</code>.</p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>

<div class="example-block">
<p><strong>Input:</strong> <span class="example-io">s = &quot;abc&quot;, t = &quot;bac&quot;</span></p>

<p><strong>Output:</strong> <span class="example-io">2</span></p>

<p><strong>Explanation:</strong></p>

<p>For <code>s = &quot;abc&quot;</code> and <code>t = &quot;bac&quot;</code>, the permutation difference of <code>s</code> and <code>t</code> is equal to the sum of:</p>

<ul>
	<li>The absolute difference between the index of the occurrence of <code>&quot;a&quot;</code> in <code>s</code> and the index of the occurrence of <code>&quot;a&quot;</code> in <code>t</code>.</li>
	<li>The absolute difference between the index of the occurrence of <code>&quot;b&quot;</code> in <code>s</code> and the index of the occurrence of <code>&quot;b&quot;</code> in <code>t</code>.</li>
	<li>The absolute difference between the index of the occurrence of <code>&quot;c&quot;</code> in <code>s</code> and the index of the occurrence of <code>&quot;c&quot;</code> in <code>t</code>.</li>
</ul>

<p>That is, the permutation difference between <code>s</code> and <code>t</code> is equal to <code>|0 - 1| + |1 - 0| + |2 - 2| = 2</code>.</p>
</div>

<p><strong class="example">Example 2:</strong></p>

<div class="example-block">
<p><strong>Input:</strong> <span class="example-io">s = &quot;abcde&quot;, t = &quot;edbac&quot;</span></p>

<p><strong>Output:</strong> <span class="example-io">12</span></p>

<p><strong>Explanation:</strong> The permutation difference between <code>s</code> and <code>t</code> is equal to <code>|0 - 3| + |1 - 2| + |2 - 4| + |3 - 1| + |4 - 0| = 12</code>.</p>
</div>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>1 &lt;= s.length &lt;= 26</code></li>
	<li>Each character occurs at most once in <code>s</code>.</li>
	<li><code>t</code> is a permutation of <code>s</code>.</li>
	<li><code>s</code> consists only of lowercase English letters.</li>
</ul>


## Example Test Cases
"abc"
"bac"
"abcde"
"edbac"

## Solution
### Approach Explanation

To solve the problem of calculating the permutation difference between two strings `s` and `t`, we can follow these steps:

1. **Index Mapping**: Create a mapping of each character to its index in string `s`. This will allow us to quickly look up the index of any character in `s`.
  
2. **Calculate Differences**: Iterate through each character in string `t`, using the index mapping from step 1 to find the corresponding index in `s`. For each character, compute the absolute difference between its index in `s` and its index in `t`.

3. **Sum the Differences**: Accumulate these absolute differences to get the final permutation difference.

### Python Solution

Here is the Python code implementing the above approach:

```python
def permutation_difference(s: str, t: str) -> int:
    # Step 1: Create a mapping of each character to its index in string s
    index_map = {char: idx for idx, char in enumerate(s)}
    
    # Step 2: Initialize a variable to accumulate the total difference
    total_difference = 0
    
    # Step 3: Iterate through each character in string t
    for idx, char in enumerate(t):
        # Get the index of the character in s using the index_map
        index_in_s = index_map[char]
        
        # Calculate the absolute difference and add it to the total
        total_difference += abs(index_in_s - idx)
    
    # Step 4: Return the total permutation difference
    return total_difference

# Example Test Cases
print(permutation_difference("abc", "bac"))    # Output: 2
print(permutation_difference("abcde", "edbac")) # Output: 12
```

### Time and Space Complexity Analysis

- **Time Complexity**: The time complexity of this solution is O(n), where n is the length of the string `s` (or `t`, since they are of equal length). This is because we create a mapping of indices in O(n) time and then iterate through `t` in O(n) time to compute the differences.

- **Space Complexity**: The space complexity is O(n) as well, due to the storage of the index mapping in a dictionary.

### Alternative Approaches

1. **Brute Force**: A naive approach would involve nested loops to compare each character in `s` with each character in `t`, but this would result in O(n^2) time complexity, which is inefficient for this problem.

2. **Using Lists**: Instead of a dictionary, we could use a list of size 26 (for each letter of the alphabet) to store the indices of characters in `s`. This would work as well but would require additional handling for character-to-index mapping.

The provided solution is efficient and straightforward, making it suitable for the constraints given in the problem.