<template>
<div class="modal fade" id="modal-bloodline-relations" tabindex="-1" aria-labelledby="modal-add-person" aria-hidden="true">
<div class="modal-dialog modal-lg">
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="modal-add-person">Add Relations</h5>
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <formrelations></formrelations>
    </div>
  </div>
</div>
</div>
</template>

<script>

  import BloodlineFormRelations from './BloodlineFormRelations.vue';

  export default {
    
    	data () {
      	return {
  			
      	}
    	},

      components: {
      'formrelations': BloodlineFormRelations
      },

    	mounted () {

  	}
  }
</script>