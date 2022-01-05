class Commitment {
  static _status = {
    PENDING: "待定",
    FULFILLED: "成功",
    REJECTED: "失败",
  };
  constructor(func) {
    this.status = Commitment._status.PENDING;
    this.result = null;
    this.resolveCallbackStack = [];
    this.rejectCallbackStack = [];
    try {
      func(this.resolve.bind(this), this.reject.bind(this));
    } catch (err) {
      this.reject(err);
    }
  }

  resolve(result) {
    setTimeout(() => {
      if (this.status === Commitment._status.PENDING) {
        this.status = Commitment._status.FULFILLED;
        this.result = result;
        this.resolveCallbackStack.forEach((callback) => {
          callback(result);
        });
      }
    });
  }

  reject(result) {
    setTimeout(() => {
      if (this.status === Commitment._status.PENDING) {
        this.status = Commitment._status.REJECTED;
        this.result = result;
        this.rejectCallbackStack.forEach((callback) => {
          callback(result);
        });
      }
    });
  }

  then(onFULFILLED, onREJECTED) {
    return new Commitment((resolve, reject) => {
      onFULFILLED = typeof onFULFILLED === "function" ? onFULFILLED : () => {};
      onREJECTED = typeof onREJECTED === "function" ? onREJECTED : () => {};
      if (this.status === Commitment._status.PENDING) {
        this.resolveCallbackStack.push(onFULFILLED);
        this.rejectCallbackStack.push(onREJECTED);
      }
      if (this.status === Commitment._status.FULFILLED) {
        setTimeout(() => {
          onFULFILLED(this.result);
        });
      }
      if (this.status === Commitment._status.REJECTED) {
        setTimeout(() => {
          onREJECTED(this.result);
        });
      }
    });
  }
}

console.log(1);
let commitment = new Commitment((resolve, reject) => {
  console.log(2);
  console.log(commitment.status);
  setTimeout(() => {
    console.log(3);
    console.log(commitment.status);
    resolve("success");
    console.log(commitment.status);
    console.log(4);
  });
});

commitment
  .then((result) => {
    console.log(result);
  })
  .then((result) => {
    console.log(result);
  });

// console
// 1
// 2
// undefined
// 3
// 待定
// 待定
// 4
// success
