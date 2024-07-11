<template>
<div class="modal fade" id="modal-bloodline-info" tabindex="-1" aria-labelledby="modal-add-person" aria-hidden="true">
<div class="modal-dialog modal-lg">
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="modal-add-person">Add Info</h5>
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <forminfo @infofromform="emitInfoFromModal"></forminfo>
    </div>
  </div>
</div>
</div>
</template>

<script>

  import BloodlineFormInfo from './BloodlineFormInfo.vue';

  export default {
    
    	data () {
      	return {
  			
      	}
    	},

      components: {
      'forminfo': BloodlineFormInfo
      },

    	mounted () {

  	 },

     methods: {

      emitInfoFromModal: function (info) {
       
        this.$emit( 'infofrommodal', info );

      }

     }
  }
</script>