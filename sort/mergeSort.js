// 合并排序

function mergeSort(arr) {
  const len = arr.length;

  if (len < 2) {
    return arr;
  }

  let middle = Math.floor(arr.length / 2),
    left = arr.slice(0, middle),
    right = arr.slice(middle);

  return merge(mergeSort(left), mergeSort(right));
}

function merge(left, right) {
  const result = [];

  while (left.length && right.length) {
    if (left[0] <= right[0]) {
      result.push(left.shift());
    } else {
      result.push(right.shift());
    }
  }

  while (left.length) {
    result.push(left.shift());
  }

  while (right.length) {
    result.push(right.shift());
  }

  return result;
}

const a = [2, 8, 10, 6, 43, 90, 52, 16, 27];
console.log(mergeSort(a));
