# Method Chaining

**Difficulty:** Easy
**Tags:** 

## Problem Description
<pre>
DataFrame <code>animals</code>
+-------------+--------+
| Column Name | Type   |
+-------------+--------+
| name        | object |
| species     | object |
| age         | int    |
| weight      | int    |
+-------------+--------+
</pre>

<p>Write a solution to list the names of animals that weigh <strong>strictly more than</strong> <code>100</code> kilograms.</p>

<p>Return the&nbsp;animals sorted by weight in <strong>descending order</strong>.</p>

<p>The result format is in the following example.</p>

<p>&nbsp;</p>
<p><strong>Example 1:</strong></p>

<pre>
<strong>Input:</strong> 
DataFrame animals:
+----------+---------+-----+--------+
| name     | species | age | weight |
+----------+---------+-----+--------+
| Tatiana  | Snake   | 98  | 464    |
| Khaled   | Giraffe | 50  | 41     |
| Alex     | Leopard | 6   | 328    |
| Jonathan | Monkey  | 45  | 463    |
| Stefan   | Bear    | 100 | 50     |
| Tommy    | Panda   | 26  | 349    |
+----------+---------+-----+--------+
<strong>Output:</strong> 
+----------+
| name     |
+----------+
| Tatiana  |
| Jonathan |
| Tommy    |
| Alex     |
+----------+
<strong>Explanation:</strong> 
All animals weighing more than 100 should be included in the results table.
Tatiana&#39;s weight is 464, Jonathan&#39;s weight is 463, Tommy&#39;s weight is 349, and Alex&#39;s weight is 328.
The results should be sorted in descending order of weight.</pre>

<p>&nbsp;</p>
<p>In Pandas, <strong>method chaining</strong> enables us to&nbsp;perform operations on a DataFrame without breaking up each operation into a separate line or creating multiple temporary variables.&nbsp;</p>

<p>Can you complete this&nbsp;task in just <strong>one line </strong>of code using method chaining?</p>


## Example Test Cases
{"headers":{"animals":["name","species","age","weight"]},"rows":{"animals":[["Tatiana","Snake",98,464],["Khaled","Giraffe",50,41],["Alex","Leopard",6,328],["Jonathan","Monkey",45,463],["Stefan","Bear",100,50],["Tommy","Panda",26,349]]}}

## Solution
To solve the problem of filtering and sorting a DataFrame of animals based on their weight, we can utilize the Pandas library in Python. The goal is to list the names of animals that weigh strictly more than 100 kilograms and sort them in descending order by weight, all in one line of code using method chaining.

### Approach:

1. **Filtering**: We will filter the DataFrame to include only those rows where the `weight` column is greater than 100.
2. **Sorting**: After filtering, we will sort the resulting DataFrame by the `weight` column in descending order.
3. **Selecting Columns**: Finally, we will select only the `name` column from the sorted DataFrame.

Using method chaining allows us to perform all these operations in a single line without needing to create intermediate variables.

### Solution in Python:

```python
import pandas as pd

# Sample DataFrame creation
data = {
    'name': ['Tatiana', 'Khaled', 'Alex', 'Jonathan', 'Stefan', 'Tommy'],
    'species': ['Snake', 'Giraffe', 'Leopard', 'Monkey', 'Bear', 'Panda'],
    'age': [98, 50, 6, 45, 100, 26],
    'weight': [464, 41, 328, 463, 50, 349]
}

animals = pd.DataFrame(data)

# One-liner solution using method chaining
result = animals[animals['weight'] > 100].sort_values(by='weight', ascending=False)[['name']]

# Display the result
print(result)
```

### Explanation of the Code:

- We first import the Pandas library.
- We create a sample DataFrame `animals` with the provided data.
- The one-liner solution:
  - `animals['weight'] > 100`: This creates a boolean mask that filters the DataFrame to include only rows where the weight is greater than 100.
  - `.sort_values(by='weight', ascending=False)`: This sorts the filtered DataFrame by the `weight` column in descending order.
  - `[['name']]`: This selects only the `name` column from the sorted DataFrame.
- Finally, we print the result.

### Time and Space Complexity Analysis:

- **Time Complexity**: 
  - Filtering the DataFrame takes O(n), where n is the number of rows in the DataFrame.
  - Sorting the DataFrame takes O(n log n).
  - Selecting the column takes O(n).
  - Overall, the time complexity is O(n log n) due to the sorting step being the most time-consuming operation.

- **Space Complexity**: 
  - The space complexity is O(n) for storing the filtered and sorted DataFrame, where n is the number of rows that meet the filtering criteria.

### Alternative Approaches:

While the method chaining approach is efficient and concise, another approach could involve breaking down the operations into multiple lines for clarity, especially in a more complex scenario. However, for this specific problem, the one-liner is both elegant and effective.

In summary, the provided solution efficiently filters, sorts, and selects the desired data from the DataFrame using Pandas, demonstrating the power of method chaining.