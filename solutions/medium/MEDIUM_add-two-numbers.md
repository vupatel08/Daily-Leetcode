# Add Two Numbers

**Difficulty:** Medium
**Tags:** Linked List, Math, Recursion

## Problem Description
<p>You are given two <strong>non-empty</strong> linked lists representing two non-negative integers. The digits are stored in <strong>reverse order</strong>, and each of their nodes contains a single digit. Add the two numbers and return the sum&nbsp;as a linked list.</p>

<p>You may assume the two numbers do not contain any leading zero, except the number 0 itself.</p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>
<img alt="" src="https://assets.leetcode.com/uploads/2020/10/02/addtwonumber1.jpg" style="width: 483px; height: 342px;" />
<pre>
<strong>Input:</strong> l1 = [2,4,3], l2 = [5,6,4]
<strong>Output:</strong> [7,0,8]
<strong>Explanation:</strong> 342 + 465 = 807.
</pre>

<p><strong class="example">Example 2:</strong></p>

<pre>
<strong>Input:</strong> l1 = [0], l2 = [0]
<strong>Output:</strong> [0]
</pre>

<p><strong class="example">Example 3:</strong></p>

<pre>
<strong>Input:</strong> l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
<strong>Output:</strong> [8,9,9,9,0,0,0,1]
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li>The number of nodes in each linked list is in the range <code>[1, 100]</code>.</li>
	<li><code>0 &lt;= Node.val &lt;= 9</code></li>
	<li>It is guaranteed that the list represents a number that does not have leading zeros.</li>
</ul>


## Example Test Cases
[2,4,3]
[5,6,4]
[0]
[0]
[9,9,9,9,9,9,9]
[9,9,9,9]

## Solution
### Approach Explanation

To solve the problem of adding two numbers represented by linked lists, we can simulate the addition process digit by digit, similar to how we would do it manually. Since the digits are stored in reverse order, we can start adding from the head of each list.

1. **Initialization**: We will create a new linked list to store the result. We will also maintain a variable to keep track of any carry that results from adding two digits.

2. **Iterate through the lists**: We will traverse both linked lists simultaneously. At each step:
   - Retrieve the current digits from both linked lists (if available).
   - Calculate the sum of the two digits along with any carry from the previous step.
   - Determine the new digit to be added to the result (sum % 10) and update the carry (sum // 10).
   - Move to the next nodes in both linked lists.

3. **Handle remaining carry**: After processing both linked lists, if there is any carry left, we need to add a new node with that carry.

4. **Return the result**: Finally, we will return the head of the new linked list that represents the sum.

### Python Solution

Here is the Python implementation of the above approach:

```python
# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:
        # Initialize a dummy node to help with result construction
        dummy_head = ListNode(0)
        current = dummy_head  # Pointer to build the new list
        carry = 0  # Initialize carry to 0
        
        # Loop until both lists are exhausted
        while l1 or l2 or carry:
            # Get the values from the current nodes, defaulting to 0 if None
            val1 = l1.val if l1 else 0
            val2 = l2.val if l2 else 0
            
            # Calculate the sum and the new carry
            total = val1 + val2 + carry
            carry = total // 10  # Update carry for the next iteration
            current.next = ListNode(total % 10)  # Create a new node with the digit
            
            # Move to the next nodes in the lists
            current = current.next
            if l1: l1 = l1.next
            if l2: l2 = l2.next
        
        # Return the next of dummy head which points to the actual start of the result list
        return dummy_head.next
```

### Time and Space Complexity Analysis

- **Time Complexity**: O(max(m, n)), where `m` and `n` are the lengths of the two linked lists. We traverse each list at most once.
  
- **Space Complexity**: O(max(m, n)), which is the space required for the new linked list that stores the result. We create a new node for each digit in the result.

### Alternative Approaches

1. **Recursive Approach**: We could also solve this problem using recursion. However, this approach may lead to stack overflow for very large lists due to Python's recursion limit. The iterative approach is generally preferred for this problem.

2. **Converting to Integers**: Another approach would be to convert the linked lists to integers, perform the addition, and convert the result back to a linked list. However, this approach is less efficient in terms of space and doesn't utilize the linked list structure effectively.

The iterative approach provided above is optimal for this problem and adheres to the constraints and requirements given.