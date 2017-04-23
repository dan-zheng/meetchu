<template lang='pug'>
div(@mousedown='mousedown', @mousehover='', :class='style()') {{ day.format('D') }}
</template>

<script>
export default {
  name: 'calendar-day',
  props: ['day'],
  data() {
    return {
      mousedown: false,
      selected: false
    }
  },
  methods: {
    style() {
      if (this.selected) {
        return 'selected';
      }
      return '';
    },
    mousedown() {
      this.mousedown = true;
    }
  }
}
</script>

<style lang='scss' scoped>
@import 'static/styles/_variables';

.selected {
  background-color: #dbd9fa;
}
</style>
