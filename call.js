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

demo.call(person);

Function.prototype.newCall = function (newThis) {
  var newThis = newThis || window;
  newThis.func = this;

  let newArguments = [];
  for (let i = 1; i < arguments.length; i++) {
    newArguments.push(arguments[i]);
  }

  let result = newThis.func(...newArguments);
  delete newThis.func;
  return result;
};

let a = demo.newCall(person, 1, 2);

console.log(a);
