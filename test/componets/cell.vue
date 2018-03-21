<template>
  <div class="cell">
    <span class="label">{{label}}</span>
    <input class="value"
           @input="inputHandle"
           :placeholder="placeholder"
           :value="value">
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      label: {default: ''},
      value: {default: ''},
      placeholder: {default: ''}
    },
    methods: {
      inputHandle(e) {
        this.$emit('input', e.target.value)
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  .cell
    display: flex
    position: relative
    padding: 0 16px
    font-size: 14px
    color: #666
    background: #fff
    border: solid #d3d3d3 1px
    &:after
      left: 16px
      right: 16px
      width: auto
    .label, .value, .value-text
      line-height: 48px
    .value, .value-text
      overflow: hidden
      flex: 1
      text-align: right
      color: #666
    .value
      border: none
      outline: none
      background: transparent
      &::-webkit-input-placeholder
        font-size: 14px
    .cell-icon
      margin-left: 5px
      transform: rotate(180deg)
      line-height: 48px
      font-size: 20px
</style>
