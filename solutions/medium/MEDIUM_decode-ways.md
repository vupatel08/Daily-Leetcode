# Decode Ways

**Difficulty:** Medium
**Tags:** String, Dynamic Programming

## Problem Description
<p>You have intercepted a secret message encoded as a string of numbers. The message is <strong>decoded</strong> via the following mapping:</p>

<p><code>&quot;1&quot; -&gt; &#39;A&#39;<br />
&quot;2&quot; -&gt; &#39;B&#39;<br />
...<br />
&quot;25&quot; -&gt; &#39;Y&#39;<br />
&quot;26&quot; -&gt; &#39;Z&#39;</code></p>

<p>However, while decoding the message, you realize that there are many different ways you can decode the message because some codes are contained in other codes (<code>&quot;2&quot;</code> and <code>&quot;5&quot;</code> vs <code>&quot;25&quot;</code>).</p>

<p>For example, <code>&quot;11106&quot;</code> can be decoded into:</p>

<ul>
	<li><code>&quot;AAJF&quot;</code> with the grouping <code>(1, 1, 10, 6)</code></li>
	<li><code>&quot;KJF&quot;</code> with the grouping <code>(11, 10, 6)</code></li>
	<li>The grouping <code>(1, 11, 06)</code> is invalid because <code>&quot;06&quot;</code> is not a valid code (only <code>&quot;6&quot;</code> is valid).</li>
</ul>

<p>Note: there may be strings that are impossible to decode.<br />
<br />
Given a string s containing only digits, return the <strong>number of ways</strong> to <strong>decode</strong> it. If the entire string cannot be decoded in any valid way, return <code>0</code>.</p>

<p>The test cases are generated so that the answer fits in a <strong>32-bit</strong> integer.</p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>

<div class="example-block">
<p><strong>Input:</strong> <span class="example-io">s = &quot;12&quot;</span></p>

<p><strong>Output:</strong> <span class="example-io">2</span></p>

<p><strong>Explanation:</strong></p>

<p>&quot;12&quot; could be decoded as &quot;AB&quot; (1 2) or &quot;L&quot; (12).</p>
</div>

<p><strong class="example">Example 2:</strong></p>

<div class="example-block">
<p><strong>Input:</strong> <span class="example-io">s = &quot;226&quot;</span></p>

<p><strong>Output:</strong> <span class="example-io">3</span></p>

<p><strong>Explanation:</strong></p>

<p>&quot;226&quot; could be decoded as &quot;BZ&quot; (2 26), &quot;VF&quot; (22 6), or &quot;BBF&quot; (2 2 6).</p>
</div>

<p><strong class="example">Example 3:</strong></p>

<div class="example-block">
<p><strong>Input:</strong> <span class="example-io">s = &quot;06&quot;</span></p>

<p><strong>Output:</strong> <span class="example-io">0</span></p>

<p><strong>Explanation:</strong></p>

<p>&quot;06&quot; cannot be mapped to &quot;F&quot; because of the leading zero (&quot;6&quot; is different from &quot;06&quot;). In this case, the string is not a valid encoding, so return 0.</p>
</div>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>1 &lt;= s.length &lt;= 100</code></li>
	<li><code>s</code> contains only digits and may contain leading zero(s).</li>
</ul>


## Example Test Cases
"12"
"226"
"06"

## Solution
### Approach Explanation

To solve the problem of decoding the string of numbers, we can use a dynamic programming approach. The idea is to maintain a list (or array) that keeps track of the number of ways to decode the string up to each index. 

1. **Initialization**: 
   - Create a list `dp` where `dp[i]` represents the number of ways to decode the substring `s[0:i]`.
   - Initialize `dp[0]` to 1, which represents the empty string (one way to decode nothing).
   - If the first character is not '0', initialize `dp[1]` to 1 (one way to decode a single valid character).

2. **Dynamic Programming Transition**:
   - For each character in the string starting from the second character:
     - If the current character (single digit) is between '1' and '9', it can be decoded as a valid letter. Thus, add `dp[i-1]` to `dp[i]`.
     - If the last two characters (two digits) form a valid number between '10' and '26', it can also be decoded as a valid letter. Thus, add `dp[i-2]` to `dp[i]`.

3. **Edge Cases**:
   - If the string starts with '0', it cannot be decoded, so return 0 immediately.
   - Handle cases where substrings like "06" are present, which are invalid.

### Python Solution

Here is the Python implementation of the above approach:

```python
def numDecodings(s: str) -> int:
    # Edge case: if the string is empty or starts with '0', return 0
    if not s or s[0] == '0':
        return 0
    
    # Length of the string
    n = len(s)
    
    # DP array to store the number of ways to decode up to each index
    dp = [0] * (n + 1)
    
    # Base case: there's one way to decode an empty string
    dp[0] = 1
    
    # Base case: if the first character is not '0', there's one way to decode it
    dp[1] = 1 if s[0] != '0' else 0
    
    # Fill the dp array
    for i in range(2, n + 1):
        # Check the last single digit
        single_digit = int(s[i-1:i])  # s[i-1] is the current character
        if 1 <= single_digit <= 9:
            dp[i] += dp[i-1]
        
        # Check the last two digits
        double_digit = int(s[i-2:i])  # s[i-2:i] is the last two characters
        if 10 <= double_digit <= 26:
            dp[i] += dp[i-2]
    
    # The answer is the number of ways to decode the entire string
    return dp[n]

# Example test cases
print(numDecodings("12"))   # Output: 2
print(numDecodings("226"))  # Output: 3
print(numDecodings("06"))   # Output: 0
```

### Time and Space Complexity Analysis

- **Time Complexity**: O(n), where n is the length of the string. We iterate through the string once to fill the `dp` array.
- **Space Complexity**: O(n), due to the `dp` array used to store the number of ways to decode substrings.

### Alternative Approaches

1. **Recursive Approach with Memoization**: You could also solve this problem using a recursive approach with memoization to avoid recalculating results for the same substring. However, this would still have a time complexity of O(n) but may have higher constant factors due to recursive calls.

2. **Iterative with Constant Space**: Instead of using an entire array for `dp`, you could optimize the space to O(1) by only keeping track of the last two results since each state only depends on the previous two states.

Here's a brief outline of the constant space approach:

```python
def numDecodings(s: str) -> int:
    if not s or s[0] == '0':
        return 0
    
    prev2, prev1 = 1, 1  # dp[0] and dp[1]
    
    for i in range(2, len(s) + 1):
        current = 0
        if 1 <= int(s[i-1:i]) <= 9:
            current += prev1
        if 10 <= int(s[i-2:i]) <= 26:
            current += prev2
        
        prev2, prev1 = prev1, current
    
    return prev1
```

This approach maintains only the last two computed values, thus reducing the space complexity to O(1).