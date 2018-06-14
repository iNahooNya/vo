/**
 * @fileOverview
 * @author iNahoo
 * @since 2017/8/22.
 */
"use strict";

//修正原生类型的构造函数
const NativeConstructors = {
    string(s) {
        if (s === undefined || s === null) {
            return '';
        } else {
            return s.toString();
        }
    },
    number(n) {
        if (n === undefined || n === null || isNaN(n)) {
            return NaN;
        } else {
            return Number(n);
        }
    },
    boolean(b) {
        if (typeof b === 'string') {
            return b === 'true';
        } else {
            return !!b;
        }
    }
};

//辅助对象
export const Assist = {
    //递归判断两个非Object的构造函数是否有继承关系
    isExtendFrom(classA, classB) {
        //无原型
        if (classA.__proto__ === undefined || classA.__proto__ === null) {
            return false;
        }

        //原型终点
        if (classA.__proto__ === Object && classA.__proto__ !== classB) {
            return false;
        }

        if (classA.__proto__ === classB) {
            return true;
        }

        return Assist.isExtendFrom(classA.__proto__, classB);
    },

    //根据构造函数创造工厂函数
    mappingConstructor(f) {

        if (f === Number) {
            return NativeConstructors.number;
        }

        //String构造函数
        if (f === String) {
            return NativeConstructors.string;
        }

        //Boolean构造函数
        if (f === Boolean) {
            return NativeConstructors.boolean;
        }

        //VArray的特殊处理
        if (f instanceof VArray) {
            return f.getConstructor();
        }

        //其他普通对象的处理
        if (typeof f === 'object') {
            //以该对象为Scheme构造一个临时类
            const AnonymousClass = Assist.createClassByScheme(f);
            return t => new AnonymousClass(t);
        }

        //其他构造函数
        if (Assist.isExtendFrom(f, VO)) {
            return t => new f(t);
        }

        throw new TypeError(`不识别的构造函数${f}`);
        // return t => new f(t);
    },

    /**
     *
     * @param Scheme
     * @return {AnonymousVO}
     */
    createClassByScheme(Scheme = {}) {
        return class AnonymousVO extends VO {
            static Scheme = Scheme;
            static Afters = [];
        }
    }

};

class VArray {

    constructor(f) {
        this.__operations__ = [];
        this.map(Assist.mappingConstructor(f));
    }

    map(f) {
        this.__operations__.push(VArray.creatOperate('map', f));
        return this;
    }

    sort(f) {
        this.__operations__.push(VArray.creatOperate('sort', f));
        return this;
    }

    filter(f) {
        this.__operations__.push(VArray.creatOperate('filter', f));
        return this;
    }

    getConstructor() {
        return (arr) => {
            if (arr instanceof Array) {
                while (this.__operations__.length >= 1) {
                    const op = this.__operations__.shift();
                    arr = arr[op.type](op.f);
                }
                return arr;
            } else {
                return [];
            }
        }
    }

    static creatOperate(type, f) {
        return {type, f};
    }

}

export class VO {

    static Scheme = {};
    static Default = {};
    static Afters = [];

    static Global = {
        debug: false,
    };
    static Array(f){
        return new VArray(f);
    };

    static transform(f) {
        class AnonymousVO extends this {
            constructor(options) {
                super(options);
                const Afters = AnonymousVO.Afters;
                const final = Afters.reduce((last, f) => {
                    return f(last);
                }, this);
                return final;
            }

            static Scheme = this.Scheme || {};
            static Default = this.Default || {};
            static Afters = [...this.Afters, f];
        }
        return AnonymousVO
    }

    constructor(origin) {

        Object.defineProperty(this, '__origin__', {
            configurable: false,
            enumerable: false,
            writable: true,
            value: origin
        });

        this.load(origin);

        return this.pure();
    }

    load(mo = {}) {
        const {Scheme, Default} = this.constructor;

        for (let key in Scheme) {

            //提取构造函数
            let typef = Scheme[key];

            /* 空值处理 */
            if (mo[key] === undefined || mo[key] === null) {
                if (key in Default) {
                    this[key] = Default[key];
                } else {
                    //todo 没有空值进行的处理
                }
            }

            if (typef instanceof Array) {
                //将数组处理为VArray
                typef = new VArray(typef[0]);
            }

            //标准处理
            typef = Assist.mappingConstructor(typef);

            this[key] = typef(mo[key]);
        }
    }

}