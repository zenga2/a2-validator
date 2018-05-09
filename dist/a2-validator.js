/*!
 * a2-validator v1.0.12
 * (c) 2017-2018 A2
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.a2Validator = factory());
}(this, (function () { 'use strict';

function isArrayLike(collection) {
  var length = collection.length;
  return typeof length === 'number' && length >= 0;
}

function each(obj, fn) {
  if (!obj || !fn) return;

  if (isArrayLike(obj)) {
    for (var i = 0, len = obj.length; i < len; i++) {
      if (fn.call(obj, obj[i], i) === false) return;
    }
  } else {
    var keys = Object.keys(obj);
    for (var _i = 0, _len = keys.length; _i < _len; _i++) {
      var k = keys[_i];
      if (fn.call(obj, obj[k], k) === false) return;
    }
  }
}

function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

function isNull(arg) {
  return arg === null;
}

function isUndefined(arg) {
  return arg === undefined;
}

// 将普通字符串转义成正则的格式
function escapeStringRegexp(str) {
  var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }

  return str.replace(matchOperatorsRe, '\\$&');
}

function injectProp(dataProp, injectObj, vm) {
  var data = vm.$options.data;

  // inject prop in data
  if (typeof data === 'function') {
    vm.$options.data = function () {
      var obj = data.call(vm);
      obj[dataProp] = injectObj;
      return obj;
    };
  } else {
    data[dataProp] = injectObj;
  }
}

function check(validators, arr) {
  var errorProp = void 0;
  var flag = arr.every(function (prop) {
    errorProp = prop;
    return validators[prop].isOk;
  });

  return {
    success: function success(fn) {
      flag && fn && fn(validators);
      return this;
    },
    error: function error(fn) {
      !flag && fn && fn(validators[errorProp], errorProp, validators);
      return this;
    }
  };
}

function checkAll(validators) {
  return check(validators, Object.keys(validators));
}

function mixinUtils(obj) {
  each({
    checkAll: checkAll.bind(null, obj),
    check: check.bind(null, obj),
    forEach: each.bind(null, obj)
  }, function (util, key) {
    return defineProp(obj, key, util);
  });
}

function defineProp(obj, key, value) {
  Object.defineProperty(obj, key, { value: value });
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};









































var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

// Validate string
// required  number  float  integer  date|yyyy-MM-dd hh:mm:ss
// mobile    email   max    min      maxLength minLength   idCard
var validator = function (data, opts) {
  var validateResult = {};

  // validate multiple values
  if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
    each(opts, function (rule, prop) {
      validateResult[prop] = validator$1(toString(data[prop]), rule);
    });
  }
  // validate single values
  else {
      validateResult = validator$1(toString(data), opts);
    }

  return validateResult;
};

function toString(value) {
  return isNull(value) || isUndefined(value) ? '' : String(value);
}

function validator$1(value, rule) {
  switch (getType(rule)) {
    case 'string':
    case 'regexp':
    case 'function':
      return [validateRule(value, rule), -1];
    case 'array':
      return validateRuleList(value, rule);
  }
}

var numberRegExp = /^-?\d+(\.\d+)?$/;
var integerRegExp = /^(0|-?[1-9]\d*)$/;
var mobileRegExp = /^1(3[0-9]|4[579]|5[0-35-9]|7[0135678]|8[0-9])\d{8}$/;
var emailRegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var idCardRegExp = /^[1-9][0-7]\d{4}((19\d{2}(0[13-9]|1[012])(0[1-9]|[12]\d|30))|(19\d{2}(0[13578]|1[02])31)|(19\d{2}02(0[1-9]|1\d|2[0-8]))|(19([13579][26]|[2468][048]|0[48])0229))\d{3}(\d|X|x)?$/;

var ruleList = {
  required: function required(value) {
    return !!value;
  },
  max: function max(value, maxNum) {
    return Number(value) <= Number(maxNum);
  },
  min: function min(value, minNum) {
    return Number(value) >= Number(minNum);
  },
  maxLength: function maxLength(val, len) {
    return val.length <= Number(len);
  },
  minLength: function minLength(val, len) {
    return val.length >= Number(len);
  },
  number: function number(value) {
    return numberRegExp.test(value);
  },
  integer: function integer(value) {
    return integerRegExp.test(value);
  },


  // fmt eg: 'yyyy-MM-dd hh:mm:ss'
  date: function date(value) {
    var fmt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'yyyy-MM-dd';

    var arr = ['y+', 'M+', 'd+', 'h+', 'm+', 's+'];
    // escape string for RegExp
    fmt = escapeStringRegexp(fmt);

    arr.forEach(function (patt) {
      // 先用w占位,避免\d与d+冲突
      fmt = fmt.replace(new RegExp(patt), function (matchStr) {
        // 除年以外,其他的配备符只有一位时，
        // 表示补零和不补零，这两种格式都支持
        if (patt !== 'y+' && matchStr.length === 1) {
          return '\\w{1,2}';
        }

        return '\\w{' + matchStr.length + '}';
      });
    });

    fmt.replace(/w/g, 'd');

    return new RegExp(fmt).test(value);
  },
  mobile: function mobile(value) {
    return mobileRegExp.test(value);
  },
  email: function email(value) {
    return emailRegExp.test(value);
  },


  // 可以参考id-validator(可以从省份证中获取其他信息)
  idCard: function idCard(value) {
    return idCardRegExp.test(value);
  }
};

function validateRuleList(value, rules) {
  // the index of rule that validate failure
  var step = -1;
  var result = undefined;

  each(rules, function (rule, index) {
    result = validateRule(value, rule);

    if (!result) {
      step = index;
      return false;
    }
  });

  return [result, step];
}

function validateRule(value, rule) {
  switch (getType(rule)) {
    case 'string':
      return dealStringRule(value, rule);
    case 'regexp':
      return rule.test(value);
    case 'function':
      return rule(value);
  }
}

function dealStringRule(value, rule) {
  var _rule$split = rule.split('|'),
      _rule$split2 = slicedToArray(_rule$split, 2),
      validatorKey = _rule$split2[0],
      condition = _rule$split2[1];

  rule = ruleList[validatorKey];
  if (!rule) {
    rule = validateByString;
    condition = validatorKey;
  }

  return rule(value, condition);
}

function validateByString(value, rule) {
  return value.indexOf(rule) > -1;
}

var validatorMixin = {
  beforeCreate: function beforeCreate() {
    var validators = this.$options.validators;
    var injectObj = {};

    // add util funtion
    mixinUtils(injectObj);

    // init injectObj
    Object.keys(validators).forEach(function (prop) {
      return injectObj[prop] = {};
    });

    // inject 'validators' prop in data
    injectProp('validators', injectObj, this);
  },
  created: function created() {
    // add watch listener
    initWatchListener.call(this);
  }
};

function initWatchListener() {
  var _this = this;

  each(this.$options.validators, function (configItem, prop) {
    var _ref = getType(configItem) === 'object' ? [configItem.rules, configItem.tips || []] : [configItem, []],
        _ref2 = slicedToArray(_ref, 2),
        rules = _ref2[0],
        tips = _ref2[1];

    // add listener


    _this.$watch(prop, function (newValue) {
      this.validators[prop] = runValidator(newValue, rules, tips);
    }, { immediate: true });
  });
}

function runValidator(value, rules, tips) {
  var _validator = validator(value, rules),
      _validator2 = slicedToArray(_validator, 2),
      isOk = _validator2[0],
      step = _validator2[1];

  return {
    isOk: isOk, step: step,
    tip: tips[step] || ''
  };
}

return validatorMixin;

})));
