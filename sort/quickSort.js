// 快速排序时间复杂度为O(nlogn)，是目前基于比较的内部排序中被认为最好的方法，当数据过大且数据杂乱无章时，则适合采用快速排序
function quickSort(arr) {
  if (arr.length <= 1) return arr

  const left = [],
    right = [],
    middle = arr[0]

  for (let i of arr) {
    if (i < middle) {
      left.push(i)
    } else if (i > middle) {
      right.push(i)
    }
  }

  return [...quickSort(left), middle, ...quickSort(right)]
}

const a = [6, 4, 70, 54, 12, 46]
console.log(quickSort(a))
