'use strict';

// -----------------------------------------
// -- jquery
// -----------------------------------------
import $ from "jquery";
window.jQuery = $;

// -----------------------------------------
// -- vue
// -----------------------------------------
import Vue from "vue/dist/vue.esm.js";

// -----------------------------------------
// -- uuid
// -----------------------------------------
import { v4 as uuidv4 } from 'uuid';

// -----------------------------------------
// -- fancybox
// -----------------------------------------
require("@fancyapps/fancybox");

// -----------------------------------------
// -- popper js
// -----------------------------------------
import Popper from 'popper.js';

// -----------------------------------------
// -- bootstrap
// -----------------------------------------
import 'bootstrap';

// -----------------------------------------
// -- lodash
// -----------------------------------------
import _ from "lodash";

// -----------------------------------------
// -- lodash
// ----------------------------------------
const axios = require('axios').default;

// -----------------------------------------
// -- tippy
// ----------------------------------------
import tippy from 'tippy.js';

// -----------------------------------------
// -- tree data
// -----------------------------------------
import { treeJson } from './tree-initial.js';

// -----------------------------------------
// -- bloodline scripts and components
// -----------------------------------------
import { bloodline } from './bloodline.js';
import BloodlineModalInfo from './components/BloodlineModalInfo.vue';
import BloodlineModalRelations from './components/BloodlineModalRelations.vue';
import Bloodline from './components/Bloodline.vue';

// -----------------------------------------
// -- DOM ready
// -----------------------------------------

$( document ).ready(function() {


	let vm = new Vue({ 
		
		el: '#app',

		data: 
		{

			bloodlineObj: null,
			bloodlineTree: null,
			data: null,
			rootUser: null,
		},

		components: {

			'modalinfo': BloodlineModalInfo,
			'modalrelations': BloodlineModalRelations,
			'bloodline': Bloodline
		},

		methods: {

			initBloodline: function ()
			{				
				// update data
				this.data = treeJson;

				// crate bloodline instance
				this.bloodlineObj = bloodline.init( 'wrapper-bloodline' );

				// create tree
				this.bloodlineTree = this.bloodlineObj.render( this.data );

				// open bootstrap popup here
				// $('a.action-edit').on( 'click', (event) => {
				// 	$('#modal-bloodline-relations').modal('show');					
				// });

				const tippyTemplate = document.getElementById('bl-template');
				tippyTemplate.style.display = 'block';

				// tippy
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

			},
			updateInfo: function( info )
			{
				// get the person whos data has been updated
				let person;

				// find in parents	
				person = this.getPerson( this.data._parents, info.id );

				if ( !person ) {					
					
					// find in children
					person = this.getPerson( this.data._children, info.id );
				}

				// if person found
				if ( person ) {
					
					person.data.name = `${info.firstName} ${info.lastName}`;
					person.data.gender = info.gender;
					person.data.dob = info.dob;
					person.data.dod = info.dod;

				} 
				// else its root person himself
				else {

					let childrenLength, rootPerson;

					childrenLength = this.data._children.length;					
					rootPerson = this.data._children[childrenLength - 1];

					rootPerson.id = _.isNull(rootPerson.id) ? info.id : rootPerson.id;

					rootPerson.data.name = `${info.firstName} ${info.lastName}`;
					rootPerson.data.gender = info.gender;
					rootPerson.data.dob = info.dob;
					rootPerson.data.dod = info.dod;
				}

				// re-render tree
		  		this.bloodlineTree = this.bloodlineObj.render( this.data );

		  		// close all popups
		  		$('#modal-bloodline-relations').modal('hide');			  		
			},

			getPerson: function ( collection, personId ) 
			{
				// person
				let person = null;

				// if empty return
				if( _.isEmpty(collection) ) return person;				

				// first find the person in the given collection
				person = _.find( collection, personToFind => {										
					return personToFind.id == personId;
				});

				// if person not found in given
				// go deeper in the respective children
				if( !person ) {

					let childrenProxy;

					_.forEach(collection, (iteratingPerson, personIndex) => {

						// search in spouses if any
						if ( _.has(iteratingPerson, '_spouses') ) {

							person = this.getPerson( iteratingPerson._spouses, personId );
							// if the person is found
							// break the loop
							if( person ) return false;	
						}
					 
						childrenProxy = _.has( iteratingPerson, '_parents' ) ? '_parents' : '_children';

						// search in children proxy
						if( !_.isEmpty(iteratingPerson[childrenProxy]) ) {

							person = this.getPerson( iteratingPerson[childrenProxy], personId );
							// if the person is found
							// break the loop
							if( person ) return false;
						}

					});					
				}

				// return
				return person;
			}

		},

	});	

});




	

