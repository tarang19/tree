<template>
	<div class="controllers">
		<!-- tree controls -->
		<div class="btn-group mr-2" role="group" aria-label="Basic example">			
			<button type="button" class="btn btn-secondary orientation-controls" 
			@click="updateOrientation('potrait')">
			<i data-feather="git-pull-request" class="orientation-control"></i>
			</button>
			<button type="button" class="btn btn-secondary orientation-controls"
			@click="updateOrientation('landscape')">
			<i data-feather="git-branch" class="orientation-control"></i>
			</button>
		</div>
		<!-- tree controls -->
		<div class="btn-group" role="group" aria-label="Basic example">
			<button type="button" class="btn btn-secondary zoom-controls" @click="zoomIn">
			<i data-feather="zoom-in" class="zoom-control" data-zoom="in"></i>            
			</button>
			<button type="button" class="btn btn-secondary zoom-controls" @click="zoomOut">
			<i data-feather="zoom-out" class="zoom-control" data-zoom="out"></i>
			</button>         
		</div>
	</div>
</template>

<script>

	// -----------------------------------------
	// -- jquery
	// -----------------------------------------
	import $ from "jquery";
	window.jQuery = $;

	// -----------------------------------------
	// -- feather icons
	// -----------------------------------------
	const feather = require('feather-icons');

	// -----------------------------------------
	// -- lodash
	// -----------------------------------------
	import _ from "lodash";

	// -----------------------------------------
	// -- tippy
	// ----------------------------------------
	import tippy from 'tippy.js';

	export default {

		data () {
	    	return {}
	  	},

	  	mounted: function () {	
	  		// father icons
			feather.replace();	  		
		},

		methods: {

			zoomIn: function ()
			{
				this.$root.bloodlineObj.zoomIn();
			},

			zoomOut: function ()
			{
				this.$root.bloodlineObj.zoomOut();
			},

			updateOrientation : function ( orientation = null )
			{
				
				// return if parameter null
				if( _.isNull(orientation) ) return;

				// update orientation : potrait
				this.$root.bloodlineObj.orientation.potrait = orientation == 'potrait';

				// update orientation : landscape
				this.$root.bloodlineObj.orientation.landscape = orientation == 'landscape';

				// re-render tree
		  		this.$root.bloodlineTree = this.$root.bloodlineObj.render( this.$root.data );	

		  		// open bootstrap popup here
				// jQuery('a.action-edit').on( 'click', (event) => {
				// 	jQuery('#modal-bloodline-relations').modal('show');					
				// });  		

				// const tippyTemplate = document.getElementById('bl-template');
				// tippyTemplate.style.display = 'block';

				// // tippy
				// const blTippy = tippy(document.querySelectorAll('.action-edit'), {					
				// 	theme: 'bloodline',
				// 	content: () => tippyTemplate.cloneNode(true),
				// 	interactive: true,
				// 	trigger: 'click',
				// 	inertia: true,
				// 	animation: 'scale-extreme',
				// 	allowHTML: true,
				// 	maxWidth: 'none',
				// });

				// ------------------------------------------
				// - on hover display relations in circle
				// ------------------------------------------

				let relations = [ 'mother', 'father', 'brother', 'sister', 'wife', 'husband', 'child' ];

				let schemaWrapper = `<div class='wrapper-relation-circle'></div>`;
				let schemaRelation = `<a class='relation-circle' href="javascript:;"></a>`;

				let prevStackIndex, higherStackIndex = 110;

				// stop event propagation for external tree links
				$( '.descendant a.external-tree, .ancestor a.external-tree' ).hover( 
					function(evt) {
					   evt.stopPropagation();
					   return false;
					},
					function(evt) {
					   evt.stopPropagation();
					   return false;
					}
				);

				$( '.descendant, .ancestor' ).hover (
				  
				  function() {

				  	prevStackIndex = $( this ).css( 'z-index' );

				  	// update stack / zindex
				  	$( this ).css( 'z-index', higherStackIndex );

				  	// add wrapper
				  	let relationWrapper = $( schemaWrapper );
				  	$( this ).append( relationWrapper );

				  	// get the dimesions of wrapper
				  	let relationWrapperDimesions = {};
				  	relationWrapperDimesions.width = relationWrapper.width();
				  	relationWrapperDimesions.height = relationWrapper.height();	

				  	// circular position calculator
				  	let radius = relationWrapperDimesions.width / 2.5;
				  	let cenX = ( relationWrapperDimesions.width / 2.5 ) - 15;
				  	let cenY = ( relationWrapperDimesions.height / 2 ) - 43;
				  	let angle = 0;
				  	let steps = Math.PI * 2 / relations.length;
				  	let left, top;

				  	// add relations

				  	_.forEach( relations, ( relation, relationIndex ) => {
					  
						angle = relationIndex * steps; 

				  		left = cenX + Math.cos(angle) * radius;
				  		top = cenY + Math.sin(angle) * radius;

				  		let relationCurrent = $( schemaRelation );	
				  		let htmlImg = `<img src="./images/${relation}-icon.png">`;
				  		relationCurrent.html( htmlImg );	

				  		// on click event	 
				  		relationCurrent.on( 'click', event => {

				  			// let desc id
				  			let descId = $( this ).attr( 'data-id' );

				  			alert( `Adding ${relation} for user id : ${descId}` );
				  		}); 	

					  	relationWrapper.append( relationCurrent );

					  	relationCurrent.animate({
							top: top,
							left:left,
							opacity: 1,
						}, (75 * relationIndex) );						

					});	

				  },

				  function() {

				  	// update stack / zindex
				  	$( this ).css( 'z-index', prevStackIndex );

				  	// remove
				    $( this ).find( "div.wrapper-relation-circle" ).remove();
				  }

				);
				
			}

		}

	}

</script>