<template lang='pug'>
.container
  h1 {{ msg }}
  b-btn(@click="$root.$emit('show::modal','modal1')") Launch demo modal
  // Modal Component
  b-modal#modal1(title='Submit your name', @ok='submit', @shown='clearName')
    form(@submit.stop.prevent='submit')
      b-form-input(type='text', placeholder='Enter your name', v-model='name')
</template>

<script>
export default {
  name: 'test',
  data () {
    return {
      name: '',
      names: [],
      msg: 'This is a test.'
    }
  },
  methods: {
    clearName() {
      this.name = '';
    },
    submit() {
      if (!this.name) {
        alert('Please enter your name');
        return false;
      }
      this.names.push(this.name);
      this.name = '';

      // Ensure modal closes
      this.$root.$emit('hide::modal', 'modal1');
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
