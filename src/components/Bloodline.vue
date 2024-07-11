<template>
  <div id="wrapper-bloodline">
  	<controllers></controllers>
  </div>
</template>

<script>

import BloodlineControllers from './BloodlineControllers.vue';

export default {
  
  	data () {
    	return {

      }
  	},

  	components: {
      
  		'controllers': BloodlineControllers
  	},

  	mounted () {  		

      // emit the bloodline init
      this.$emit( 'init' );
	}
}
</script>