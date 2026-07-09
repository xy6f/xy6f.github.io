---
title: 分治法
lang: zh-CN
category:
  - 算法
tag:
  - 分治法
  - 排序
date: 2026-07-09
---

# 分治法 (Divide and Conquer)

## 什么是分治法

分治法是一种算法设计策略，其核心思想是：

1. **分解 (Divide)**：将原问题分解为若干个规模较小的子问题
2. **解决 (Conquer)**：递归地解决各个子问题
3. **合并 (Combine)**：将子问题的解合并为原问题的解

## 经典应用

### 归并排序

归并排序是分治法的经典应用：

```javascript
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}
```

### 快速排序

另一个分治法的经典例子：

```javascript
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[0];
  const left = [];
  const right = [];
  
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  
  return [...quickSort(left), pivot, ...quickSort(right)];
}
```

## 时间复杂度分析

| 算法 | 最好 | 平均 | 最坏 |
|------|------|------|------|
| 归并排序 | O(n log n) | O(n log n) | O(n log n) |
| 快速排序 | O(n log n) | O(n log n) | O(n²) |

## 总结

分治法是一种非常重要的算法思想，掌握它对于解决复杂问题非常有帮助。
