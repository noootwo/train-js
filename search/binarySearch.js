// 二分查找法的O(logn)让它成为十分高效的算法。不过它的缺陷却也是比较明显，就在它的限定之上：

// 有序：我们很难保证我们的数组都是有序的
// 数组：数组读取效率是O(1)，可是它的插入和删除某个元素的效率却是O(n)，并且数组的存储是需要连续的内存空间，不适合大数据的情况
// 关于二分查找的应用场景，主要如下：

// 不适合数据量太小的数列；数列太小，直接顺序遍历说不定更快，也更简单
// 每次元素与元素的比较是比较耗时的，这个比较操作耗时占整个遍历算法时间的大部分，那么使用二分查找就能有效减少元素比较的次数
// 不适合数据量太大的数列，二分查找作用的数据结构是顺序表，也就是数组，数组是需要连续的内存空间的，系统并不一定有这么大的连续内存空间可以使用
function binarySearch(arr, target) {
  if (arr.length <= 1) return -1
  // 低位下标
  let lowIndex = 0
  // 高位下标
  let highIndex = arr.length - 1
  
  while (lowIndex <= highIndex) {
    // 中间下标
    const midIndex = Math.floor((lowIndex + highIndex) / 2)
    if (target < arr[midIndex]) {
      highIndex = midIndex - 1
    } else if (target > arr[midIndex]) {
      lowIndex = midIndex + 1
    } else {
      // 当 target 与 arr[midIndex] 相等的时候，如果 midIndex 为0或者前一个数比 target 小那么就找到了第一个等于给定值的元素，直接返回
      if (midIndex === 0 || arr[midIndex - 1] < target) return midIndex
      // 否则高位下标为中间下标减1，继续查找
      highIndex = midIndex - 1
    }
  }
  return -1
  
}

const a = [2,1,3]
console.log(binarySearch(a, 1))
