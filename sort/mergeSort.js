// 在外排序中通常使用排序-归并的策略，外排序是指处理超过内存限度的数据的排序算法，通常将中间结果放在读写较慢的外存储器，如下分成两个阶段：

// 排序阶段：读入能够放进内存中的数据量，将其排序输出到临时文件，一次进行，将带排序数据组织为多个有序的临时文件
// 归并阶段：将这些临时文件组合为大的有序文件
// 例如，使用100m内存对900m的数据进行排序，过程如下：

// 读入100m数据内存，用常规方式排序
// 将排序后的数据写入磁盘
// 重复前两个步骤，得到9个100m的临时文件
// 将100m的内存划分为10份，将9份为输入缓冲区，第10份为输出缓冲区
// 进行九路归并排序，将结果输出到缓冲区
// 若输出缓冲区满，将数据写到目标文件，清空缓冲区
// 若缓冲区空，读入相应文件的下一份数据

function mergeSort(arr) {
  const len = arr.length

  if (len < 2) {
    return arr
  }

  let middle = Math.floor(arr.length / 2),
    left = arr.slice(0, middle),
    right = arr.slice(middle)

  return merge(mergeSort(left), mergeSort(right))
}

function merge(left, right) {
  const result = []

  while (left.length && right.length) {
    if (left[0] <= right[0]) {
      result.push(left.shift())
    } else {
      result.push(right.shift())
    }
  }

  while (left.length) {
    result.push(left.shift())
  }

  while (right.length) {
    result.push(right.shift())
  }

  return result
}

const a = [2, 8, 10, 6, 43, 90, 52, 16, 27]
console.log(mergeSort(a))
