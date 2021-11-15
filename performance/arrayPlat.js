function* arrayPlatByGenerator(arr) {
  if (Array.isArray(arr)) {
    for(let item of arr) {
      yield* arrayPlat(item)
    }
  } else {
    yield arr
  }
}

console.log([...arrayPlatByGenerator([1, [2, [3, 4]]])])


