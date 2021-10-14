// 和冒泡排序一致，相比其它排序算法，这也是一个相对较高的时间复杂度，一般情况不推荐使用

// 但是我们还是要掌握冒泡排序的思想及实现，这对于我们的算法思维是有很大帮助的
function selectSort(arr) {
  const len = arr.length
  if (len <= 1) return arr
  let minIndex, temp
  for (let i = 0; i < len - 1; i++) {
    minIndex = i
    for (let j = i + 1; j < len; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j
      }
    }

    temp = arr[i]
    arr[i] = arr[minIndex]
    arr[minIndex] = temp
  }

  return arr
}

const a = [6, 40, 12, 54, 76, 32, 10, 5, 26]

console.log(selectSort(a))
