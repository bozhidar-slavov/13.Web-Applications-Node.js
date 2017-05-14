/* globals module */
'use strict';

class Queue {
    constructor() {
        this.items = [];
    }

    push(item) {
        this.items.push(item);
    }

    pop(item) {
        return this.items.pop();
    }

    peek() {
        return this.items[this.items.length - 1];
    }

    isEmpty() {
        return this.lenght === 0;
    }

    get lenght() {
        return this.items.length;
    }
}

module.exports.getQueue = function() {
  return new Queue();
};