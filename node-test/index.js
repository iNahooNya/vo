/**
 * @fileOverview
 * @author iNahoo
 * @since 2018/6/14.
 */
"use strict";

const {VO} = require("../build/index");

const M = VO.create({
    a: Number,
    b: String,
    c: [Number],
    d: {
        d1: Number,
        d2: String,
    }
});

const mock = {
    a: '123',
    b: '123',
    c: ['123', 123, 234],
    d: {
        d1: '123',
        d3: '123',
    },
    e: 123,
};


const M2 = M.transform(obj => {
    return {
        ...obj,
        x: obj.a + obj.d.d1,
    }
});

console.log(new M(mock));
console.log(new M2(mock));



