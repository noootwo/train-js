function quickSort(arr) {
  if (arr.length <= 1) return arr;

  const left = [],
    right = [],
    middle = arr[0];

  for (let i of arr) {
    if (i < middle) {
      left.push(i);
    } else if (i > middle) {
      right.push(i);
    }
  }

  return [...quickSort(left), middle, ...quickSort(right)];
}

const a = [6, 4, 70, 54, 12, 46];
console.log(quickSort(a));
