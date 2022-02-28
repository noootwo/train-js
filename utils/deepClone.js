function deepClone(target, map = new Map()) {

    // 获取类型
    const type = checkType(target)


    // 基本数据类型直接返回
    if (!canForArr.concat(noForArr).includes(type)) return target


    // 判断Function，RegExp，Symbol
  +  if (type === funcTag) return cloneFunction(target)
  +  if (type === regexpTag) return cloneReg(target)
  +  if (type === symbolTag) return cloneSymbol(target)

    // 引用数据类型特殊处理
    const temp = checkTemp(target)

    if (map.get(target)) {
        // 已存在则直接返回
        return map.get(target)
    }
    // 不存在则第一次设置
    map.set(target, temp)

    // 处理Map类型
    if (type === mapTag) {
        target.forEach((value, key) => {
            temp.set(key, deepClone(value, map))
        })

        return temp
    }

    // 处理Set类型
    if (type === setTag) {
        target.forEach(value => {
            temp.add(deepClone(value, map))
        })

        return temp
    }

    // 处理数据和对象
    for (const key in target) {
        // 递归
        temp[key] = deepClone(target[key], map)
    }
    return temp
}


const a = {
    name: 'sunshine_lin',
    age: 23,
    hobbies: { sports: '篮球', tv: '雍正王朝' },
    works: ['2020', '2021'],
    map: new Map([['haha', 111], ['xixi', 222]]),
    set: new Set([1, 2, 3]),
    func: (name, age) => `${name}今年${age}岁啦！！！`,
    sym: Symbol(123),
    reg: new RegExp(/haha/g),
}
a.key = a // 环引用

const b = deepClone(a)
console.log(b)
// {
//     name: 'sunshine_lin',
//     age: 23,
//     hobbies: { sports: '篮球', tv: '雍正王朝' },
//     works: [ '2020', '2021' ],
//     map: Map { 'haha' => 111, 'xixi' => 222 },
//     set: Set { 1, 2, 3 },
//     func: [Function],
//     sym: [Symbol: Symbol(123)],
//     reg: /haha/g,
//     key: [Circular]
// }
console.log(b === a) // false
