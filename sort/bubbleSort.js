function bubbleSort(arr) {
  const len = arr.length
  for (let i = 0; i < len - 1; i++) {
    for (let j = 0; j < len - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp
      }
    }
  }

  return arr
}

function betterBubbleSort(arr) {
  let len = arr.length - 1
  while (len > 0) {
    let pos = 0
    for (let j = 0; j < len; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp
        pos = j
      }
    }
    len = pos
  }

  return arr
}

const a = [68, 1, 57, 18, 24, 9, 37, 2]

console.log(bubbleSort(a))
console.log(betterBubbleSort(a))
