<template lang='pug'>
div#test
  .offset-md-1.col-md-10
    calendar
</template>

<script>
import { mapGetters } from 'vuex';
import { chunk as _chunk } from 'lodash';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { default as swal } from 'sweetalert2';

import Calendar from './fragments/Calendar';

const moment = extendMoment(Moment);

export default {
  name: 'test',
  props: ['title'],
  components: {
    'calendar': Calendar
  }
}
</script>

<style lang='scss' scoped>
@import 'static/styles/_variables';
#test {
  width: 100%;
}
</style>
