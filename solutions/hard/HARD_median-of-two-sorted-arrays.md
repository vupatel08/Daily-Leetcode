# Median of Two Sorted Arrays

**Difficulty:** Hard
**Tags:** Array, Binary Search, Divide and Conquer

## Problem Description
<p>Given two sorted arrays <code>nums1</code> and <code>nums2</code> of size <code>m</code> and <code>n</code> respectively, return <strong>the median</strong> of the two sorted arrays.</p>

<p>The overall run time complexity should be <code>O(log (m+n))</code>.</p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>

<pre>
<strong>Input:</strong> nums1 = [1,3], nums2 = [2]
<strong>Output:</strong> 2.00000
<strong>Explanation:</strong> merged array = [1,2,3] and median is 2.
</pre>

<p><strong class="example">Example 2:</strong></p>

<pre>
<strong>Input:</strong> nums1 = [1,2], nums2 = [3,4]
<strong>Output:</strong> 2.50000
<strong>Explanation:</strong> merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>nums1.length == m</code></li>
	<li><code>nums2.length == n</code></li>
	<li><code>0 &lt;= m &lt;= 1000</code></li>
	<li><code>0 &lt;= n &lt;= 1000</code></li>
	<li><code>1 &lt;= m + n &lt;= 2000</code></li>
	<li><code>-10<sup>6</sup> &lt;= nums1[i], nums2[i] &lt;= 10<sup>6</sup></code></li>
</ul>


## Example Test Cases
[1,3]
[2]
[1,2]
[3,4]

## Solution
To solve the problem of finding the median of two sorted arrays, we can utilize a binary search approach. This method is efficient and meets the requirement of O(log(min(m, n))) time complexity, where m and n are the sizes of the two arrays.

### Approach Explanation

1. **Understanding the Median**: The median is the middle value in a sorted list. If the total number of elements is odd, it's the middle element. If it's even, it's the average of the two middle elements.

2. **Binary Search**: We can perform a binary search on the smaller of the two arrays. This allows us to partition both arrays into two halves such that:
   - All elements in the left half are less than or equal to all elements in the right half.
   - The left half contains the first half of the combined elements, and the right half contains the second half.

3. **Partitioning Logic**:
   - We use two pointers to define the partitions in both arrays.
   - We calculate the partition indices based on the current mid-point of the binary search.
   - We check if the maximum of the left partition is less than or equal to the minimum of the right partition. If this condition holds, we have found the correct partitions.

4. **Calculating the Median**:
   - If the combined length of the arrays is even, the median is the average of the two middle values.
   - If the combined length is odd, the median is the maximum of the left partition.

### Python Solution

Here’s the implementation of the above approach:

```python
def findMedianSortedArrays(nums1, nums2):
    # Ensure nums1 is the smaller array
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    
    m, n = len(nums1), len(nums2)
    total = m + n
    half = total // 2
    
    left, right = 0, m
    
    while left <= right:
        partition1 = (left + right) // 2
        partition2 = half - partition1
        
        # If partition is at the edge of the array, use -inf or inf
        maxLeft1 = float('-inf') if partition1 == 0 else nums1[partition1 - 1]
        minRight1 = float('inf') if partition1 == m else nums1[partition1]
        
        maxLeft2 = float('-inf') if partition2 == 0 else nums2[partition2 - 1]
        minRight2 = float('inf') if partition2 == n else nums2[partition2]
        
        # Check if we have found the correct partitions
        if maxLeft1 <= minRight2 and maxLeft2 <= minRight1:
            # We have partitioned the arrays correctly
            if total % 2 == 0:
                return (max(maxLeft1, maxLeft2) + min(minRight1, minRight2)) / 2
            else:
                return max(maxLeft1, maxLeft2)
        elif maxLeft1 > minRight2:
            # We are too far on the right side for partition1. Go left.
            right = partition1 - 1
        else:
            # We are too far on the left side for partition1. Go right.
            left = partition1 + 1

# Example Test Cases
print(findMedianSortedArrays([1, 3], [2]))  # Output: 2.0
print(findMedianSortedArrays([1, 2], [3, 4]))  # Output: 2.5
```

### Time and Space Complexity Analysis

- **Time Complexity**: O(log(min(m, n))) because we are performing binary search on the smaller array.
- **Space Complexity**: O(1) since we are using a constant amount of space for variables.

### Alternative Approaches

1. **Merging the Arrays**: A straightforward approach is to merge the two arrays and then find the median. This would take O(m + n) time, which is not optimal for large arrays.

2. **Using Heaps**: Another approach could involve using two heaps (a max-heap for the lower half and a min-heap for the upper half) to maintain the median. However, this would also lead to a higher time complexity than the binary search method.

The binary search approach is the most efficient and elegant solution for this problem.