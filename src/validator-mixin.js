import validator from './validator'
import {getType, injectProp, mixinUtils, each} from './utils'

export default {
  beforeCreate() {
    let validators = this.$options.validators
    let injectObj = {}

    // add util funtion
    mixinUtils(injectObj)

    // init injectObj
    Object.keys(validators)
      .forEach(prop => injectObj[prop] = {})

    // inject 'validators' prop in data
    injectProp('validators', injectObj, this)
  },

  created() {
    // add watch listener
    initWatchListener.call(this)
  }
}

function initWatchListener() {
  each(this.$options.validators, (configItem, prop) => {
    let [rules, tips] = getType(configItem) === 'object'
      ? [configItem.rules, configItem.tips]
      : [configItem, []]

    // add listener
    this.$watch(
      prop,
      function (newValue) {
        this.validators[prop] = runValidator(newValue, rules, tips)
      },
      {immediate: true}
    )
  })
}

function runValidator(value, rules, tips) {
  let [isOk, step] = validator(value, rules)

  return {
    isOk, step,
    tip: tips[step] || ''
  }
}
