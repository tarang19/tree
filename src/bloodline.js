"use strict";

// -----------------------------------------
// -- lodash
// -----------------------------------------
import _ from "lodash";

// -----------------------------------------
// -- jquery
// -----------------------------------------
import $ from "jquery";

// -----------------------------------------
// -- d3
// -----------------------------------------
import * as d3 from "d3";

// -----------------------------------------
// -- bloodline
// -----------------------------------------
const bloodline = {
  // -----------------------------------------
  // -- properties
  // -----------------------------------------

  // library dependancies
  dependancies: ["d3", "lodash"],

  // wrapper
  wrapper: null,

  // group of all the nodes, so parent!
  parent: null,

  // parent class
  parentClass: "parent",

  // ancestor class
  ancestorClass: "ancestor",

  // descendant class
  descendantClass: "descendant",

  // data in json format
  data: null,

  // root : ancestors
  rootAncestors: null,

  // root : descendants
  rootDescendants: null,

  // tree : ancestors
  treeAncestors: null,

  // tree : descendants
  treeDescendants: null,

  // node size
  nodeSize: { width: 150, height: 300 },

  // zoom and pans
  zoom: { scale: 1, x: null, y: null },

  // zoom object for manual zooms
  zoomObj: null,

  // orientations
  orientation: { potrait: true, landscape: false },

  // -----------------------------------------
  // -- methods
  // -----------------------------------------

  // init sets the d3 object on the given wrapper element
  // and adds parent div as group of inner nodes / children
  // parent div is zoomable, pannable

  init: function (wrapperId = null) {
    // check for dependacies
    if (typeof _.compact([]) == "undefined" || typeof d3 == "undefined") {
      throw `Dependancies ( ${this.dependancies.toString()} ) not loaded!`;
      return;
    }

    // check if wrapper selector has been provided
    if (_.isNull(wrapperId)) {
      throw `Must provide wrapper element while initialising.`;
      return;
    }

    // dom wrapper
    let wrapper = document.getElementById(wrapperId);
    console.log("getTree", wrapper);
    // set dom parent
    let parent = document.createElement("div");
    parent.setAttribute("class", this.parentClass);

    // append dom parent to dom wrapper
    wrapper.appendChild(parent);

    // set bloodline wrapper
    this.wrapper = d3.select(`#${wrapperId}`);

    // set bloodline parent
    this.parent = this.wrapper.select(`.${this.parentClass}`);
    console.log("this.wrapper", this.wrapper);
    // apply zoom, pan on parent
    this.applyZoomAndPan(this.wrapper);

    console.log("this", this);
    // return bloodline object
    return this;
  },

  // render the bloodline tree
  // based on the provided data

  render: function (
    treeData = null,
    showAncestors = true,
    showDescendants = true
  ) {
    // check if data has been provided
    if (_.isNull(treeData)) {
      throw `Must provide data.`;
      return;
    }

    // clear previously drawn trees, if any
    this.parent.selectAll("*").remove();

    // create deep clone of the treedata
    // NOTE : this workaround is to avoid direct mutation in vuex
    this.data = _.cloneDeep(treeData);

    // concat spouses into the same level children array
    this.data = this.concatSpouses(this.data);

    // sort concactenated spouses based on on gender
    this.data = this.sortSpouses(this.data);

    // set ancestor root
    this.rootAncestors = showAncestors
      ? this.createRootProxy(this.data.id, this.data.data, this.data._parents)
      : null;

    // set descendants root
    this.rootDescendants = showDescendants
      ? this.createRootProxy(this.data.id, this.data.data, this.data._children)
      : null;

    // create trees
    this.treeAncestors = this.createTree(this.rootAncestors, this.nodeSize);
    this.treeDescendants = this.createTree(this.rootDescendants, this.nodeSize);

    // create and draw trees for ancestors
    if (showAncestors) {
      // draw tree
      this.drawAncestors(this.treeAncestors);
    }

    // create and draw trees for descendants
    if (showDescendants) {
      // draw tree
      this.drawDescendants(this.treeDescendants);
    }

    // return bloodline object
    return this;
  },

  // update tree data by
  // adding spouses as children at
  // the same level as their partners
  concatSpouses: function (treeData) {
    // recursive function

    function curry(children) {
      // check if array / collection
      // recieved as parameter

      if (_.isArray(children)) {
        // loop
        _.forEach(children, (child) => {
          // check if iterating child has spouses property

          if (_.has(child, "_spouses") && !_.isEmpty(child._spouses)) {
            // for single spouse
            // (1) get the first object in spouse collection
            // (2) create new property with value : 'trueChild: false'
            // (3) and push it into children collection

            // let spouse = _.head(child._spouses); // 1
            // spouse.trueChild = false; // 2
            // children.push( spouse ); // 3

            _.forEach(child._spouses, (spouse) => {
              // clone
              let spouseClone = _.clone(spouse);

              // add property
              spouseClone.trueChild = false;

              // push into same level children
              children.push(spouseClone);
            });

            // for multiple spouses
            // !!TODO!!
            // children = _.concat( children, child._spouses );
            // console.log(children);
          }

          // go deeper if has children

          if (_.has(child, "_children") && !_.isEmpty(child._children)) {
            curry(child._children);
          }
        });
      }
    }

    // clone of the original collection to work upon
    let children = treeData._children;

    // update the original collection by adding spouses
    curry(children);

    // update original treeData._children property
    // with newly updated _children collecton
    treeData._children = children;

    // return
    return treeData;
  },

  // sort the spouses pushed in
  // the same level children collection
  sortSpouses: function (treeData) {
    // recursive function

    function curry(children) {
      // check if array / collection
      // recieved as parameter

      if (_.isArray(children)) {
        // loop
        _.forEach(children, (child) => {
          // go deeper if has children

          if (_.has(child, "_children") && !_.isEmpty(child._children)) {
            curry(child._children);
          }

          // check if iterating child has spouses property

          if (_.has(child, "_spouses") && !_.isEmpty(child._spouses)) {
            // get the iterating childs spouse
            //let spouse = _.head(child._spouses);

            // remove the spouse from 'children' collection
            let removedSpouses = [];

            _.forEach(child._spouses, (spouse) => {
              let removedSpouse = _.remove(children, (childToRemove) => {
                return childToRemove.id == spouse.id;
              });

              removedSpouses.push(removedSpouse[0]);
            });

            // find the index of iterating child
            let childIndex = _.findIndex(
              children,
              (childToFind) => child.id == childToFind.id
            );

            // base on 'removedSpouse' gender
            // set the new spouse index
            let spouseNewIndex =
              child.data.gender == "male" ? childIndex + 1 : childIndex;

            // splice array
            children.splice(spouseNewIndex, 0, ...removedSpouses);
          }
        });
      }
    }

    // clone of the original collection to work upon
    let children = treeData._children;

    // update the original collection by adding spouses
    curry(children);

    // update original treeData._children property
    // with newly updated _children collecton
    treeData._children = children;

    // return
    return treeData;
  },

  // apply zoom and pan
  // for the given d3 parent
  applyZoomAndPan: function (zoomable) {
    let wrapperWidth, wrapperHeight, transform;

    wrapperWidth = this.wrapper.node().getBoundingClientRect().width;
    wrapperHeight = this.wrapper.node().getBoundingClientRect().height;

    this.zoomObj = d3
      .zoom()
      .scaleExtent([0.4, 1])
      .on("zoom", () => {
        transform = d3.zoomTransform(this.parent.node());

        this.zoom.scale = transform.k;
        this.zoom.x = transform.x;
        this.zoom.y = transform.y;

        this.parent.style(
          "transform",
          `scale(${this.zoom.scale}) 
 				translateX(${this.zoom.x}px) 
 				translateY(${this.zoom.y}px)`
        );
      });

    // centralize zoom base for initial state
    let initialTransform, cX, cY;

    cX = wrapperWidth / 2 - this.nodeSize.width / 2;
    cY = wrapperHeight / 2 - this.nodeSize.height / 2;

    initialTransform = d3.zoomIdentity.translate(cX, cY).scale(0.7);

    zoomable.call(this.zoomObj.transform, initialTransform);

    zoomable.call(this.zoomObj);

    // no zoom on 'double click'
    zoomable.on("dblclick.zoom", null);

    // no zoom on 'mousewheel'
    zoomable.on("wheel.zoom", null);
  },

  // create root / proxy root
  // for the provided data
  zoomIn: function () {
    this.zoom.scale = this.zoom.scale + this.zoom.scale * 0.2;

    // max scale == 1
    this.zoom.scale = this.zoom.scale > 1 ? 1 : this.zoom.scale;

    let transform = d3.zoomTransform(this.parent.node());
    this.zoom.x = transform.x;
    this.zoom.y = transform.y;

    let updatedTransform = d3.zoomIdentity
      .translate(this.zoom.x, this.zoom.y)
      .scale(this.zoom.scale);

    this.wrapper.call(this.zoomObj.transform, updatedTransform);
  },

  // create root / proxy root
  // for the provided data
  zoomOut: function () {
    this.zoom.scale = this.zoom.scale - this.zoom.scale * 0.2;

    // min scale == .3
    this.zoom.scale = this.zoom.scale < 0.3 ? 0.3 : this.zoom.scale;

    let transform = d3.zoomTransform(this.parent.node());
    this.zoom.x = transform.x;
    this.zoom.y = transform.y;

    let updatedTransform = d3.zoomIdentity
      .translate(this.zoom.x, this.zoom.y)
      .scale(this.zoom.scale);

    this.wrapper.call(this.zoomObj.transform, updatedTransform);
  },

  createRootProxy: function (id, data, children) {
    // update the proxy names used for children property
    children = this.updateChildrenProxyProperyName(children);

    // return root
    return {
      id: id,
      data: data,
      x0: 0,
      y0: 0,
      children: children,
    };
  },

  // update proxy children collection names
  // to required 'children' property

  updateChildrenProxyProperyName: function (proxyChildren) {
    proxyChildren = _.map(proxyChildren, (proxyChild) => {
      // set which property to update as 'children'
      let propertyToUpdate = _.has(proxyChild, "_children")
        ? "_children"
        : "_parents";

      // set new children property
      proxyChild.children = proxyChild[propertyToUpdate];

      // if any deeper children,
      // then use recursive logic
      if (proxyChild.children.length)
        this.updateChildrenProxyProperyName(proxyChild.children);

      // return proxy child
      return proxyChild;
    });

    // return updated children
    return proxyChildren;
  },

  // create tree for the provided data
  // all types of generations can be created

  createTree: function (data, nodesize) {
    // create hierachy
    const root = d3.hierarchy(data);

    let separationFactor = this.orientation.potrait ? 1.3 : 1.15;
    let noSpouses, bothSiblingsHaveSpouses, onlyAHasSpouse, onlyBHasSpouse;

    // tree
    const tree = d3
      .tree()
      .nodeSize([nodesize.width, nodesize.height])
      .separation((a, b) => {
        // ** note **
        // separation values are only applied to descendants
        // as parent ancestor sepration is custom calculated

        // see if no spouses
        // then return default separation factor
        // noSpouses = !_.has( a, 'data._spouses' ) && !_.has( b, 'data._spouses' );
        // if( noSpouses ) return separationFactor;

        // return
        return separationFactor;
      })(root);

    // update the direction
    return tree;
  },

  // draw the ancestors
  // for the given root ( for user )
  drawAncestors: function (ancestorsTree) {
    // flip the y axis
    // as drawing ancestors
    let ancestors = _.map(ancestorsTree.descendants(), (ancestor) => {
      // flip y ( if not root person )
      ancestor.y =
        ancestor.x == 0 && ancestor.y == 0 ? ancestor.y : ancestor.y * -1;
      return ancestor;
    });

    // remove root and keep rest
    _.pullAt(ancestors, 0);

    // upate the x axis of the ancestors
    //ancestors = this.createX0( ancestors ); // previous algorithm

    ancestors = this.createX0(ancestors);

    // create ancestor nodes
    let ancestorNodes = this.parent.selectAll(`.${this.ancestorClass}`);

    // enter and append
    let enter = ancestorNodes.data(ancestors).enter();

    // append divs with person class
    enter = enter
      .append("div")
      .classed(this.ancestorClass, true)
      .classed("male", (ancestor) => {
        return (
          !_.isNull(ancestor.data.data) && ancestor.data.data.gender == "male"
        );
      })
      .classed("female", (ancestor) => {
        return (
          !_.isNull(ancestor.data.data) && ancestor.data.data.gender == "female"
        );
      })
      .classed("blank", (ancestor) => {
        return _.isNull(ancestor.data.data.name);
      })
      .classed("deceased", (descendant) => {
        return !_.isNull(descendant.data.data.dod);
      })
      .classed("orientation-potrait", (ancestor) => {
        return this.orientation.potrait;
      })
      .classed("orientation-landscape", (ancestor) => {
        return this.orientation.landscape;
      })
      .attr("data-id", function (ancestor) {
        return `${ancestor.data.id}`;
      })
      .style("z-index", function (ancestor) {
        let zIndex = 10;

        let isFemale, hasMultipleSpouses;

        // set if female
        isFemale = ancestor.data.data.gender;

        // set if has multiple spouses
        hasMultipleSpouses = _.has(ancestor.data, "_partners")
          ? ancestor.data._partners.length > 1
          : false;

        // recalculate z-index
        zIndex = isFemale && hasMultipleSpouses ? zIndex / 2 : zIndex;

        return `${zIndex}`;
      })
      .on("click", function () {});

    // assign top
    enter = enter.style("top", (person) => {
      // orientation check!
      let personVerticalAxis = this.orientation.potrait ? person.y : person.x0;
      return `${personVerticalAxis}px`;
    });

    // assign left
    enter = enter.style("left", (person) => {
      // orientation check!
      let personHorizontalAxis = this.orientation.potrait
        ? person.x0
        : person.y;
      return `${personHorizontalAxis}px`;
    });

    // external tree
    let externalTree = enter
      .filter((ancestor) => {
        // filter children with extrernal tree
        return (
          _.has(ancestor, "data.data.externalTreeId") &&
          !_.isNull(ancestor.data.data.externalTreeId)
        );
      })
      .append("a")
      .attr("href", (ancestor) => {
        let url = "http://localhost/xyz/";
        return `${url}${ancestor.data.data.externalTreeId}`;
      })
      .classed("external-tree", true);

    let externalTreeCardConnector = externalTree
      .append("span")
      .classed("card-connector", true);

    let externalTreeNodeConnector = externalTree
      .append("span")
      .classed("node-connector", true);

    // avatar
    let avatar = enter
      .append("div")
      .classed("avatar", true)
      .style("background-image", (ancestor) => {
        let maleAvatarUrl = "./images/male-user-avatar.png";
        let femaleAvatarUrl = "./images/female-user-avatar.png";

        let avatarUrl =
          !_.has(ancestor.data.data, "avatar") ||
          _.isNull(ancestor.data.data.avatar)
            ? ancestor.data.data.gender == "male"
              ? maleAvatarUrl
              : femaleAvatarUrl
            : ancestor.data.data.avatar;

        return `url('${avatarUrl}')`;
      });

    // content
    let content = enter.append("div").classed("content", true);

    // ancestor namme
    let ancestorName = content
      .append("h4")
      .classed("person-name", true)
      //.classed( 'text-truncate', true )
      .text((ancestor) => {
        return !_.isNull(ancestor.data.data) ? ancestor.data.data.name : "";
      });

    // lifespan
    let lifespan = content.append("h6").classed("lifespan", true);

    // DOB and DOB
    let dob, dod;

    let lifespanDob = lifespan
      .append("span")
      .classed("dob", true)
      .text((ancestor) => {
        if (_.isNull(ancestor.data.data) || _.isNull(ancestor.data.data.dob))
          return "";

        dob = new Date(ancestor.data.data.dob);
        return `${dob.getFullYear()} - `;
      });

    let lifespanDod = lifespan
      .append("span")
      .classed("dod", true)
      .text((ancestor) => {
        if (!_.isNull(ancestor.data.data.dod)) {
          dod = new Date(ancestor.data.data.dod);
          return dod.getFullYear();
        } else if (
          _.isNull(ancestor.data.data) ||
          _.isNull(ancestor.data.data.dob)
        ) {
          return "";
        } else {
          return "living";
        }
      });

    // actions menu : edit and relations
    // let actions = content
    // 		.append('div')
    // 		.classed( 'actions', true );

    // let actionEdit = actions
    // 				.append('a')
    // 				.classed( 'action-edit', true )
    // 				.attr('data-id', function(ancestor) {
    // 					return `${ancestor.data.id}`;
    // 				})
    // 				.on( 'click', function () {
    // 				});

    // 				// action icon
    // 				actionEdit
    // 				.append('span')
    // 				.html( '&#43;' )
    // 				.on( 'click', () => {
    // 				});

    // spouse connectors
    // multiple spouse connectors, if any
    // _.forEach(ancestors, ancestor => {
    // 	// for true children/descendants
    // 	if ( 	_.has(ancestor.data, '_partners')
    // 			&& !_.isEmpty(ancestor.data._partners)
    // 			&& ancestor.data._partners.length > 1
    // 	) {

    // filter the children with spouse
    // and append div with spouse class
    let ancestorsWithSpouses = enter
      .filter((ancestor) => {
        // filter children with non empty spouses
        return (
          _.has(ancestor, "data._spouses") &&
          !_.isEmpty(ancestor.data._spouses) &&
          ancestor.data._partners.length > 1
        );
      })
      .append("div")
      .classed("spouse", true)
      .classed("male", (ancestor) => {
        return ancestor.data._spouses[0].data.gender == "male";
      })
      .classed("female", (ancestor) => {
        return ancestor.data._spouses[0].data.gender == "female";
      });

    // 		// iterate the spouses
    // spouse connectors
    // multiple spouse connectors, if any
    _.forEach(ancestors, (ancestor) => {
      // for true children/descendants
      if (
        _.has(ancestor.data, "_spouses") &&
        !_.isEmpty(ancestor.data._spouses) &&
        ancestor.data._partners.length > 1 &&
        ancestor.data._spouses.length > 1
      ) {
        // iterate the spouses
        _.forEach(ancestor.data._spouses, (spouse) => {
          enter
            .filter((anc) => {
              return anc.data.id == ancestor.data.id;
            })
            .append("div")
            .classed("connector-spouse", true)
            .style("top", (ancestor) => {
              if (_.isNull(ancestor.data.data)) return null;

              return this.orientation.potrait
                ? `50%`
                : ancestor.data.data.gender == "male"
                ? `100%`
                : null;
            })
            .style("margin-top", (anc) => {
              if (_.isNull(ancestor.data.data)) return null;

              if (this.orientation.potrait) {
                console.log(ancestor.data._spouses);
                let iteratingSpouseIndex = _.findIndex(
                  ancestor.data._spouses,
                  (sps) => {
                    return sps.id == spouse.id;
                  }
                );

                console.log(iteratingSpouseIndex, 10 * iteratingSpouseIndex);

                // here factor == 10
                return `${10 * iteratingSpouseIndex}px`;
              }
            })
            .style("bottom", (ancestor) => {
              if (_.isNull(ancestor.data.data)) return null;

              return this.orientation.landscape
                ? ancestor.data.data.gender == "female"
                  ? `100%`
                  : null
                : null;
            })
            .style("right", (ancestor) => {
              return !_.isNull(ancestor.data.data) &&
                ancestor.data.data.gender == "male"
                ? ""
                : "100%";
            })
            .style("left", (ancestor) => {
              if (_.isNull(ancestor.data.data)) return null;

              return this.orientation.landscape
                ? `50%`
                : ancestor.data.data.gender == "male"
                ? "100%"
                : null;
            })
            .style("margin-left", (ancestor) => {
              if (_.isNull(ancestor.data.data) || this.orientation.potrait)
                return null;

              // mode : landscape
              let iteratingSpouseIndex = _.findIndex(
                ancestor.data._spouses,
                (sps) => {
                  return sps.id == spouse.id;
                }
              );

              // here factor == 10
              return `${10 * iteratingSpouseIndex}px`;
            })
            .style("width", (anc) => {
              if (_.isNull(anc.data.data)) return null;

              let spouseIndex = _.findIndex(ancestor.data._spouses, (sps) => {
                return sps.id == spouse.id;
              });

              let width = this.nodeSize.width * 0.15;

              let distanceFactor = this.nodeSize.width * 1.3 * spouseIndex;

              width = width + distanceFactor;

              return this.orientation.potrait ? `${width}px` : `3px`;
            })
            .style("height", (ancestor) => {
              if (_.isNull(ancestor.data.data)) return null;

              // mode : potrait

              if (this.orientation.potrait) return `3px`;

              // mode : landscape

              let spouseIndex = _.findIndex(ancestor.data._spouses, (sps) => {
                return sps.id == spouse.id;
              });

              let cardHeight, spouseConnectorHeight, distanceFactor, height;

              spouseConnectorHeight = this.nodeSize.width * 0.2;

              cardHeight = 86;

              distanceFactor =
                cardHeight * (spouseIndex + 1) +
                spouseConnectorHeight *
                  (spouseIndex ? spouseIndex + 1 : spouseIndex);

              height = spouseConnectorHeight + distanceFactor;

              return `${height}px`;
            });
        });
      }
    });

    // spouse connector
    let spouseConnector = enter
      .filter((ancestor) => {
        let descendants, isParent, isMarried;

        // set descendants

        descendants =
          ancestor.depth == 1
            ? this.treeDescendants.descendants()
            : this.treeAncestors.descendants();

        // set is parent

        isParent = _.find(descendants, (parent) => {
          // for female
          if (ancestor.data.data.gender == "female") {
            return (
              ancestor.data.id == this.data.motherId ||
              ancestor.data.id == parent.data.motherId
            );
          }

          // for male
          if (ancestor.data.data.gender == "male") {
            return (
              ancestor.data.id == this.data.fatherId ||
              ancestor.data.id == parent.data.fatherId
            );
          }
        });

        // set isMarried

        isMarried =
          _.has(ancestor.data, "_partners") &&
          !_.isEmpty(ancestor.data._partners);
        // return
        return !!isParent || isMarried;
      })
      .append("div")
      .classed("connector-spouse", true)
      .style("right", (ancestor) => {
        // if orientation == landscape, return
        if (this.orientation.landscape) return null;

        return !_.isNull(ancestor.data.data) &&
          ancestor.data.data.gender == "male"
          ? ""
          : "100%";
      })
      .style("left", (ancestor) => {
        // if orientation == landscape, return
        if (this.orientation.landscape) return `50%`;

        return !_.isNull(ancestor.data.data) &&
          ancestor.data.data.gender == "male"
          ? "100%"
          : "";
      })
      .style("top", (ancestor) => {
        // if no data, return
        if (_.isNull(ancestor.data.data)) return null;

        // if orientation == potrait, return
        if (this.orientation.potrait) return `50%`;

        return ancestor.data.data.gender == "male" ? `100%` : null;
      })
      .style("bottom", (ancestor) => {
        // if orientation == potrait, return
        if (this.orientation.potrait) return null;

        // if no data, return
        if (_.isNull(ancestor.data.data)) return null;

        return ancestor.data.data.gender == "female" ? `100%` : null;
      })
      .style("width", (ancestor) => {
        return this.orientation.potrait
          ? `${this.nodeSize.width * 0.15}px`
          : `3px`;
      })
      .style("height", (ancestor) => {
        return this.orientation.potrait
          ? `3px`
          : `${this.nodeSize.width * 0.2 + 1}px`;
      });

    // child connector
    let childConnector = enter
      .filter((ancestor) => {
        let isParent, descendants, isMarried;

        descendants =
          ancestor.depth == 1
            ? this.treeDescendants.descendants()
            : this.treeAncestors.descendants();

        isParent = _.find(descendants, (parent) => {
          // for female
          if (ancestor.data.data.gender == "female") {
            return (
              ancestor.data.id == this.data.motherId ||
              ancestor.data.id == parent.data.motherId
            );
          }

          // for male
          if (ancestor.data.data.gender == "male") {
            return (
              ancestor.data.id == this.data.fatherId ||
              ancestor.data.id == parent.data.fatherId
            );
          }
        });

        // set isMarried

        isMarried =
          _.has(ancestor.data, "_partners") &&
          !_.isEmpty(ancestor.data._partners);
        //console.log(isMarried)
        // return
        return !!isParent;
      })
      .append("div")
      .classed("connector-child", true)
      .style("top", (ancestor) => {
        //console.log(ancestor.data.data)
        if (_.isNull(ancestor.data.data)) return null;

        return this.orientation.potrait
          ? `50%`
          : ancestor.data.data.gender == "male"
          ? `100%`
          : `0`;
      })
      .style("margin-top", (ancestor) => {
        if (_.isNull(ancestor.data.data)) return null;

        return this.orientation.landscape
          ? ancestor.data.data.gender == "male"
            ? `${this.nodeSize.width * 0.2 + 1}px`
            : `${-(this.nodeSize.width * 0.2) - 2}px`
          : null;
      })
      .style("left", (ancestor) => {
        if (_.isNull(ancestor.data.data)) return null;

        return this.orientation.potrait
          ? ancestor.data.data.gender == "male"
            ? `100%`
            : null
          : `50%`;
      })
      .style("margin-left", (ancestor) => {
        if (_.isNull(ancestor.data.data) || this.orientation.landscape)
          return null;

        return ancestor.data.data.gender == "male"
          ? `${this.nodeSize.width * 0.15}px`
          : null;
      })
      .style("right", (ancestor) => {
        if (_.isNull(ancestor.data.data)) return null;

        return ancestor.data.data.gender == "female" ? `100%` : "";
      })
      .style("margin-right", (ancestor) => {
        return !_.isNull(ancestor.data.data) &&
          ancestor.data.data.gender == "female"
          ? `${this.nodeSize.width * 0.15}px`
          : "";
      })
      .style("height", (ancestor) => {
        if (_.isNull(ancestor.data.data)) return null;

        // mode : potrait

        // if depth > 1 or roots parent
        if (
          ancestor.depth > 1 ||
          ancestor.data.id == this.data.fatherId ||
          ancestor.data.id == this.data.motherId
        ) {
          return this.orientation.potrait
            ? `${this.nodeSize.height * 0.49}px`
            : `1px`;
        }

        // get and set all the level 1 ancestors
        let lvl1Ancestors = _.filter(
          this.treeAncestors.descendants(),
          (ancs) => {
            return ancs.depth == 1;
          }
        );

        // root father and mother
        let rootFather,
          rootMother,
          rootParent,
          isTrueAncestor,
          ancstorIndexToMap,
          rootParentIndex,
          indexDifference;

        rootFather = _.find(lvl1Ancestors, (father) => {
          return father.data.id == this.data.fatherId;
        });

        rootMother = _.find(lvl1Ancestors, (mother) => {
          return mother.data.id == this.data.motherId;
        });

        if (rootFather) {
          isTrueAncestor = _.includes(
            rootFather.data._siblings,
            ancestor.data.id
          );
        }

        if (!isTrueAncestor && rootMother) {
          isTrueAncestor = _.includes(
            rootMother.data._siblings,
            ancestor.data.id
          );
        }

        rootParent = rootFather ? rootFather : rootMother;

        // set the ancestor index to map in respect to root parent
        // NOTE : in the case of spouse / non-true-ancestor
        // respective spouse / true ancestor index is considered

        if (isTrueAncestor) {
          ancstorIndexToMap = _.findIndex(lvl1Ancestors, (ancs) => {
            return ancs.data.id == ancestor.data.id;
          });
        } else {
          // find spouse / partner
          let ancestorSpouse = _.find(lvl1Ancestors, (ancs) => {
            return ancs.data.id == ancestor.data._partners[0];
          });

          ancstorIndexToMap = _.findIndex(lvl1Ancestors, (ancs) => {
            return ancs.data.id == ancestorSpouse.data.id;
          });
        }

        // root parent index
        rootParentIndex = _.findIndex(lvl1Ancestors, (ancs) => {
          return ancs.data.id == rootParent.data.id;
        });

        // calculate index difference
        indexDifference =
          rootParentIndex > ancstorIndexToMap
            ? rootParentIndex - ancstorIndexToMap
            : ancstorIndexToMap - rootParentIndex;

        // set new properties those will be
        // directly accesed by descendants of lvl 1
        // for factoring the respective adjustment calculations
        ancestor.indexDifference = indexDifference;
        ancestor.differenceFactor = 5;

        // decide whether to add up or reduce the difference
        let shouldAddUp;

        shouldAddUp = rootParent.x0 < ancestor.x0;

        let baseHeight = shouldAddUp
          ? this.nodeSize.height * 0.5 +
            ancestor.indexDifference * ancestor.differenceFactor
          : this.nodeSize.height * 0.5 -
            ancestor.indexDifference * ancestor.differenceFactor;

        // return
        return this.orientation.landscape ? `1px` : `${baseHeight}px`;
      })
      .style("width", (ancestor) => {
        if (_.isNull(ancestor.data.data)) return null;

        // mode : potrait
        if (this.orientation.potrait) {
          return `1px`;
        }

        // mode : landscape

        let width = 152;

        // re-calculate width based on 'indexDifference'
        // if 'indexDifference' available.
        if (_.has(ancestor, "indexDifference")) {
          width = width - ancestor.indexDifference * ancestor.differenceFactor;
        }

        // return
        return `${width}px`;
      });

    // child connector vertical
    let parentConnectorVertical = enter
      .append("div")
      .classed("connector-parent-vertical", true)
      .style("left", (ancestor) => {
        return this.orientation.potrait ? `50%` : null;
      })
      .style("right", (ancestor) => {
        return this.orientation.landscape ? `100%` : null;
      })
      .style("top", (ancestor) => {
        if (_.isNull(ancestor.data.data)) return null;

        // parent check
        let hasParentsArray = _.has(ancestor, "children");

        let hasParentsIds =
          !_.isNull(ancestor.data.fatherId) ||
          !_.isNull(ancestor.data.motherId);

        let hasParents = hasParentsArray || hasParentsIds;

        // if no height, return
        if (!hasParents) return null;

        return this.orientation.potrait
          ? `${-(this.nodeSize.height * 0.2)}px`
          : `50%`;
      })
      .style("width", (ancestor) => {
        if (_.isNull(ancestor.data.data)) return null;

        return this.orientation.potrait
          ? `2px`
          : `${this.nodeSize.width * 0.2}px`;
      })
      .style("height", (ancestor) => {
        if (_.isNull(ancestor.data.data)) return null;

        // parent check
        let hasParentsArray = _.has(ancestor, "children");

        let hasParentsIds =
          !_.isNull(ancestor.data.fatherId) ||
          !_.isNull(ancestor.data.motherId);

        let hasParents = hasParentsArray || hasParentsIds;

        if (!hasParents) return null;

        return this.orientation.potrait
          ? `${this.nodeSize.height * 0.2}px`
          : `2px`;
      });

    // parent (technically child) connector horizontal

    let isFatherSide, hasParents, xAxis, ancestorWidth, connectorWidth;

    let parentConnectorHorizontal = enter
      .append("div")
      .classed("connector-parent-horizontal", true)
      .style("top", (ancestor) => {
        if (_.isNull(ancestor.data.data)) return null;

        // parent check
        let hasParentsArray = _.has(ancestor, "children");

        let hasParentsIds =
          !_.isNull(ancestor.data.fatherId) ||
          !_.isNull(ancestor.data.motherId);

        let hasParents = hasParentsArray || hasParentsIds;

        if (!hasParents) return null;

        // ancestor father
        let ancestorFather = _.find(ancestor.descendants(), (parent) => {
          return parent.data.id == ancestor.data.fatherId;
        });

        // try finding the parents in other
        // siblings cuase the iterating or current
        // ancestor could be 'uncle', 'aunty', etc.
        if (!ancestorFather) {
          ancestorFather = this.treeAncestors.find((node) => {
            let isParent =
              node.data.id == ancestor.data.fatherId ||
              node.data.id == ancestor.data.motherId;
            return isParent;
          });
        }

        // id no parent found return null!
        if (!ancestorFather) return null;

        return this.orientation.potrait
          ? `${-(this.nodeSize.height * 0.21)}px`
          : ancestorFather && ancestor.x0 < ancestorFather.x0
          ? `50%`
          : null;
      })
      .style("bottom", (ancestor) => {
        if (_.isNull(ancestor.data.data)) return null;

        // parent check
        let hasParentsArray = _.has(ancestor, "children");

        let hasParentsIds =
          !_.isNull(ancestor.data.fatherId) ||
          !_.isNull(ancestor.data.motherId);

        let hasParents = hasParentsArray || hasParentsIds;

        if (!hasParents) return null;

        // ancestor father
        let ancestorFather = _.find(ancestor.descendants(), (parent) => {
          return parent.data.id == ancestor.data.fatherId;
        });

        // try finding the parents in other
        // siblings cuase the iterating or current
        // ancestor could be 'uncle', 'aunty', etc.
        if (!ancestorFather) {
          ancestorFather = this.treeAncestors.find((node) => {
            let isParent =
              node.data.id == ancestor.data.fatherId ||
              node.data.id == ancestor.data.motherId;
            return isParent;
          });
        }

        // id no parent found return null!
        if (!ancestorFather) return null;

        return this.orientation.landscape
          ? ancestorFather && ancestor.x0 > ancestorFather.x0
            ? `50%`
            : null
          : null;
      })
      // 'left' applicable to mother-side ancestors
      .style("left", (ancestor) => {
        if (_.isNull(ancestor.data.data) || this.orientation.landscape)
          return null;

        // child of iterating ancestor
        // or ancestor parent
        // parent check
        let hasParentsArray = _.has(ancestor, "children");

        let hasParentsIds =
          !_.isNull(ancestor.data.fatherId) ||
          !_.isNull(ancestor.data.motherId);

        let hasParents = hasParentsArray || hasParentsIds;

        if (!hasParents) return null;

        // ancestor parent
        let ancestorParent = _.find(ancestor.descendants(), (parent) => {
          return (
            parent.data.id == ancestor.data.fatherId ||
            parent.data.id == ancestor.data.motherId
          );
        });

        // try finding the parents in other
        // siblings cuase the iterating or current
        // ancestor could be 'uncle', 'aunty', etc.
        if (!ancestorParent) {
          ancestorParent = this.treeAncestors.find((node) => {
            let isParent =
              node.data.id == ancestor.data.fatherId ||
              node.data.id == ancestor.data.motherId;
            return isParent;
          });
        }

        // id no parent found return null!
        if (!ancestorParent) return null;

        let refWidth = this.nodeSize.width;

        // node additional space factor
        let widthFactor = refWidth * 0.15;

        let parentX =
          ancestorParent.data.data.gender == "male"
            ? ancestorParent.x0 + (refWidth + widthFactor)
            : ancestorParent.x0 - widthFactor;

        // child center x
        let childCX = ancestor.x0 + refWidth / 2;

        // right offset
        let leftOffset = refWidth / 2;

        // return
        return parentX > childCX ? `${leftOffset}px` : null;
      })
      .style("margin-left", (ancestor) => {
        if (_.isNull(ancestor.data.data) || this.orientation.potrait)
          return null;

        return `-${this.nodeSize.width * 0.2}px`;
      })
      // 'right' applicable to father-side ancestors
      .style("right", (ancestor) => {
        if (_.isNull(ancestor.data.data) || this.orientation.landscape)
          return null;

        // child of iterating ancestor
        // or ancestor parent
        // parent check
        let hasParentsArray = _.has(ancestor, "children");

        let hasParentsIds =
          !_.isNull(ancestor.data.fatherId) ||
          !_.isNull(ancestor.data.motherId);

        let hasParents = hasParentsArray || hasParentsIds;

        if (!hasParents) return null;

        // ancestor parent
        let ancestorParent = _.find(ancestor.descendants(), (parent) => {
          return (
            parent.data.id == ancestor.data.fatherId ||
            parent.data.id == ancestor.data.motherId
          );
        });

        // try finding the parents in other
        // siblings cuase the iterating or current
        // ancestor could be 'uncle', 'aunty', etc.
        if (!ancestorParent) {
          ancestorParent = this.treeAncestors.find((node) => {
            let isParent =
              node.data.id == ancestor.data.fatherId ||
              node.data.id == ancestor.data.motherId;
            return isParent;
          });
        }

        // id no parent found return null!
        if (!ancestorParent) return null;

        let refWidth = this.nodeSize.width;

        // node additional space factor
        let widthFactor = refWidth * 0.15;

        let parentX =
          ancestorParent.data.data.gender == "male"
            ? ancestorParent.x0 + (refWidth + widthFactor)
            : ancestorParent.x0 - widthFactor;

        // child center x
        let childCX = ancestor.x0 + refWidth / 2;

        // right offset
        let rightOffset = refWidth / 2;

        // return
        return parentX < childCX ? `${rightOffset}px` : null;
      })

      // calculate width
      .style("width", (ancestor) => {
        // mode : landscpae

        if (this.orientation.landscape) return `2px`;

        // mode : potrait

        // child of iterating ancestor
        // or ancestor parent
        // parent check
        let hasParentsArray = _.has(ancestor, "children");

        let hasParentsIds =
          !_.isNull(ancestor.data.fatherId) ||
          !_.isNull(ancestor.data.motherId);

        let hasParents = hasParentsArray || hasParentsIds;

        if (!hasParents) return null;

        // node width
        let refWidth = this.nodeSize.width;

        // node additional space factor
        let widthFactor = refWidth * 0.15;

        // **note**
        // technically, the ancestors are children!
        // for representational purpose, they are ancestors

        // ancestor father
        let ancestorFather = _.find(ancestor.descendants(), (p) => {
          return p.data.id == ancestor.data.fatherId;
        });

        // try finding the parents in other
        // siblings cuase the iterating or current
        // ancestor could be 'uncle', 'aunty', etc.
        if (!ancestorFather) {
          ancestorFather = this.treeAncestors.find((node) => {
            let isParent = node.data.id == ancestor.data.fatherId;
            return isParent;
          });
        }

        // ancestor mother
        let ancestorMother = _.find(ancestor.descendants(), (m) => {
          return m.data.id == ancestor.data.motherId;
        });

        // try finding the parents in other
        // siblings cuase the iterating or current
        // ancestor could be 'uncle', 'aunty', etc.
        if (!ancestorMother) {
          ancestorMother = this.treeAncestors.find((node) => {
            let isParent = node.data.id == ancestor.data.motherId;
            return isParent;
          });
        }

        // parent of iterating ancestor
        let parent = ancestorFather ? ancestorFather : ancestorMother;

        // parent x
        let parentX = parent && parent.x0 ? parent.x0 : 0;

        parentX =
          parent.data.data.gender == "male"
            ? parentX + refWidth + widthFactor
            : parentX - widthFactor;

        // child cx
        let childCX = ancestor.x0 + refWidth / 2;

        // distance
        let distance = parentX - childCX;

        // round the distance
        distance = _.round(Math.abs(distance));

        return `${distance}px`;
      })
      .style("height", (ancestor) => {
        // mode : potrait

        if (this.orientation.potrait) return `2px`;

        // mode : landscape

        // child of iterating ancestor
        // or ancestor parent
        // parent check

        let hasParentsIds =
          !_.isNull(ancestor.data.fatherId) ||
          !_.isNull(ancestor.data.motherId);

        let hasParents = hasParentsIds;

        if (!hasParents) return null;

        // **note**
        // technically, the ancestors are children!
        // for representational purpose, they are ancestors

        // ancestor father
        let ancestorFather = _.find(ancestor.descendants(), (p) => {
          return p.data.id == ancestor.data.fatherId;
        });

        // try finding the parents in other
        // siblings cuase the iterating or current
        // ancestor could be 'uncle', 'aunty', etc.
        if (!ancestorFather) {
          ancestorFather = this.treeAncestors.find((node) => {
            let isParent = node.data.id == ancestor.data.fatherId;
            return isParent;
          });
        }

        // ancestor mother
        let ancestorMother = _.find(ancestor.descendants(), (m) => {
          return m.data.id == ancestor.data.motherId;
        });

        // try finding the parents in other
        // siblings cuase the iterating or current
        // ancestor could be 'uncle', 'aunty', etc.
        if (!ancestorMother) {
          ancestorMother = this.treeAncestors.find((node) => {
            let isParent = node.data.id == ancestor.data.motherId;
            return isParent;
          });
        }

        // parent of iterating ancestor
        let parent = ancestorFather ? ancestorFather : ancestorMother;

        if (!parent) return null;

        let parentX, ancestorX, cardHeight, spouseConnectorHeight, distance;

        cardHeight = _.round(84); // ** note : hard coded!!

        spouseConnectorHeight = this.nodeSize.width * 0.2;

        ancestorX = parent.x0 + cardHeight + spouseConnectorHeight;

        parentX = ancestor.x0 + cardHeight / 2;

        distance = Math.abs(_.round(ancestorX - parentX));

        return `${distance}px`;
      });

    // exit and remove
    ancestorNodes.exit().remove();
  },

  // creates new x axis for ancestors
  // the original x axis is kept
  createX0: function (ancestors) {
    // depth map
    let depthMap = new Map();

    // father side or mother side
    let ancestorsCollection, root, isFatherSide;

    // populate map based on depths
    _.forEach(ancestors, (ancestor, key) => {
      // roots parent
      let rootsParent;

      // check  if has children property
      let hasChildrenProp = _.has(ancestor, "children");

      // ancestors collection
      ancestorsCollection = ancestor.ancestors();

      // find the root's parent
      // if the depth > 1
      if (ancestor.depth > 1) {
        rootsParent = _.nth(ancestorsCollection, -2);
      } else {
        let lvl1Ancestors = this.treeAncestors.children;

        let trueAncestors = _.filter(lvl1Ancestors, (lvl1Ancestor) => {
          // this.data === root user
          return (
            lvl1Ancestor.data.id == this.data.fatherId ||
            lvl1Ancestor.data.id == this.data.motherId
          );
        });

        rootsParent = _.find(trueAncestors, (trueAncestor) => {
          // get the index of trueAncestor
          let trueAncestorIndex = _.findIndex(lvl1Ancestors, (node) => {
            return node.data.id == trueAncestor.data.id;
          });

          // get the index of ancestor
          let ancestorIndex = _.findIndex(lvl1Ancestors, (node) => {
            return node.data.id == ancestor.data.id;
          });

          // when same indexes
          if (trueAncestorIndex == ancestorIndex) {
            return true;
          }
          // when not same indexes
          else {
            // if 'male' trueAncestor
            if (
              trueAncestor.data.data.gender == "male" &&
              trueAncestorIndex > ancestorIndex
            ) {
              return true;
            }

            // if 'female' trueAncestor
            if (
              trueAncestor.data.data.gender == "female" &&
              trueAncestorIndex < ancestorIndex
            ) {
              return true;
            }
          }
        });
      }

      // setup if father side
      isFatherSide = rootsParent.data.data.gender == "male";

      // if already the depth has been set
      if (depthMap.has(ancestor.depth)) {
        let depthCollection = depthMap.get(ancestor.depth);

        // push into father or mother side collection
        isFatherSide
          ? depthCollection.fatherSide.push(ancestor)
          : depthCollection.motherSide.push(ancestor);
      }
      // else create new mappable depth collection
      else {
        // acronyms for collections
        let msc = [],
          fsc = [];

        // push into father or mother side collection
        isFatherSide ? fsc.push(ancestor) : msc.push(ancestor);

        // set the map with new depth and push the ancestor
        depthMap.set(ancestor.depth, { fatherSide: fsc, motherSide: msc });
      }
    });

    let depth,
      fsgLength,
      msgLength,
      depthGeneration,
      x0,
      calculatedGenSeparator;

    let genSeparator = this.orientation.potrait
      ? this.nodeSize.width * 0.35
      : this.nodeSize.width * 0.35;
    let nodeSeparator = this.orientation.potrait
      ? this.nodeSize.width * 1.3
      : this.nodeSize.width * 0.98;

    // assign x0
    for (let depthEntry of depthMap.entries()) {
      // set base vars
      depth = depthEntry[0];
      depthGeneration = depthEntry[1];

      // set up collection lengths of each sides
      fsgLength = depthGeneration.fatherSide.length;
      msgLength = depthGeneration.motherSide.length;

      // reverse mother side collection for
      // easy x0 calculations
      depthGeneration.motherSide = _.reverse(depthGeneration.motherSide);

      // depth 1 genSeparator
      let depthOneGenSeparator = this.orientation.potrait
        ? this.nodeSize.width * 0.65
        : this.nodeSize.width * 0.49;
      //let depthOneGenSeparator = this.nodeSize.height * .35;

      calculatedGenSeparator =
        depth == 1 ? depthOneGenSeparator : genSeparator * depth;

      // father side x0
      _.forEach(depthGeneration.fatherSide, (ancestor, ancestorIndex) => {
        ancestorIndex = ancestorIndex + 1;

        x0 =
          calculatedGenSeparator + (fsgLength - ancestorIndex) * nodeSeparator;

        x0 = _.round(x0);

        ancestor.x0 = x0 * -1;
      });

      // mother side x0
      _.forEach(depthGeneration.motherSide, (ancestor, ancestorIndex) => {
        ancestorIndex = ancestorIndex + 1;

        x0 =
          calculatedGenSeparator + (msgLength - ancestorIndex) * nodeSeparator;

        x0 = _.round(x0);

        ancestor.x0 = x0;
      });
    }

    // return
    return ancestors;
  },

  // draw the descendants
  // for the given root ( for user )
  drawDescendants: function (descendantsTree) {
    // descendants
    let descendants = descendantsTree.descendants();

    // remove root and keep rest
    _.pullAt(descendants, 0);

    // centralize the root user below its parent
    // and shift rest of the descendants respectively
    descendants = this.updateDescendantsX(descendants);

    // update x for spouses
    descendants = this.updateDescendantsSpouseX(descendants);

    // create y0
    descendants = this.createY0(descendants);

    // create descendant nodes
    let descendantNodes = this.parent.selectAll(`.${this.descendantClass}`);

    // enter and append
    let enter = descendantNodes.data(descendants).enter();

    // append divs with person class
    enter = enter
      .append("div")
      .classed(this.descendantClass, true)
      .classed("male", (descendant) => {
        return (
          !_.isNull(descendant.data.data) &&
          descendant.data.data.gender == "male"
        );
      })
      .classed("female", (descendant) => {
        return (
          !_.isNull(descendant.data.data) &&
          descendant.data.data.gender == "female"
        );
      })
      .classed("root", (descendant) => {
        return descendant.data.id == this.treeDescendants.data.id;
      })
      .classed("blank", (descendant) => {
        return _.isNull(descendant.data.data.name);
      })
      .classed("deceased", (descendant) => {
        return !_.isNull(descendant.data.data.dod);
      })
      .classed("orientation-potrait", (ancestor) => {
        return this.orientation.potrait;
      })
      .classed("orientation-landscape", (ancestor) => {
        return this.orientation.landscape;
      })
      .attr("data-id", function (descendant) {
        return `${descendant.data.id}`;
      })
      .style("z-index", function (descendant) {
        let zIndex = 10;

        let isFemale, hasMultipleSpouses;

        // set if female
        isFemale = descendant.data.data.gender;

        // set if has multiple spouses
        hasMultipleSpouses = _.has(descendant.data, "_spouses")
          ? descendant.data._spouses.length > 1
          : false;

        // recalculate z-index
        zIndex = isFemale && hasMultipleSpouses ? zIndex / 2 : zIndex;

        return `${zIndex}`;
      })
      .on("click", function () {
        //$('#modal-bloodline').modal('show');
      });

    // assign top
    enter = enter.style("top", (descendant) => {
      let descX = _.round(descendant.x);
      let descY = _.round(descendant.y0);

      // orientation check!
      let personVerticalAxis = this.orientation.potrait ? descY : descX;

      return `${personVerticalAxis}px`;
    });

    // assign left
    enter = enter.style("left", (person) => {
      // orientation check!
      let personHorizontalAxis = this.orientation.potrait
        ? person.x
        : person.y0;
      return `${personHorizontalAxis}px`;
    });

    // external tree
    let externalTree = enter
      .filter((descendant) => {
        // filter children with extrernal tree
        return (
          _.has(descendant, "data.data.externalTreeId") &&
          !_.isNull(descendant.data.data.externalTreeId)
        );
      })
      .append("a")
      .attr("href", (descendant) => {
        let url = "http://localhost/xyz/";
        return `${url}${descendant.data.data.externalTreeId}`;
      })
      .classed("external-tree", true);

    let externalTreeCardConnector = externalTree
      .append("span")
      .classed("card-connector", true);

    let externalTreeNodeConnector = externalTree
      .append("span")
      .classed("node-connector", true);

    // avatar
    let avatar = enter
      .append("div")
      .classed("avatar", true)
      .style("background-image", (descendant) => {
        let maleAvatarUrl = "./images/male-user-avatar.png";
        let femaleAvatarUrl = "./images/female-user-avatar.png";

        let avatarUrl =
          !_.has(descendant.data.data, "avatar") ||
          _.isNull(descendant.data.data.avatar)
            ? descendant.data.data.gender == "male"
              ? maleAvatarUrl
              : femaleAvatarUrl
            : descendant.data.data.avatar;

        return `url('${avatarUrl}')`;
      });

    // content
    let content = enter.append("div").classed("content", true);

    // name
    let descendantName = content
      .append("h4")
      .classed("person-name", true)
      //.classed( 'text-truncate', true )
      .text((descendant) => {
        return !_.isNull(descendant.data.data) ? descendant.data.data.name : "";
      });

    // lifespan
    let lifespan = content.append("h6").classed("lifespan", true);

    // DOB and DOB
    let dob, dod;

    let lifespanDob = lifespan
      .append("span")
      .classed("dob", true)
      .text((descendant) => {
        if (
          _.isNull(descendant.data.data) ||
          _.isNull(descendant.data.data.dob)
        )
          return "";

        dob = new Date(descendant.data.data.dob);
        return `${dob.getFullYear()} - `;
      });

    let lifespanDod = lifespan
      .append("span")
      .classed("dod", true)
      .text((ancestor) => {
        if (!_.isNull(ancestor.data.data.dod)) {
          dod = new Date(ancestor.data.data.dod);
          return dod.getFullYear();
        } else if (
          _.isNull(ancestor.data.data) ||
          _.isNull(ancestor.data.data.dob)
        ) {
          return "";
        } else {
          return "living";
        }
      });

    // actions menu : edit and relations
    // let actions = content
    // 		.append('div')
    // 		.classed( 'actions', true );

    // let actionEdit = actions
    // 				.append('a')
    // 				.classed( 'action-edit', true )
    // 				.attr( 'id', descendant => {
    // 					return `action-${descendant.data.id}`;
    // 				})
    // 				.attr('data-id', function(descendant) {
    // 					return `${descendant.data.id}`;
    // 				})
    // 				.on( 'click', function () {
    // 				});

    // 				// action icon
    // 				actionEdit
    // 				.append('span')
    // 				.html( '&#43;' )
    // 				.on( 'click', () => {

    // 				});

    // let actionRelations = actions
    // 				.append('a')
    // 				.classed( 'action-relations', true )
    // 				.text('Relations')
    // 				.on( 'click', function () {
    // 					$('#modal-bloodline-relations').modal('show');
    // 				});

    // filter the children with spouse
    // and append div with spouse class
    let descendantsWithSpouses = enter
      .filter((descendant) => {
        // filter children with non empty spouses
        return (
          _.has(descendant, "data._spouses") &&
          !_.isEmpty(descendant.data._spouses)
        );
      })
      .append("div")
      .classed("spouse", true)
      .classed("male", (descendant) => {
        return descendant.data._spouses[0].data.gender == "male";
      })
      .classed("female", (descendant) => {
        return descendant.data._spouses[0].data.gender == "female";
      });

    // child connector
    let childConnector = enter
      .append("div")
      .classed("connector-child", true)
      .filter((descendant) => {
        // if id is not set, return false
        if (_.isNull(descendant.data.id)) return false;

        // find if the iterating descendant's
        // id has been mentioned as mother
        // or father id in rest of the descendants
        let descAsParent = _.find(descendants, (desc) => {
          return (
            desc.data.fatherId == descendant.data.id ||
            desc.data.motherId == descendant.data.id
          );
        });

        // convert to boolean and return
        return !!descAsParent;
        // return !_.has(descendant.data, 'trueChild')
        // && !_.isNull( descendant, 'data.id' )
        // && !_.isEmpty( descendant.data.children );
      })
      .style("top", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        return this.orientation.potrait
          ? `50%`
          : descendant.data.data.gender == "male"
          ? `100%`
          : null;
      })
      .style("margin-top", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        // default margin-top
        let marginTop = 0;
        let marginFactor = 10;

        let isTrueChild = !_.has(descendant.data, "trueChild");

        // return if true child
        if (this.orientation.potrait && isTrueChild) return `${marginTop}px`;

        // if spouse / non true child

        // find the descendants spouse
        let spouse, foundSpouse, descIndex;

        spouse = _.find(descendants, (desc) => {
          if (!_.has(desc.data, "_spouses")) return false;

          if (!desc.data._spouses.length) return false;

          foundSpouse = _.find(desc.data._spouses, (sps) => {
            return sps.id == descendant.data.id;
          });

          return !!foundSpouse;
        });

        // if no spouse found return null
        if (this.orientation.potrait && !spouse) return null;

        if (!!spouse) {
          descIndex = _.findIndex(spouse.data._spouses, (sps) => {
            return sps.id == descendant.data.id;
          });

          // calculate margin-top
          marginTop =
            descendant.data.data.gender == "male"
              ? (spouse.data._spouses.length - (descIndex + 1)) * marginFactor
              : descIndex * marginFactor;

          // create new property on descendant
          // that assigns this calculated marginTop
          // for the further applications
          // example, calculating height, etc.
          descendant.spouseFactor = marginTop;

          // return
          if (this.orientation.potrait) return `${descendant.spouseFactor}px`;
        }

        // mode landscape
        if (this.orientation.landscape) {
          return descendant.data.data.gender == "male"
            ? `${this.nodeSize.width * 0.2}px`
            : null;
        }
      })
      .style("bottom", (descendant) => {
        if (_.isNull(descendant.data.data) || this.orientation.potrait)
          return null;

        return descendant.data.data.gender == "female" ? `100%` : null;
      })
      .style("margin-bottom", (descendant) => {
        if (_.isNull(descendant.data.data) || this.orientation.potrait)
          return null;

        return descendant.data.data.gender == "female"
          ? `${this.nodeSize.width * 0.2}px`
          : null;
      })
      .style("right", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        return this.orientation.potrait
          ? descendant.data.data.gender == "male"
            ? `-${this.nodeSize.width * 0.15 + 1}px`
            : null
          : null;
      })
      .style("left", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        return this.orientation.potrait
          ? descendant.data.data.gender == "female"
            ? `-${this.nodeSize.width * 0.15 + 1}px`
            : null
          : `50%`;
      })
      .style("margin-left", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        // mode : potrait

        if (this.orientation.potrait) return null;

        // mode : landscape

        let marginLeft = 0;

        // calculated
        marginLeft = _.has(descendant, "spouseFactor")
          ? marginLeft + descendant.spouseFactor
          : marginLeft;

        // mode : landscape
        return `${marginLeft}px`;
      })
      .style("width", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        // mode : potrait
        if (this.orientation.potrait) return `2px`;

        // mode landscape

        // default width
        let width = 152;

        // update with the additional margin top factor
        width = _.has(descendant, "spouseFactor")
          ? width - descendant.spouseFactor - descendant.spouseFactor * 0.5
          : width;

        // return
        return `${width}px`;
      })
      .style("height", (descendant) => {
        // no data
        if (_.isNull(descendant.data.data)) return null;

        // mode : landscape
        if (this.orientation.landscape) return `2px`;

        // mode : potrait

        // default height
        let height = this.nodeSize.height * 0.5;

        // calculated height
        height = _.has(descendant, "spouseFactor")
          ? height - descendant.spouseFactor * 1.5
          : height;

        // mode : potrait
        return `${height}px`;
      });

    // spouse connectors
    // multiple spouse connectors, if any
    _.forEach(descendants, (descendant) => {
      // for true children/descendants
      if (
        _.has(descendant.data, "_spouses") &&
        !_.isEmpty(descendant.data._spouses) &&
        descendant.data._spouses.length > 1
      ) {
        // iterate the spouses
        _.forEach(descendant.data._spouses, (spouse) => {
          enter
            .filter((desc) => {
              return desc.data.id == descendant.data.id;
            })
            .append("div")
            .classed("connector-spouse", true)
            .style("top", (descendant) => {
              if (_.isNull(descendant.data.data)) return null;

              return this.orientation.potrait
                ? `50%`
                : descendant.data.data.gender == "male"
                ? `100%`
                : null;
            })
            .style("margin-top", (desc) => {
              if (_.isNull(descendant.data.data)) return null;

              if (this.orientation.potrait) {
                let iteratingSpouseIndex = _.findIndex(
                  descendant.data._spouses,
                  (sps) => {
                    return sps.id == spouse.id;
                  }
                );

                // here factor == 10
                return `${10 * iteratingSpouseIndex}px`;
              }
            })
            .style("bottom", (descendant) => {
              if (_.isNull(descendant.data.data)) return null;

              return this.orientation.landscape
                ? descendant.data.data.gender == "female"
                  ? `100%`
                  : null
                : null;
            })
            .style("right", (descendant) => {
              return !_.isNull(descendant.data.data) &&
                descendant.data.data.gender == "male"
                ? ""
                : "100%";
            })
            .style("left", (descendant) => {
              if (_.isNull(descendant.data.data)) return null;

              return this.orientation.landscape
                ? `50%`
                : descendant.data.data.gender == "male"
                ? "100%"
                : null;
            })
            .style("margin-left", (descendant) => {
              if (_.isNull(descendant.data.data) || this.orientation.potrait)
                return null;

              // mode : landscape
              let iteratingSpouseIndex = _.findIndex(
                descendant.data._spouses,
                (sps) => {
                  return sps.id == spouse.id;
                }
              );

              // here factor == 10
              return `${10 * iteratingSpouseIndex}px`;
            })
            .style("width", (desc) => {
              if (_.isNull(desc.data.data)) return null;

              let spouseIndex = _.findIndex(descendant.data._spouses, (sps) => {
                return sps.id == spouse.id;
              });

              let width = this.nodeSize.width * 0.15;

              let distanceFactor = this.nodeSize.width * 1.3 * spouseIndex;

              width = width + distanceFactor;

              return this.orientation.potrait ? `${width}px` : `3px`;
            })
            .style("height", (descendant) => {
              if (_.isNull(descendant.data.data)) return null;

              // mode : potrait

              if (this.orientation.potrait) return `3px`;

              // mode : landscape

              let spouseIndex = _.findIndex(descendant.data._spouses, (sps) => {
                return sps.id == spouse.id;
              });

              let cardHeight, spouseConnectorHeight, distanceFactor, height;

              spouseConnectorHeight = this.nodeSize.width * 0.2;

              cardHeight = 86;

              distanceFactor =
                cardHeight * (spouseIndex + 1) +
                spouseConnectorHeight *
                  (spouseIndex ? spouseIndex + 1 : spouseIndex);

              height = spouseConnectorHeight + distanceFactor;

              return `${height}px`;
            });
        });
      }
    });

    // spouse connector
    // single spouse connector , if any
    let spouseConnector = enter
      .filter((descendant) => {
        return (
          _.has(descendant, "data.trueChild") ||
          (_.has(descendant, "data._spouses") &&
            !_.isEmpty(descendant.data._spouses) &&
            descendant.data._spouses.length == 1)
        );
      })
      .append("div")
      .classed("connector-spouse", true)
      .style("top", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        return this.orientation.potrait
          ? `50%`
          : descendant.data.data.gender == "male"
          ? `100%`
          : null;
      })
      .style("margin-top", (desc) => {
        if (_.isNull(desc.data.data)) return null;

        if (this.orientation.potrait) {
          if (_.has(desc, "data.trueChild")) {
            // find spouse -> spouse
            let spouseToDesc = _.find(
              this.treeDescendants.descendants(),
              (spouseToFind) => {
                let found;

                if (
                  _.has(spouseToFind.data, "_spouses") &&
                  !_.isEmpty(spouseToFind.data._spouses)
                ) {
                  found = _.find(spouseToFind.data._spouses, (sps) => {
                    return sps.id == desc.data.id;
                  });
                }

                return found;
              }
            );

            // when spouse is found

            let descIndex, spousesCount;

            if (spouseToDesc) {
              // spouse count
              spousesCount = spouseToDesc.data._spouses.length;

              // index
              descIndex = _.findIndex(spouseToDesc.data._spouses, (sps) => {
                return sps.id == desc.data.id;
              });

              let calculatedTop;

              // for females
              if (desc.data.data.gender == "female") {
                calculatedTop = descIndex * 10;
              }

              // for males
              if (desc.data.data.gender == "male") {
                calculatedTop = (spousesCount - (descIndex + 1)) * 10;
              }

              return `${calculatedTop}px`;
            }
          }
        }
      })
      .style("bottom", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        return this.orientation.landscape
          ? descendant.data.data.gender == "female"
            ? `100%`
            : null
          : null;
      })
      .style("right", (descendant) => {
        return !_.isNull(descendant.data.data) &&
          descendant.data.data.gender == "male"
          ? ""
          : "100%";
      })
      .style("left", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        return this.orientation.landscape
          ? `50%`
          : descendant.data.data.gender == "male"
          ? "100%"
          : null;
      })
      .style("margin-left", (desc) => {
        if (_.isNull(desc.data.data) || this.orientation.potrait) return null;

        // mode : landscape

        if (_.has(desc, "data.trueChild")) {
          // find spouse -> spouse
          let spouseToDesc = _.find(
            this.treeDescendants.descendants(),
            (spouseToFind) => {
              let found;

              if (
                _.has(spouseToFind.data, "_spouses") &&
                !_.isEmpty(spouseToFind.data._spouses)
              ) {
                found = _.find(spouseToFind.data._spouses, (sps) => {
                  return sps.id == desc.data.id;
                });
              }

              return found;
            }
          );

          // when spouse is found

          let descIndex, spousesCount;

          if (spouseToDesc) {
            // spouse count
            spousesCount = spouseToDesc.data._spouses.length;

            // index
            descIndex = _.findIndex(spouseToDesc.data._spouses, (sps) => {
              return sps.id == desc.data.id;
            });

            let calculatedLeft;

            // for females
            if (desc.data.data.gender == "female") {
              calculatedLeft = descIndex * 10;
            }

            // for males
            if (desc.data.data.gender == "male") {
              calculatedLeft = (spousesCount - (descIndex + 1)) * 10;
            }

            return `${calculatedLeft}px`;
          }
        }
      })
      .style("width", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        return this.orientation.potrait
          ? `${this.nodeSize.width * 0.15}px`
          : `3px`;

        return;
      })
      .style("height", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        return this.orientation.potrait
          ? `3px`
          : `${this.nodeSize.width * 0.2 + 1}px`;
      });

    // child connector vertical
    let parentConnectorVertical = enter
      .append("div")
      .filter((descendant) => {
        // only true descendant + descendant with parent
        // gets the parent vertical connector
        let isTrueDescendant, hasParent;

        isTrueDescendant =
          descendant.depth && !_.has(descendant, "data.trueChild");

        hasParent =
          !_.isNull(descendant.data.fatherId) ||
          !_.isNull(descendant.data.motherId);

        return isTrueDescendant && hasParent;
      })
      .classed("connector-parent-vertical", true)
      .style("top", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        // mode : landscape
        if (this.orientation.landscape) return `50%`;

        // mode : potrait

        // if, lvl 1+
        if (descendant.depth > 1) return `${-(this.nodeSize.height * 0.2)}px`;

        // if, lvl 1

        let descFather, descMother, descParent, calculatedTop;

        // find father
        descFather = _.find(this.treeAncestors.descendants(), (parent) => {
          return parent.data.id == descendant.data.fatherId;
        });

        // find mother
        descMother = _.find(this.treeAncestors.descendants(), (parent) => {
          return parent.data.id == descendant.data.motherId;
        });

        // parent
        descParent = descFather ? descFather : descMother;

        // for real siblings
        calculatedTop = this.nodeSize.height * 0.2;

        // find if add or reduce the top

        let shouldAddUp, rootUser;

        rootUser = _.find(this.treeDescendants.descendants(), (d) => {
          return d.depth && d.data.id === this.data.id;
        });

        shouldAddUp = rootUser.x >= descendant.x;

        // re-calculate for cousins, etc
        if (
          _.has(descParent, "indexDifference") &&
          _.has(descParent, "differenceFactor")
        ) {
          calculatedTop = shouldAddUp
            ? calculatedTop +
              descParent.indexDifference * descParent.differenceFactor
            : calculatedTop -
              descParent.indexDifference * descParent.differenceFactor;
        }

        return `-${calculatedTop}px`;
      })
      .style("margin-top", (descendant) => {
        // mode : landscape
        if (this.orientation.landscape) return null;

        // mode : potrait

        // if depth == 1
        if (descendant.depth <= 1) return null;

        // get the parent of descendant
        let marginTop, parent, isParentFather, parentSpouseId, parentSpouse;

        parent = descendant.parent;

        isParentFather = parent.data.data.gender == "male";

        parentSpouseId = isParentFather
          ? descendant.data.motherId
          : descendant.data.fatherId;

        // if parentspouseId == null, return
        if (_.isNull(parentSpouseId)) return null;

        // find parent
        parentSpouse = _.find(descendants, (desc) => {
          return parentSpouseId == desc.data.id;
        });

        // return if no spouseFactor
        if (!_.has(parentSpouse, "spouseFactor")) return null;

        marginTop = parentSpouse.spouseFactor * 0.5;

        return `-${marginTop}px`;
      })
      .style("left", (descendant) => {
        return this.orientation.potrait ? `50%` : null;
      })
      .style("right", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        return this.orientation.landscape ? `100%` : null;
      })
      .style("height", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        // mode : ladnscape
        if (this.orientation.landscape) return `2px`;

        // mode : potrait

        // if, lvl 1+
        if (descendant.depth > 1) {
          // default height
          let height = this.nodeSize.height * 0.2;

          // get the parent of descendant
          let parent, isParentFather, parentSpouseId, parentSpouse;

          parent = descendant.parent;

          isParentFather = parent.data.data.gender == "male";

          parentSpouseId = isParentFather
            ? descendant.data.motherId
            : descendant.data.fatherId;

          // if parentspouseId == null, return
          if (_.isNull(parentSpouseId)) return null;

          // find parent
          parentSpouse = _.find(descendants, (desc) => {
            return parentSpouseId == desc.data.id;
          });

          // return if no spouseFactor
          if (!_.has(parentSpouse, "spouseFactor")) return null;

          height = height + parentSpouse.spouseFactor * 0.5;

          return `${height}px`;
        }

        // if, lvl 1

        let descFather, descMother, descParent, calculatedHeight;

        // find father
        descFather = _.find(this.treeAncestors.descendants(), (parent) => {
          return parent.data.id == descendant.data.fatherId;
        });

        // find mother
        descMother = _.find(this.treeAncestors.descendants(), (parent) => {
          return parent.data.id == descendant.data.motherId;
        });

        // parent
        descParent = descFather ? descFather : descMother;

        // for real siblings
        calculatedHeight = this.nodeSize.height * 0.2;

        // find if add or reduce the top

        let shouldAddUp, rootUser;

        rootUser = _.find(this.treeDescendants.descendants(), (d) => {
          return d.depth && d.data.id === this.data.id;
        });

        shouldAddUp = rootUser.x >= descendant.x;

        // re-calculate for cousins, etc
        if (
          _.has(descParent, "indexDifference") &&
          _.has(descParent, "differenceFactor")
        ) {
          calculatedHeight = shouldAddUp
            ? calculatedHeight +
              descParent.indexDifference * descParent.differenceFactor
            : calculatedHeight -
              descParent.indexDifference * descParent.differenceFactor;
        }

        return `${calculatedHeight}px`;
      })
      .style("width", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        // mode : potrait
        if (this.orientation.potrait) return `2px`;

        // mode : landscape

        // if, lvl 1+
        if (descendant.depth > 1) {
          // default height
          let width = this.nodeSize.width * 0.2;

          // get the parent of descendant
          let parent, isParentFather, parentSpouseId, parentSpouse;

          parent = descendant.parent;

          isParentFather = parent.data.data.gender == "male";

          parentSpouseId = isParentFather
            ? descendant.data.motherId
            : descendant.data.fatherId;

          // if parentspouseId == null, return
          if (_.isNull(parentSpouseId)) return null;

          // find parent
          parentSpouse = _.find(descendants, (desc) => {
            return parentSpouseId == desc.data.id;
          });

          // return if no spouseFactor
          if (!_.has(parentSpouse, "spouseFactor")) return null;

          width = width + parentSpouse.spouseFactor * 0.5;

          return `${width}px`;
        }

        // if, lvl 1

        let descFather, descMother, descParent, calculatedWidth;

        // find father
        descFather = _.find(this.treeAncestors.descendants(), (parent) => {
          return parent.data.id == descendant.data.fatherId;
        });

        // find mother
        descMother = _.find(this.treeAncestors.descendants(), (parent) => {
          return parent.data.id == descendant.data.motherId;
        });

        // parent
        descParent = descFather ? descFather : descMother;

        // for real siblings
        calculatedWidth = this.nodeSize.width * 0.2;

        // re-calculate for cousins, etc
        if (
          _.has(descParent, "indexDifference") &&
          _.has(descParent, "differenceFactor")
        ) {
          calculatedWidth =
            calculatedWidth +
            descParent.indexDifference * descParent.differenceFactor;
        }

        return `${calculatedWidth}px`;
      });

    // parent horizontl connector
    let parentConnectorHorizontal = enter
      .append("div")
      .filter((descendant) => {
        // only true descendant + descendant with parent
        // gets the parent horizontal connector
        let isTrueDescendant, hasParent;

        isTrueDescendant =
          descendant.depth && !_.has(descendant, "data.trueChild");

        hasParent =
          !_.isNull(descendant.data.fatherId) ||
          !_.isNull(descendant.data.motherId);

        return isTrueDescendant && hasParent;
      })
      .classed("connector-parent-horizontal", true)
      .style("top", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        // mode : landscape

        if (this.orientation.landscape && descendant.depth) {
          // card height
          let cardHeight = 86;

          let descFather, descMother, descParent, descParentY, descY, ancestors;

          // set ancestors based on descendant level
          ancestors =
            descendant.depth == 1
              ? this.treeAncestors.descendants()
              : this.treeDescendants.descendants();

          // find father
          descFather = _.find(ancestors, (parent) => {
            return parent.depth && parent.data.id == descendant.data.fatherId;
          });

          // find mother
          descMother = _.find(ancestors, (parent) => {
            return parent.depth && parent.data.id == descendant.data.motherId;
          });

          // parent
          descParent = descFather ? descFather : descMother;

          // set if the found parent isfather or mother
          let isParentFather = descParent.data.data.gender == "male";

          // if parent has spouse
          if (_.has(descParent.data, "_spouses")) {
            // set the parent's spouse
            let parentSpouseId, parentSpouse;

            parentSpouseId = isParentFather
              ? descendant.data.motherId
              : descendant.data.fatherId;

            if (!_.isNull(parentSpouseId)) {
              // find the parentSpouse from the descendants
              parentSpouse = _.find(descendants, (ps) => {
                return ps.data.id == parentSpouseId;
              });

              // re-assign parent
              descParent = parentSpouse ? parentSpouse : descParent;
            }
          }

          // parent y
          descParentY = _.has(descParent, "x0") ? descParent.x0 : descParent.x;

          // re-calculate parent y
          descParentY =
            descParent.data.data.gender == "male"
              ? descParentY + cardHeight + this.nodeSize.width * 0.2
              : descParentY - this.nodeSize.width * 0.2;

          // descendant Y
          descY = descendant.x + cardHeight / 2;

          // return
          return descParentY > descY ? `50%` : null;
        }

        // mode : potrait

        if (this.orientation.potrait && descendant.depth) {
          // if, lvl 1+
          if (descendant.depth > 1) return `${-(this.nodeSize.height * 0.2)}px`;

          // if, lvl 1

          let descFather, descMother, descParent, calculatedTop;

          // find father
          descFather = _.find(this.treeAncestors.descendants(), (parent) => {
            return parent.data.id == descendant.data.fatherId;
          });

          // find mother
          descMother = _.find(this.treeAncestors.descendants(), (parent) => {
            return parent.data.id == descendant.data.motherId;
          });

          // parent
          descParent = descFather ? descFather : descMother;

          // for real siblings
          calculatedTop = this.nodeSize.height * 0.2;

          // find if add or reduce the top

          let shouldAddUp, rootUser;

          rootUser = _.find(this.treeDescendants.descendants(), (d) => {
            return d.depth && d.data.id === this.data.id;
          });

          shouldAddUp = rootUser.x >= descendant.x;

          // re-calculate for cousins, etc
          if (
            _.has(descParent, "indexDifference") &&
            _.has(descParent, "differenceFactor")
          ) {
            calculatedTop = shouldAddUp
              ? calculatedTop +
                descParent.indexDifference * descParent.differenceFactor
              : calculatedTop -
                descParent.indexDifference * descParent.differenceFactor;
          }

          return `-${calculatedTop}px`;
        }
      })
      .style("margin-top", (descendant) => {
        // mode : landscape
        if (this.orientation.landscape) return null;

        // mode : potrait

        // if depth == 1
        if (descendant.depth <= 1) return null;

        // get the parent of descendant
        let marginTop, parent, isParentFather, parentSpouseId, parentSpouse;

        parent = descendant.parent;

        isParentFather = parent.data.data.gender == "male";

        parentSpouseId = isParentFather
          ? descendant.data.motherId
          : descendant.data.fatherId;

        // if parentspouseId == null, return
        if (_.isNull(parentSpouseId)) return null;

        // find parent
        parentSpouse = _.find(descendants, (desc) => {
          return parentSpouseId == desc.data.id;
        });

        // return if no spouseFactor
        if (!_.has(parentSpouse, "spouseFactor")) return null;

        marginTop = parentSpouse.spouseFactor * 0.5;

        return `-${marginTop}px`;
      })
      .style("bottom", (descendant) => {
        if (
          _.isNull(descendant.data.data) ||
          this.orientation.potrait ||
          !descendant.depth
        )
          return null;

        // mode : landscape

        // card height
        let cardHeight = 86;

        let descFather, descMother, descParent, descParentY, descY, ancestors;

        // set ancestors based on descendant level
        ancestors =
          descendant.depth == 1
            ? this.treeAncestors.descendants()
            : this.treeDescendants.descendants();

        // find father
        descFather = _.find(ancestors, (parent) => {
          return parent.data.id == descendant.data.fatherId;
        });

        // find mother
        descMother = _.find(ancestors, (parent) => {
          return parent.data.id == descendant.data.motherId;
        });

        // parent
        descParent = descFather ? descFather : descMother;

        // set if the found parent isfather or mother
        let isParentFather = descParent.data.data.gender == "male";

        // if parent has spouse
        if (_.has(descParent.data, "_spouses")) {
          // set the parent's spouse
          let parentSpouseId, parentSpouse;

          parentSpouseId = isParentFather
            ? descendant.data.motherId
            : descendant.data.fatherId;

          if (!_.isNull(parentSpouseId)) {
            // find the parentSpouse from the descendants
            parentSpouse = _.find(descendants, (ps) => {
              return ps.data.id == parentSpouseId;
            });

            // re-assign parent
            descParent = parentSpouse ? parentSpouse : descParent;
          }
        }

        // parent x
        descParentY = _.has(descParent, "x0") ? descParent.x0 : descParent.x;

        // re-calculate parent x
        descParentY =
          descParent.data.data.gender == "male"
            ? descParentY + cardHeight + this.nodeSize.width * 0.2
            : descParentY - this.nodeSize.width * 0.2;

        // round
        descParentY = _.round(descParentY);

        // descendant X
        descY = _.round(descendant.x + cardHeight / 2);

        // return
        return descParentY < descY ? `50%` : null;
      })
      .style("height", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        // mode : potrait

        if (this.orientation.potrait) return `2px`;

        // mode landscape

        let cardHeight = 86;

        let descFather,
          descMother,
          descParent,
          descParentY,
          descY,
          ancestors,
          distance;

        // set ancestors based on descendant level
        ancestors =
          descendant.depth == 1
            ? this.treeAncestors.descendants()
            : this.treeDescendants.descendants();

        // find father
        descFather = _.find(ancestors, (parent) => {
          return parent.depth && parent.data.id == descendant.data.fatherId;
        });

        // find mother
        descMother = _.find(ancestors, (parent) => {
          return parent.depth && parent.data.id == descendant.data.motherId;
        });

        // parent
        descParent = descFather ? descFather : descMother;

        // set if the found parent isfather or mother
        let isParentFather = descParent.data.data.gender == "male";

        // if parent has spouse
        if (_.has(descParent.data, "_spouses")) {
          // set the parent's spouse
          let parentSpouseId, parentSpouse;

          parentSpouseId = isParentFather
            ? descendant.data.motherId
            : descendant.data.fatherId;

          if (!_.isNull(parentSpouseId)) {
            // find the parentSpouse from the descendants
            parentSpouse = _.find(descendants, (ps) => {
              return ps.data.id == parentSpouseId;
            });

            // re-assign parent
            descParent = parentSpouse ? parentSpouse : descParent;
          }
        }

        // parent x
        descParentY = _.has(descParent, "x0") ? descParent.x0 : descParent.x;

        // re-calculate parent x
        descParentY =
          descParent.data.data.gender == "male"
            ? descParentY + cardHeight + this.nodeSize.width * 0.2
            : descParentY - this.nodeSize.width * 0.2;

        // descendant X
        descY = _.round(descendant.x + cardHeight / 2);

        // distance
        distance = Math.abs(descParentY - descY);

        // return
        return `${distance}px`;
      })
      .style("width", (descendant) => {
        if (_.isNull(descendant.data.data)) return null;

        if (bloodline.orientation.landscape) return `2px`;

        // parent of iterating descendant check

        let hasParentsArray = _.has(descendant, "parent");

        let hasParentsIds =
          !_.isNull(descendant.data.fatherId) ||
          !_.isNull(descendant.data.motherId);

        let hasParents = hasParentsArray || hasParentsIds;

        if (!hasParents) return null;

        // try finding the parents of the
        // depth 1 children in the ancestors

        let parent;

        if (descendant.depth <= 1) {
          parent = this.treeAncestors.find((node) => {
            return (
              node.data.id == descendant.data.fatherId ||
              node.data.id == descendant.data.motherId
            );
          });
        } else {
          parent = _.find(descendant.ancestors(), (parent) => {
            return (
              (parent.depth && parent.data.id == descendant.data.fatherId) ||
              parent.data.id == descendant.data.motherId
            );
          });
        }

        // id no parent found return null!
        if (!parent) return null;

        // set if the found parent isfather or mother
        let isParentFather = parent.data.data.gender == "male";

        // if parent has spouse
        if (_.has(parent.data, "_spouses")) {
          // set the parent's spouse
          let parentSpouseId, parentSpouse;

          parentSpouseId = isParentFather
            ? descendant.data.motherId
            : descendant.data.fatherId;

          if (!_.isNull(parentSpouseId)) {
            // find the parentSpouse from the descendants
            parentSpouse = _.find(descendants, (ps) => {
              return ps.data.id == parentSpouseId;
            });

            // re-assign parent
            parent = parentSpouse ? parentSpouse : parent;
          }
        }

        // node width for reference
        let refWidth = this.nodeSize.width;

        // if the descendants parent id root or has depth == 0
        //refWidth = descendant.parent.depth > 0 ? refWidth : 0;

        // node additional space factor
        let widthFactor = refWidth * 0.15;

        // parentCX
        let parentCX =
          parent.data.data.gender == "male"
            ? _.has(parent, "x0")
              ? parent.x0 + (refWidth + widthFactor)
              : parent.x + (refWidth + widthFactor)
            : _.has(parent, "x0")
            ? parent.x0 - widthFactor
            : parent.x - widthFactor;

        // child/descendant CX
        let childCX = descendant.x + refWidth / 2;

        // distance == difference
        let distance = Math.abs(parentCX - childCX);

        // round the distance
        distance = _.round(distance);

        // return
        return `${distance}px`;
      })
      .style("left", (descendant) => {
        if (_.isNull(descendant.data.data) || this.orientation.landscape)
          return null;

        // mode : potrait

        // parent of iterating descendant check

        let hasParentsArray = _.has(descendant, "parent");

        let hasParentsIds =
          !_.isNull(descendant.data.fatherId) ||
          !_.isNull(descendant.data.motherId);

        let hasParents = hasParentsArray || hasParentsIds;

        if (!hasParents) return null;

        // try finding the parents of the
        // depth 1 children in the ancestors

        let parent;

        if (descendant.depth <= 1) {
          parent = this.treeAncestors.find((node) => {
            return (
              node.data.id == descendant.data.fatherId ||
              node.data.id == descendant.data.motherId
            );
          });
        } else {
          let isParentFather, mapToParentSpouse, parentSpouseId, parentSpouse;

          // default
          parent = descendant.parent;

          // if both the parent are given
          // map to parent spouse
          mapToParentSpouse =
            !_.isNull(descendant.data.fatherId) &&
            !_.isNull(descendant.data.motherId);

          if (mapToParentSpouse) {
            isParentFather = parent.data.data.gender == "male";

            parentSpouseId = isParentFather
              ? descendant.data.motherId
              : descendant.data.fatherId;

            parentSpouse = _.find(descendants, (sps) => {
              return sps.data.id == parentSpouseId;
            });
          }

          //  re-assign
          parent = parentSpouse ? parentSpouse : parent;
        }

        // id no parent found return null!
        if (!parent) return null;

        let parentX = _.has(parent, "x0")
          ? _.round(parent.x0)
          : _.round(parent.x);

        let childX = _.round(descendant.x);

        // update parentX
        parentX =
          parent.data.data.gender == "male"
            ? parentX + this.nodeSize.width + this.nodeSize.width * 0.15
            : parentX - this.nodeSize.width * 0.15;

        // update childX
        childX = childX + this.nodeSize.width / 2;

        // if parentX and childX are same!
        if (parentX == childX && parent.data.data.gender == "female") {
          return `${this.nodeSize.width / 2}px`;
        }

        return parentX > childX ? `${this.nodeSize.width / 2}px` : null;
      })
      .style("right", (descendant) => {
        // no data
        if (_.isNull(descendant.data.data)) return null;

        // mode : landscape
        if (this.orientation.landscape) return `100%`;

        // mode : potrait

        // parent of iterating descendant check

        let hasParentsArray = _.has(descendant, "parent");

        let hasParentsIds =
          !_.isNull(descendant.data.fatherId) ||
          !_.isNull(descendant.data.motherId);

        let hasParents = hasParentsArray || hasParentsIds;

        if (!hasParents) return null;

        // try finding the parents of the
        // depth 1 children in the ancestors

        let parent;

        if (descendant.depth <= 1) {
          parent = this.treeAncestors.find((node) => {
            return (
              node.data.id == descendant.data.fatherId ||
              node.data.id == descendant.data.motherId
            );
          });
        } else {
          let isParentFather, mapToParentSpouse, parentSpouseId, parentSpouse;

          // default
          parent = descendant.parent;

          // if both the parent are given
          // map to parent spouse
          mapToParentSpouse =
            !_.isNull(descendant.data.fatherId) &&
            !_.isNull(descendant.data.motherId);

          if (mapToParentSpouse) {
            isParentFather = parent.data.data.gender == "male";

            parentSpouseId = isParentFather
              ? descendant.data.motherId
              : descendant.data.fatherId;

            parentSpouse = _.find(descendants, (sps) => {
              return sps.data.id == parentSpouseId;
            });
          }

          //  re-assign
          parent = parentSpouse ? parentSpouse : parent;
        }

        // id no parent found return null!
        if (!parent) return null;

        let parentX = _.has(parent, "x0")
          ? _.round(parent.x0)
          : _.round(parent.x);

        let childX = _.round(descendant.x);

        // update parentX
        parentX =
          parent.data.data.gender == "male"
            ? parentX + this.nodeSize.width + this.nodeSize.width * 0.15
            : parentX - this.nodeSize.width * 0.15;

        // update childX
        childX = childX + this.nodeSize.width / 2;

        // if parentX and childX are same!
        if (parentX == childX && parent.data.data.gender == "male") {
          return `${this.nodeSize.width / 2}px`;
        }

        return parentX < childX ? `${this.nodeSize.width / 2}px` : null;
      })
      .style("margin-right", (descendant) => {
        if (_.isNull(descendant.data.data) || this.orientation.potrait)
          return null;

        // mode : landscape

        // if, lvl 1+
        if (descendant.depth > 1) {
          // default height
          let width = this.nodeSize.width * 0.2;

          // get the parent of descendant
          let parent, isParentFather, parentSpouseId, parentSpouse;

          parent = descendant.parent;

          isParentFather = parent.data.data.gender == "male";

          parentSpouseId = isParentFather
            ? descendant.data.motherId
            : descendant.data.fatherId;

          // if parentspouseId == null, return
          if (_.isNull(parentSpouseId)) return null;

          // find parent
          parentSpouse = _.find(descendants, (desc) => {
            return parentSpouseId == desc.data.id;
          });

          // return if no spouseFactor
          if (!_.has(parentSpouse, "spouseFactor")) return null;

          width = width + parentSpouse.spouseFactor * 0.5;

          return `${width}px`;
        }

        // if, lvl 1

        let descFather, descMother, descParent, marginRight;

        // find father
        descFather = _.find(this.treeAncestors.descendants(), (parent) => {
          return parent.data.id == descendant.data.fatherId;
        });

        // find mother
        descMother = _.find(this.treeAncestors.descendants(), (parent) => {
          return parent.data.id == descendant.data.motherId;
        });

        // parent
        descParent = descFather ? descFather : descMother;

        // for real siblings
        marginRight = this.nodeSize.width * 0.2;

        // re-calculate for cousins, etc
        if (
          _.has(descParent, "indexDifference") &&
          _.has(descParent, "differenceFactor")
        ) {
          marginRight =
            marginRight +
            descParent.indexDifference * descParent.differenceFactor;
        }

        return `${marginRight}px`;
      });

    // exit and remove
    descendantNodes.exit().remove();
  },

  // creates new y axis for descendants
  // the original y axis is kept
  createY0: function (descendants) {
    descendants = _.map(descendants, (descendant) => {
      // assign parent's y cordinate
      // to iterating descendant
      descendant.y0 = descendant.parent.y;
      // return
      return descendant;
    });

    return descendants;
  },

  // update x for all descendants
  // this is to centralize the tree
  // from descendants perspective
  // note : this function brings root ser to '0' x-cordinate

  updateDescendantsX: function (descendants) {
    // get the current/default distance
    // of the root user from 0 x axis position

    // first find the root user
    let rootUser, rootUserX, isLeftShift;

    rootUser = _.find(descendants, (desc) => {
      return this.data.id === desc.data.id;
    });

    // rootUserX value is used to update the current
    // x vlaues of the descendants
    rootUserX = Math.abs(_.round(rootUser.x));

    // set whether to shift left / right
    isLeftShift = _.round(rootUser.x) > 0;

    // update all x values
    descendants = _.map(descendants, (desc) => {
      // update x based on shift
      desc.x = isLeftShift ? desc.x - rootUserX : desc.x + rootUserX;

      return desc;
    });

    // return
    return descendants;
  },

  // update the x
  // only for the descendants who are spouses
  updateDescendantsSpouseX: function (descendants) {
    descendants = _.map(descendants, (descendant) => {
      // if the descendant is spouse or not a true child
      if (_.has(descendant.data, "trueChild") && !descendant.data.trueChild) {
        // find spouses -> spouse
        let descendantsSpouse = _.find(descendants, (descendantToFind) => {
          if (_.has(descendantToFind.data, "_spouses")) {
            // find in the spouses collection
            let foundSpouse = _.find(
              descendantToFind.data._spouses,
              (spouse) => {
                return spouse.id == descendant.data.id;
              }
            );

            return !!foundSpouse;
          }

          return false;
        });

        // set following
        // the indexes for spouse and spouse -> spouse
        // difference of the set indexes
        let nonTrueChildIndex, trueChildIndex, indexDifference;

        // get the indexes for spouse and spouse -> spouse
        if (descendantsSpouse) {
          nonTrueChildIndex = _.findIndex(descendants, (nonTrueChild) => {
            return nonTrueChild.data.id == descendant.data.id;
          });

          trueChildIndex = _.findIndex(descendants, (trueChild) => {
            return trueChild.data.id == descendantsSpouse.data.id;
          });
        }

        let cardHeight = 87; // for landscape mode

        // if the descendantsSpouse is 'male'
        // update the descendants X
        if (descendantsSpouse && descendantsSpouse.data.data.gender == "male") {
          // difference
          indexDifference = nonTrueChildIndex - trueChildIndex;

          // re-calculate based on node width
          indexDifference = this.orientation.potrait
            ? (this.nodeSize.width + this.nodeSize.width * 0.3) *
              indexDifference
            : (cardHeight + this.nodeSize.width * 0.4) * indexDifference;

          // expected x
          let xToBe = descendantsSpouse.x + indexDifference;

          // update the x, only if the current
          // descendant x varies from 'xToBe'
          descendant.x = descendant.x != xToBe ? xToBe : descendant.x;
        }

        // if the descendantsSpouse is 'female'
        // update the descendants X
        if (
          descendantsSpouse &&
          descendantsSpouse.data.data.gender == "female"
        ) {
          // difference
          indexDifference = trueChildIndex - nonTrueChildIndex;

          // re-calculate based on node width
          indexDifference = this.orientation.potrait
            ? (this.nodeSize.width + this.nodeSize.width * 0.3) *
              indexDifference
            : (cardHeight + this.nodeSize.width * 0.4) * indexDifference;

          // expected x
          let xToBe = descendantsSpouse.x - indexDifference;

          // update the x, only if the current
          // descendant x varies from 'xToBe'
          descendant.x = descendant.x != xToBe ? xToBe : descendant.x;
        }
      }

      // return
      return descendant;
    });

    return descendants;
  },
};

export { bloodline };
