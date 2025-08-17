# Binary Tree Level Order Traversal II

**Difficulty:** Medium
**Tags:** Tree, Breadth-First Search, Binary Tree

## Problem Description
<p>Given the <code>root</code> of a binary tree, return <em>the bottom-up level order traversal of its nodes&#39; values</em>. (i.e., from left to right, level by level from leaf to root).</p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>
<img alt="" src="https://assets.leetcode.com/uploads/2021/02/19/tree1.jpg" style="width: 277px; height: 302px;" />
<pre>
<strong>Input:</strong> root = [3,9,20,null,null,15,7]
<strong>Output:</strong> [[15,7],[9,20],[3]]
</pre>

<p><strong class="example">Example 2:</strong></p>

<pre>
<strong>Input:</strong> root = [1]
<strong>Output:</strong> [[1]]
</pre>

<p><strong class="example">Example 3:</strong></p>

<pre>
<strong>Input:</strong> root = []
<strong>Output:</strong> []
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li>The number of nodes in the tree is in the range <code>[0, 2000]</code>.</li>
	<li><code>-1000 &lt;= Node.val &lt;= 1000</code></li>
</ul>


## Example Test Cases
[3,9,20,null,null,15,7]
[1]
[]

## Solution
### Approach Explanation

To solve the problem of bottom-up level order traversal of a binary tree, we can use a breadth-first search (BFS) approach. The BFS will allow us to traverse the tree level by level. However, since we need the results in reverse order (from leaves to root), we can either:

1. Use a queue to perform the BFS and then reverse the result at the end.
2. Use a stack to store the levels as we traverse, which will naturally give us the bottom-up order.

In this solution, we will use the first approach (BFS with a queue), where we will collect the values level by level and then reverse the collected list before returning it.

### Python Solution

Here is the Python code implementing the BFS approach:

```python
from collections import deque
from typing import List, Optional

# Definition for a binary tree node.
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def levelOrderBottom(root: Optional[TreeNode]) -> List[List[int]]:
    # If the root is None, return an empty list
    if not root:
        return []
    
    # Initialize a queue for BFS
    queue = deque([root])
    result = []
    
    # Perform BFS
    while queue:
        level_size = len(queue)  # Number of nodes at the current level
        current_level = []  # List to store values of the current level
        
        for _ in range(level_size):
            node = queue.popleft()  # Get the front node in the queue
            current_level.append(node.val)  # Add its value to the current level
            
            # Add children to the queue for the next level
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        
        # Insert the current level at the beginning of the result list
        result.insert(0, current_level)
    
    return result
```

### Explanation of the Code

1. **TreeNode Class**: We define a simple `TreeNode` class to represent each node in the binary tree.
2. **Function Definition**: The `levelOrderBottom` function takes the root of the binary tree as input.
3. **Edge Case**: If the root is `None`, we return an empty list.
4. **Queue Initialization**: We use a deque (double-ended queue) to facilitate efficient popping from the front.
5. **BFS Loop**: We loop until the queue is empty:
   - Determine the number of nodes at the current level.
   - For each node at this level, we:
     - Dequeue it, add its value to the current level list, and enqueue its children (if they exist).
   - After processing all nodes at the current level, we insert the current level list at the beginning of the result list to maintain the bottom-up order.
6. **Return Result**: Finally, we return the result list.

### Time and Space Complexity Analysis

- **Time Complexity**: O(N), where N is the number of nodes in the tree. Each node is processed exactly once.
- **Space Complexity**: O(N) in the worst case, where the last level of the tree has the maximum number of nodes (i.e., a complete binary tree). The queue can hold up to N nodes in the worst case.

### Alternative Approaches

1. **DFS Approach**: We could also use a depth-first search (DFS) to traverse the tree and collect values in a post-order manner (left-right-root). After collecting the values, we would need to reverse the list before returning it. However, this approach is less intuitive for level order traversal compared to BFS.

2. **Using a Stack**: Instead of reversing the result list at the end, we could push each level onto a stack during the BFS traversal and then pop them off to get the bottom-up order. This would also maintain O(N) time complexity but would require additional space for the stack. 

Both approaches are valid, but the BFS method with a queue is generally more straightforward for level order traversal problems.