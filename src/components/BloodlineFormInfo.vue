<template>
<form
  id="bloodline-person-info"
  @submit="emitInfoFromForm"
  action=""
  method="post"
>
 
  <div class="form-group">
    <label for="name">First Name</label>
    <input type="text" class="form-control" v-model="firstName">   
  </div>  

  <div class="form-group">
    <label for="name">Last Name</label>
    <input type="text" class="form-control" v-model="lastName">   
  </div>

  <div class="form-group">
    <label for="name">Gender</label>
    <select class="form-control" name="gender" v-model="gender">
      <option disabled value="">Please select</option>
      <option value="male">Male</option>
      <option value="female">female</option>
    </select>  
  </div>

  <div class="form-group">
    <label for="name">Date of Birth</label>
    <input type="date" class="form-control" v-model="dob">   
  </div>

  <div class="form-group">
    <label for="name">Date of Death (If not alive!)</label>
    <input type="date" class="form-control" v-model="dod">   
  </div>

  <button type="submit" class="btn btn-primary btn-lg mt-3" >Submit</button>

</form>
</template>

<script>

import { v4 as uuidv4 } from 'uuid';

export default {
  
  data () {
  	return {
      id: null,
      firstName: null,
      lastName: null,
      gender: null,
      dob: null,
      dod: null
  	}
  },

  mounted () {

  },

  methods: {

    emitInfoFromForm: function(e) {

      // prevent default submit
      e.preventDefault();
      
      // person id
      let personId = window.activeInfoPersonId == 'null'
                    ? null : window.activeInfoPersonId; 

      // case : when logged user adding his/her data
      // if 'id' is null, assign unique id
      if( _.isNull(personId) ) {
        personId = uuidv4(); // uuid
      } 

      // assign to this is
      this.id = personId;

      // emit
      this.$emit( 'infofromform', this.$data );
    }

  }
}
</script>