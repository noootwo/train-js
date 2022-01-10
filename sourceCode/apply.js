let person = {
  name: "lalala",
};

function demo(a, b) {
  console.log(this.name);
  return {
    a,
    b,
  };
}

demo.apply(person, [1, 2]);

Function.prototype.newApply = function (newThis, arr) {
  var newThis = newThis || window,
    result;
  newThis.func = this;

  if (arr) {
    result = newThis.func(...arr);
  } else {
    result = newThis.func();
  }

  delete newThis.func;
  return result;
};

let a = demo.newApply(person, [1, 2]);

console.log(a);
