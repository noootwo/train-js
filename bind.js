let person = {
  name: "lalala",
};

function demo(a) {
  console.log(this.name);
  return {
    a,
  };
}

demo.bind(person, [1, 2])();

Function.prototype.newBind = function (newThis) {
  var that = this,
    arr = Array.prototype.slice.call(arguments, 1);
  return function () {
    var arr2 = Array.prototype.slice.call(arguments),
      newArr = arr.concat(arr2);
    return that.apply(newThis, newArr);
  };
};

let a = demo.newBind(person, [1, 2])();

console.log(a);
