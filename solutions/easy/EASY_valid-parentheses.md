# Valid Parentheses

**Difficulty:** Easy
**Tags:** String, Stack

## Problem Description
<p>Given a string <code>s</code> containing just the characters <code>&#39;(&#39;</code>, <code>&#39;)&#39;</code>, <code>&#39;{&#39;</code>, <code>&#39;}&#39;</code>, <code>&#39;[&#39;</code> and <code>&#39;]&#39;</code>, determine if the input string is valid.</p>

<p>An input string is valid if:</p>

<ol>
	<li>Open brackets must be closed by the same type of brackets.</li>
	<li>Open brackets must be closed in the correct order.</li>
	<li>Every close bracket has a corresponding open bracket of the same type.</li>
</ol>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>

<div class="example-block">
<p><strong>Input:</strong> <span class="example-io">s = &quot;()&quot;</span></p>

<p><strong>Output:</strong> <span class="example-io">true</span></p>
</div>

<p><strong class="example">Example 2:</strong></p>

<div class="example-block">
<p><strong>Input:</strong> <span class="example-io">s = &quot;()[]{}&quot;</span></p>

<p><strong>Output:</strong> <span class="example-io">true</span></p>
</div>

<p><strong class="example">Example 3:</strong></p>

<div class="example-block">
<p><strong>Input:</strong> <span class="example-io">s = &quot;(]&quot;</span></p>

<p><strong>Output:</strong> <span class="example-io">false</span></p>
</div>

<p><strong class="example">Example 4:</strong></p>

<div class="example-block">
<p><strong>Input:</strong> <span class="example-io">s = &quot;([])&quot;</span></p>

<p><strong>Output:</strong> <span class="example-io">true</span></p>
</div>

<p><strong class="example">Example 5:</strong></p>

<div class="example-block">
<p><strong>Input:</strong> <span class="example-io">s = &quot;([)]&quot;</span></p>

<p><strong>Output:</strong> <span class="example-io">false</span></p>
</div>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>1 &lt;= s.length &lt;= 10<sup>4</sup></code></li>
	<li><code>s</code> consists of parentheses only <code>&#39;()[]{}&#39;</code>.</li>
</ul>


## Example Test Cases
"()"
"()[]{}"
"(]"
"([])"
"([)]"

## Solution
### Approach Explanation

To determine if the input string of parentheses is valid, we can use a stack data structure. The stack allows us to keep track of the opening brackets as we encounter them in the string. When we encounter a closing bracket, we check if it matches the most recent opening bracket (the one on top of the stack). If it matches, we pop the opening bracket from the stack; if it doesn't match or if the stack is empty when we encounter a closing bracket, the string is invalid.

The steps are as follows:
1. Initialize an empty stack.
2. Create a mapping of closing brackets to their corresponding opening brackets for easy lookup.
3. Iterate through each character in the string:
   - If it's an opening bracket, push it onto the stack.
   - If it's a closing bracket, check if the stack is not empty and if the top of the stack matches the corresponding opening bracket. If it matches, pop the stack; otherwise, return false.
4. After processing all characters, if the stack is empty, the string is valid; otherwise, it's invalid.

### Python Solution

Here's the implementation of the above approach in Python:

```python
def isValid(s: str) -> bool:
    # Mapping of closing brackets to their corresponding opening brackets
    bracket_map = {')': '(', '}': '{', ']': '['}
    # Stack to keep track of opening brackets
    stack = []
    
    # Iterate through each character in the string
    for char in s:
        # If the character is a closing bracket
        if char in bracket_map:
            # Pop the topmost element from the stack if it's not empty; otherwise, assign a dummy value
            top_element = stack.pop() if stack else '#'
            # Check if the popped element matches the corresponding opening bracket
            if bracket_map[char] != top_element:
                return False  # Mismatch found
        else:
            # If it's an opening bracket, push onto the stack
            stack.append(char)
    
    # If the stack is empty, all brackets were matched correctly
    return not stack
```

### Time and Space Complexity Analysis

- **Time Complexity:** O(n), where n is the length of the string. We traverse the string once, and each operation (push/pop) on the stack takes O(1) time.
- **Space Complexity:** O(n) in the worst case, where all characters are opening brackets. The stack will store all of them.

### Alternative Approaches

1. **Counter Approach:** Instead of using a stack, we could use counters for each type of bracket. This approach would be less efficient for checking the order of brackets but could work for simple cases where only the counts of brackets are needed.
2. **Recursive Approach:** We could also use recursion to match brackets, but this would be less efficient and more complex than using a stack.

The stack-based approach is optimal for this problem due to its simplicity and efficiency in handling the order of brackets.