function isArrayLike(collection) {
  var length = collection.length
  return typeof length === 'number' && length >= 0
}

function each(obj, fn) {
  if (!obj || !fn) return

  if (isArrayLike(obj)) {
    for (let i = 0, len = obj.length; i < len; i++) {
      if (fn.call(obj, obj[i], i) === false) return
    }
  } else {
    let keys = Object.keys(obj)
    for (let i = 0, len = keys.length; i < len; i++) {
      let k = keys[i]
      if (fn.call(obj, obj[k], k) === false) return
    }
  }
}

function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}

function isNull(arg) {
  return arg === null
}

function isUndefined(arg) {
  return arg === undefined
}

// 将普通字符串转义成正则的格式
function escapeStringRegexp(str) {
  let matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g

  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }

  return str.replace(matchOperatorsRe, '\\$&');
}

function injectProp(dataProp, injectObj, vm) {
  let data = vm.$options.data

  // inject prop in data
  if (typeof data === 'function') {
    vm.$options.data = function () {
      let obj = data.call(vm)
      obj[dataProp] = injectObj
      return obj
    }
  } else {
    data[dataProp] = injectObj
  }
}

function check(arr, validators) {
  let errorProp

  let flag = arr.every(prop => {
    errorProp = prop
    return validators[prop].isOk
  })

  return {
    success(fn) {
      flag && fn && fn(validators)
      return this
    },
    error(fn) {
      !flag && fn && fn(validators[errorProp], errorProp, validators)
      return this
    }
  }
}

function checkAll(validators) {
  return check(Object.keys(validators), validators)
}

function mixinUtils(obj) {
  each({
    checkAll: checkAll.bind(null, obj),
    check: check.bind(null, obj),
    forEach: each.bind(null, obj)
  }, (util, key) => defineProp(obj, key, util))
}

function defineProp(obj, key, value) {
  Object.defineProperty(obj, key, {value})
}

export {
  each, isArrayLike, getType,
  isUndefined, isNull, escapeStringRegexp,
  injectProp, check, checkAll, mixinUtils
}
