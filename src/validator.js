import {each, getType, isNull, isUndefined, escapeStringRegexp} from './utils'

// Validate string
// required  number  float  integer  date|yyyy-MM-dd hh:mm:ss
// mobile    email   max    min      maxLength minLength   idCard
export default function (data, opts) {
  let validateResult = {}

  // validate multiple values
  if (typeof data === 'object') {
    each(opts, (rule, prop) => {
      validateResult[prop] = validator(toString(data[prop]), rule)
    })
  }
  // validate single values
  else {
    validateResult = validator(toString(data), opts)
  }

  return validateResult
}

function toString(value) {
  return isNull(value) || isUndefined(value) ? '' : String(value)
}

function validator(value, rule) {
  switch (getType(rule)) {
    case 'string':
    case 'regexp':
    case 'function':
      return [validateRule(value, rule), -1]
    case 'array':
      return validateRuleList(value, rule)
  }
}

const numberRegExp = /^-?\d+(\.\d+)?$/
const integerRegExp = /^(0|-?[1-9]\d*)$/
const mobileRegExp = /^1(3[0-9]|4[579]|5[0-35-9]|7[0135678]|8[0-9])\d{8}$/
const emailRegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const idCardRegExp = /^[1-9][0-7]\d{4}((19\d{2}(0[13-9]|1[012])(0[1-9]|[12]\d|30))|(19\d{2}(0[13578]|1[02])31)|(19\d{2}02(0[1-9]|1\d|2[0-8]))|(19([13579][26]|[2468][048]|0[48])0229))\d{3}(\d|X|x)?$/

const ruleList = {
  required(value) {
    return !!value
  },

  max(value, maxNum) {
    return Number(value) <= Number(maxNum)
  },

  min(value, minNum) {
    return Number(value) >= Number(minNum)
  },

  maxLength(val, len) {
    return val.length <= Number(len)
  },

  minLength(val, len) {
    return val.length >= Number(len)
  },

  number(value) {
    return numberRegExp.test(value)
  },

  integer(value) {
    return integerRegExp.test(value)
  },

  // fmt eg: 'yyyy-MM-dd hh:mm:ss'
  date(value, fmt = 'yyyy-MM-dd') {
    let arr = ['y+', 'M+', 'd+', 'h+', 'm+', 's+']
    // escape string for RegExp
    fmt = escapeStringRegexp(fmt)

    arr.forEach(patt => {
      // 先用w占位,避免\d与d+冲突
      fmt = fmt.replace(new RegExp(patt), (matchStr) => {
        // 除年以外,其他的配备符只有一位时，
        // 表示补零和不补零，这两种格式都支持
        if (patt !== 'y+' && matchStr.length === 1) {
          return `\\w{1,2}`
        }

        return `\\w{${matchStr.length}}`
      })
    })

    fmt.replace(/w/g, 'd')

    return new RegExp(fmt).test(value)
  },

  mobile(value) {
    return mobileRegExp.test(value)
  },

  email(value) {
    return emailRegExp.test(value)
  },

  // 可以参考id-validator(可以从省份证中获取其他信息)
  idCard(value) {
    return idCardRegExp.test(value)
  }
}

function validateRuleList(value, rules) {
  // the index of rule that validate failure
  let step = -1
  let result = undefined

  each(rules, (rule, index) => {
    result = validateRule(value, rule)

    if (!result) {
      step = index
      return false
    }
  })

  return [result, step]
}

function validateRule(value, rule) {
  switch (getType(rule)) {
    case 'string':
      return dealStringRule(value, rule)
    case 'regexp':
      return rule.test(value)
    case 'function':
      return rule(value)
  }
}

function dealStringRule(value, rule) {
  let [validatorKey, condition] = rule.split('|')

  rule = ruleList[validatorKey]
  if (!rule) {
    rule = validateByString
    condition = validatorKey
  }

  return rule(value, condition)
}

function validateByString(value, rule) {
  return value.indexOf(rule) > -1
}
