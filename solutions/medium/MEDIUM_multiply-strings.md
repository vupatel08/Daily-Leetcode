# Multiply Strings

**Difficulty:** Medium
**Tags:** Math, String, Simulation

## Problem Description
<p>Given two non-negative integers <code>num1</code> and <code>num2</code> represented as strings, return the product of <code>num1</code> and <code>num2</code>, also represented as a string.</p>

<p><strong>Note:</strong>&nbsp;You must not use any built-in BigInteger library or convert the inputs to integer directly.</p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>
<pre><strong>Input:</strong> num1 = "2", num2 = "3"
<strong>Output:</strong> "6"
</pre><p><strong class="example">Example 2:</strong></p>
<pre><strong>Input:</strong> num1 = "123", num2 = "456"
<strong>Output:</strong> "56088"
</pre>
<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>1 &lt;= num1.length, num2.length &lt;= 200</code></li>
	<li><code>num1</code> and <code>num2</code> consist of digits only.</li>
	<li>Both <code>num1</code> and <code>num2</code>&nbsp;do not contain any leading zero, except the number <code>0</code> itself.</li>
</ul>


## Example Test Cases
"2"
"3"
"123"
"456"

## Solution
To solve the problem of multiplying two non-negative integers represented as strings without converting them to integers directly, we can simulate the multiplication process similar to how we do it manually.

### Approach:
1. **Initialization**: We will create an array to hold the results of the multiplication. The maximum possible length of the result of multiplying two numbers with lengths `m` and `n` is `m + n`.
  
2. **Multiplication**: We will iterate through each digit of `num1` and `num2` from the least significant digit to the most significant digit (right to left). For each pair of digits, we multiply them and add the result to the appropriate position in our result array.

3. **Carry Handling**: While adding the products to the result array, we need to handle any carry that arises from the addition. If the value at any position exceeds 9, we carry over the excess to the next position.

4. **Result Construction**: After processing all digits, we will convert the result array back to a string, skipping any leading zeros.

5. **Edge Cases**: If either number is "0", the result should be "0".

### Python Solution:
Here’s the implementation of the above approach:

```python
def multiply(num1: str, num2: str) -> str:
    # Edge case: if either number is "0", return "0"
    if num1 == "0" or num2 == "0":
        return "0"
    
    # Lengths of the input strings
    m, n = len(num1), len(num2)
    
    # Result can be at most m + n digits
    result = [0] * (m + n)
    
    # Reverse iterate through num1 and num2
    for i in range(m - 1, -1, -1):
        for j in range(n - 1, -1, -1):
            # Multiply the current digits
            mul = (ord(num1[i]) - ord('0')) * (ord(num2[j]) - ord('0'))
            # Position in the result array
            p1, p2 = i + j, i + j + 1
            
            # Add the multiplication result to the current position
            total = mul + result[p2]
            
            # Update the result array
            result[p2] = total % 10  # Current digit
            result[p1] += total // 10  # Carry to the next position
    
    # Convert result array to string, skipping leading zeros
    result_str = ''.join(map(str, result)).lstrip('0')
    
    return result_str

# Example Test Cases
print(multiply("2", "3"))      # Output: "6"
print(multiply("123", "456"))  # Output: "56088"
```

### Time and Space Complexity Analysis:
- **Time Complexity**: The time complexity is O(m * n), where `m` is the length of `num1` and `n` is the length of `num2`. This is because we are performing a nested loop to multiply each digit of `num1` with each digit of `num2`.
  
- **Space Complexity**: The space complexity is O(m + n) for the result array that stores the intermediate results of the multiplication.

### Alternative Approaches:
1. **Using Python's Built-in Functions**: If allowed, we could convert the strings to integers using `int()` and then multiply them directly, but this violates the problem's constraints.
  
2. **Karatsuba Algorithm**: For very large numbers, a more efficient multiplication algorithm like Karatsuba could be used, but it is more complex and may not be necessary given the constraints of this problem.

This solution is efficient and adheres to the problem constraints while providing a clear and understandable approach to string multiplication.