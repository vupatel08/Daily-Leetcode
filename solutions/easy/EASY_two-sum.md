# Two Sum

**Difficulty:** Easy
**Tags:** Array, Hash Table

## Problem Description
<p>Given an array of integers <code>nums</code>&nbsp;and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>

<p>You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p>

<p>You can return the answer in any order.</p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>

<pre>
<strong>Input:</strong> nums = [2,7,11,15], target = 9
<strong>Output:</strong> [0,1]
<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
</pre>

<p><strong class="example">Example 2:</strong></p>

<pre>
<strong>Input:</strong> nums = [3,2,4], target = 6
<strong>Output:</strong> [1,2]
</pre>

<p><strong class="example">Example 3:</strong></p>

<pre>
<strong>Input:</strong> nums = [3,3], target = 6
<strong>Output:</strong> [0,1]
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>
	<li><code>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code></li>
	<li><code>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code></li>
	<li><strong>Only one valid answer exists.</strong></li>
</ul>

<p>&nbsp;</p>
<strong>Follow-up:&nbsp;</strong>Can you come up with an algorithm that is less than <code>O(n<sup>2</sup>)</code><font face="monospace">&nbsp;</font>time complexity?

## Example Test Cases
[2,7,11,15]
9
[3,2,4]
6
[3,3]
6

## Solution
### Approach Explanation

To solve the "Two Sum" problem efficiently, we can use a hash table (or dictionary in Python) to keep track of the numbers we have seen so far and their corresponding indices. This allows us to check in constant time if the complement of the current number (i.e., `target - current_number`) exists in the hash table.

Here's the step-by-step breakdown of the approach:

1. **Initialize a Hash Table**: Create an empty dictionary to store numbers and their indices as we iterate through the list.
2. **Iterate through the List**: For each number in the list:
   - Calculate its complement (the number that, when added to the current number, equals the target).
   - Check if the complement exists in the hash table:
     - If it does, return the indices of the current number and its complement.
     - If it does not, store the current number and its index in the hash table.
3. **Return the Result**: Since the problem guarantees exactly one solution, we will always find the answer before finishing the loop.

### Python Solution

Here is the Python implementation of the above approach:

```python
def two_sum(nums, target):
    # Initialize a dictionary to store the numbers and their indices
    num_to_index = {}
    
    # Iterate through the list of numbers
    for index, num in enumerate(nums):
        # Calculate the complement of the current number
        complement = target - num
        
        # Check if the complement is already in the dictionary
        if complement in num_to_index:
            # If found, return the indices of the current number and the complement
            return [num_to_index[complement], index]
        
        # If not found, store the current number and its index in the dictionary
        num_to_index[num] = index
    
    # Since the problem guarantees one solution, we should not reach this point
    return []

# Example test cases
print(two_sum([2, 7, 11, 15], 9))  # Output: [0, 1]
print(two_sum([3, 2, 4], 6))       # Output: [1, 2]
print(two_sum([3, 3], 6))          # Output: [0, 1]
```

### Time and Space Complexity Analysis

- **Time Complexity**: O(n), where n is the number of elements in the `nums` array. We traverse the list once, and each lookup and insertion in the hash table takes O(1) time on average.
  
- **Space Complexity**: O(n) in the worst case, where we might store all n elements in the hash table if no two numbers add up to the target.

### Alternative Approaches

1. **Brute Force Approach**: A straightforward solution would be to use two nested loops to check all pairs of numbers. This would have a time complexity of O(n^2), which is inefficient for larger arrays.

2. **Sorting and Two Pointers**: Another approach could involve sorting the array and then using two pointers to find the two numbers. However, this would require O(n log n) time for sorting, which is worse than our hash table approach.

Given the constraints and the requirement for efficiency, the hash table method is the optimal solution for this problem.