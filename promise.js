class Commitment {
  static _status = {
    PENDING: "待定",
    FULFILLED: "成功",
    REJECTED: "失败",
  };
  constructor(func) {
    this.state = Commitment._status.PENDING;
    this.result = null;
    this.fulfilledStack = [];
    this.rejectedStack = [];
    func(this.resolve.bind(this), this.reject.bind(this));
  }

  resolve(result) {
    setTimeout(() => {
      if (this.status === Commitment._status.PENDING) {
        this.status = Commitment._status.FULFILLED;
        this.result = result;
        this.fulfilledStack.forEach((callback) => {
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
        this.rejectedStack.forEach((callback) => {
          callback(result);
        });
      }
    });
  }

  then(onFULFILLED, onREJECTED) {
    return new Commitment((reolve, reject) => {
      onFULFILLED = typeof onFULFILLED === "function" ? onFULFILLED : () => {};
      onREJECTED = typeof onREJECTED === "function" ? onREJECTED : () => {};
      if (this.status === Commitment._status.PENDING) {
        this.fulfilledStack.push(onFULFILLED);
        this.rejectedStack.push(onREJECTED);
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
