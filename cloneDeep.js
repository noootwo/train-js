// 普通递归函数
function deepCopy(source) {
  if (!isObject(source)) return source; //如果不是对象的话直接返回
  let target = Array.isArray(source) ? [] : {}; //数组兼容
  for (var k in source) {
    if (source.hasOwnProperty(k)) {
      if (typeof source[k] === "object") {
        target[k] = deepCopy(source[k]);
      } else {
        target[k] = source[k];
      }
    }
  }
  return target;
}

function isObject(obj) {
  return typeof obj === "object" && obj !== null;
}

// 缺点：

// （1）无法保持引用

// （2）当数据的层次很深，会栈溢出

// 3.防栈溢出函数
function cloneLoop(x) {
  const root = {};

  // 栈
  const loopList = [
    {
      parent: root,
      key: undefined,
      data: x,
    },
  ];

  while (loopList.length) {
    // 深度优先
    const node = loopList.pop();
    const parent = node.parent;
    const key = node.key;
    const data = node.data;

    // 初始化赋值目标，key为undefined则拷贝到父元素，否则拷贝到子元素
    let res = parent;
    if (typeof key !== "undefined") {
      res = parent[key] = {};
    }

    for (let k in data) {
      if (data.hasOwnProperty(k)) {
        if (typeof data[k] === "object") {
          // 下一次循环
          loopList.push({
            parent: res,
            key: k,
            data: data[k],
          });
        } else {
          res[k] = data[k];
        }
      }
    }
  }

  return root;
}

// 优点：

// （1）不会栈溢出

// （2）支持很多层级的数据

function copyObject(orig) {
  var copy = Object.create(Object.getPrototypeOf(orig));
  copyOwnPropertiesFrom(copy, orig);
  return copy;
}

function copyOwnPropertiesFrom(target, source) {
  Object.getOwnPropertyNames(source).forEach(function (propKey) {
    var desc = Object.getOwnPropertyDescriptor(source, propKey);
    Object.defineProperty(target, propKey, desc);
  });
  return target;
}

var obj = {
  name: "Jack",
  age: "32",
  job: "developer",
};

var obj2 = copyObject(obj);
console.log(obj2);
obj.age = 39;
obj.name = "Tom";
console.log(obj);
console.log(obj2);
