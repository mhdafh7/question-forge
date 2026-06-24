# Question Pools

This directory contains the question pools used in the application. Question pools are stored as JSON files and are imported dynamically to configure mock interviews.

---

## How to Add or Customize a Question Pool

To add a new pool of questions to the application, follow these three steps:

### Step 1: Create the JSON File
Create a new `.json` file in this directory (e.g., `src/data/pools/my-custom-pool.json`). The file must contain an array of objects matching the following structure:

```json
[
  {
    "id": "two-sum",
    "title": "Two Sum",
    "url": "https://leetcode.com/problems/two-sum/",
    "difficulty": "Easy",
    "categories": ["Array", "Hash Table"]
  },
  {
    "id": "add-two-numbers",
    "title": "Add Two Numbers",
    "url": "https://leetcode.com/problems/add-two-numbers/",
    "difficulty": "Medium",
    "categories": ["Linked List", "Math"]
  }
]
```

#### Fields Description:
- **`id`** (`string`): A unique identifier for the question (usually kebab-case of the title).
- **`title`** (`string`): The display title of the question.
- **`url`** (`string`): The URL link to the problem (e.g., LeetCode).
- **`difficulty`** (`"Easy" | "Medium" | "Hard"`): The difficulty level.
- **`categories`** (`string[]`): An array of category/topic tags (e.g., `"Array"`, `"Dynamic Programming"`, `"String"`).

---

### Step 2: Import the JSON File
Open [questions.ts](file:///home/bread/Code/question-forge/src/lib/questions.ts) and import your newly created JSON file at the top of the file:

```typescript
import myCustomPool from "../data/pools/my-custom-pool.json";
```

---

### Step 3: Register the Pool in `POOLS`
In [questions.ts](file:///home/bread/Code/question-forge/src/lib/questions.ts), locate the `POOLS` constant and add your new pool to the dictionary:

```typescript
export const POOLS: Record<string, Pool> = {
  blind75: {
    name: "Blind 75",
    data: blind75 as Question[],
  },
  neetcode150: {
    name: "NeetCode 150",
    data: neetcode150 as Question[],
  },
  // Add your pool here:
  myCustomPoolKey: {
    name: "My Custom Pool",
    data: myCustomPool as Question[],
  },
};
```

Once registered:
1. The new pool will automatically appear as an option in the **Configure Interview** dropdown on the Dashboard.
2. The list of categories on the Dashboard will automatically update to include any new categories added by your custom pool.
