<template>
  <div class="test full-screen">
    <cell label="step1" v-model="step1"></cell>
    <cell label="step2" v-model="step2"></cell>
    <cell label="step3" v-model="step3"></cell>
    <cell label="step4" v-model="step4"></cell>
    <cell label="step5" v-model="step5"></cell>
    <div v-for="(item, prop) in validators" class="item">
      <span>{{prop}}</span>
      <span>{{item.isOk}}</span>
      <span>{{item.step}}</span>
      <span>{{item.tip}}</span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import validatorMixin from '../../src/validator-mixin'
  import cell from './cell.vue'
  import {prop} from 'ramda'

  export default {
    mixins: [validatorMixin],
    data() {
      return {
        step1: 1,
        step2: 1,
        step3: 1,
        step4: 1,
        step5: 1
      }
    },
    validators: {
      step1: ['required', 'date|yyyy-MM-dd'],
      step2: ['required', 'integer'],
      step3: {
        rules: ['required', 'email'],
        tips: ['请输入email', '请输入正确的email']
      },
      step4: ['required', 'minLength|3', 'maxLength|20'],
      step5: ['required', 'number']
    },
    methods: {},
    beforeCreate() {},
    created() {
      window.vm = this
      console.log(prop('step4', this))
    },
    mounted() {
      this.$nextTick(() => {})
    },
    components: {cell}
  }
</script>

<style lang="stylus">
  .cell
    margin-bottom: 10px

  .test
    .item
      line-height: 52px
      & > span
        padding-right: 20px
</style>
