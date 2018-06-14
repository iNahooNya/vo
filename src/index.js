/**
 * @fileOverview
 * @author iNahoo
 * @since 2017/8/22.
 */
"use strict";

import {VO, Assist} from './base';

VO.prototype.$log = function () {
    return JSON.stringify(this);
};

VO.prototype.pure = function () {
    return JSON.parse(JSON.stringify(this));
};

VO.create = function (Scheme) {
    return Assist.createClassByScheme(Scheme);
};

/**
 * 允许 => 分隔的mapping方式
 * @param Scheme
 */
VO.createWithMapping = function (Scheme) {
    const originScheme = {};
    const mappingScheme = {};
    const reg = /\s*=>\s*/;

    //生成对应关系
    for (let key in Scheme) {
        const matching = key.split(reg);
        let origin, mapping;
        if (matching.length === 1) {
            origin = mapping = matching[0];
        } else {
            origin = matching[0];
            mapping = matching[1];
        }

        originScheme[origin] = Scheme[key];
        mappingScheme[origin] = mapping;
    }

    return Assist.createClassByScheme(originScheme).transform(obj => {
        const res = {};
        for (let origin in mappingScheme) {
            const mapping = mappingScheme[origin];
            res[mapping] = obj[origin];
        }
        return res;
    });
};

VO.construct = function (options) {
    return class extends VO {
        static Scheme = options.Scheme || {};
        static Default = options.Default || {};
        static Afters = [];
    }
};

export {VO as VO};
