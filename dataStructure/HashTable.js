// HashTable
class HashTable {
  constructor() {
    this.storage = [];
    this.length = 0;
    this.limit = 7;
  }

  // calculate the hashCode with the hash function
  hashFunc(str, size) {
    let hashCode = 0;

    //? Horner Rule, get the value of hashCode
    for (let i = 0; i < str.length; i++) {
      // hash function
      hashCode = 37 * hashCode + str.charCodeAt(i);
    }

    let index = hashCode % size;
    return index;
  }

  // determine whether it is a prime number
  isPrime(num) {
    let temp = parseInt(Math.sqrt(num));
    for (let i = 2; i <= temp; i++) {
      if (!(num % i)) {
        return false;
      }
    }
    return true;
  }

  // get the closest prime number
  getPrime(num) {
    let newPrime = num;
    while (!this.isPrime(newPrime)) {
      newPrime++;
    }
    return newPrime;
  }

  // change limit to ensure efficiency
  resize(newLimit) {
    // save the original content
    const oldStorage = this.storage;

    // reset all the properties
    this.storage = [];
    this.length = 0;
    this.limit = newLimit;

    // traverse all buckets
    for (const bucket of oldStorage) {
      if (!bucket) {
        continue;
      }

      // get data and insert again
      for (const tuple of bucket) {
        this.put(tuple[0], tuple[1]);
      }
    }
  }

  // insert & modify
  put(key, value) {
    // get index
    let index = this.hashFunc(key, this.limit);

    // get bucket
    this.storage[index] = this.storage[index] || [];
    const bucket = this.storage[index];

    for (const tuple of bucket) {
      if (tuple[0] === key) {
        tuple[1] = value;
        return;
      }
    }

    // insert data
    bucket.push([key, value]);

    // update length
    this.length++;

    // judge whether to expand length
    if (this.length > this.limit * 0.75) {
      let newPrime = this.getPrime(this.limit * 2);
      this.resize(newPrime);
    }
  }

  // get data
  get(key) {
    let index = this.hashFunc(key, this.limit);
    const bucket = this.storage[index];
    if (!bucket) {
      return null;
    }

    // find the key
    for (const tuple of bucket) {
      if (tuple[0] === key) {
        return tuple[1];
      }
    }

    return null;
  }

  // remove data
  remove(key) {
    let index = this.hashFunc(key, this.limit);

    const bucket = this.storage[index];
    if (!bucket) {
      return false;
    }

    for (let i = 0; i < bucket.length; i++) {
      const tuple = bucket[i];
      if (tuple[0] === key) {
        bucket.splice(i, 1);
        this.length--;

        // judge whether to reduce length
        if (this.limit > 7 && this.length < this.limit * 0.25) {
          let newPrime = this.getPrime(Math.floor(this.limit / 2));
          this.resize(newPrime);
        }

        return true;
      }
    }

    return false;
  }
  isEmpty() {
    return !this.length;
  }
  size() {
    return this.length;
  }
}

// test
const ht = new HashTable();

ht.put('abc', 8);
ht.put('bcd', 18);
ht.put('cde', 28);
ht.put('def', 38);
ht.put('efg', 48);
ht.put('fgh', 58);
ht.put('ghi', 68);
ht.put('hij', 78);
ht.put('ijk', 88);
ht.put('jkl', 98);

console.log(ht.get('abc'));
console.log(ht.get('bcd'));
console.log(ht.get('cde'));
console.log(ht.get('def'));
console.log(ht.get('efg'));
console.log(ht.get('fgh'));
console.log(ht.get('ghi'));
console.log(ht.get('hij'));
console.log(ht.get('ijk'));
console.log(ht.get('jkl'));

console.log(ht.get('aaa'));
console.log(ht.get('bbb'));
console.log(ht.get('ccc'));
console.log(ht.get('ddd'));
console.log(ht.get('eee'));
console.log(ht.get('fff'));
