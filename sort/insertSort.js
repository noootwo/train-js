// 插入排序时间复杂度是 O(n2)，适用于数据量不大，算法稳定性要求高，且数据局部或整体有序的数列排序
function insertSort(arr) {
  const len = arr.length
  if (len <= 1) return arr
  let preIndex, current
  for (let i = 1; i < len; i++) {
    preIndex = i - 1
    current = arr[i]
    while (preIndex >= 0 && arr[preIndex] > current) {
      arr[preIndex + 1] = arr[preIndex]
      preIndex--
    }
    arr[preIndex + 1] = current
  }
  return arr
}

const a = [6, 40, 12, 54, 76, 32, 10, 5, 26]

console.log(insertSort(a))
