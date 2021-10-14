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
