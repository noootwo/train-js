/*
 * @Description: 
 * @Date: 2021-11-08 11:44:10
 * @LastEditTime: 2021-11-08 16:02:38
 * @FilePath: \train-js\dataStructure\LinkArray.js
 */
function LinkNode(val) {
  this.val = val;
  this.next = null;
}

function LinkedList() {
  this.head = new LinkNode('head')
}

LinkedList.prototype.find = function (item){
  let currNode = this.head
  while(currNode.val != item){
    currNode = currNode.next
  }
  return currNode
}

LinkedList.prototype.insert = function (val, item){
  let newNode = new LinkNode(val)
  let currNode = this.find(item)
  newNode.next = currNode.next
  currNode.next = newNode
}

LinkedList.prototype.findPrev = function (item){
  let currNode = this.head
  while(currNode.next?.val != item){
    currNode = currNode.next
  }
  return currNode
}

LinkedList.prototype.remove = function(item){
  let prevNode = this.findPrev(item)
  let currNode = prevNode.next
  if (currNode) {
    prevNode.next = currNode.next
    currNode.next = null
  }
}

LinkedList.prototype.display = function (){
  let currNode = this.head
  let s = 'head'
  while(currNode.next){
    s = `${s} --> ${currNode.next.val}`
    currNode = currNode.next
  }
  console.log(s)
  return s
}

let LinkedList = new LinkedList()
LinkedList.insert(1, 'head')
LinkedList.insert(2, 1)
LinkedList.insert(3, 2)
LinkedList.insert(4, 3)
LinkedList.display()
LinkedList.remove(3)
LinkedList.display()
