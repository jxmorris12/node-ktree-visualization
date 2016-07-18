// JACK MORRIS 07/17/16
console.log('LOADED APP.JS');

var CIRCLE_RAD   = 5;
var CIRCLE_SCALE = 1;

var DEFAULT_OPACITY = 0.75;
var OPACITY_SCALE   = 0.75;

var NODE_DENSITY  = 1/10000.;
var NUM_NEIGHBORS = 5;

var MAX_DEPTH = 1;

var tree , nodes ;

var distance = function(a, b){
  return Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2);
} ;

var main = function () {
  var w = $('body') . width() ;
  var h = $('body') . height();

  // create nodes
  var NUM_NODES = parseInt( Math.round( w * h * NODE_DENSITY  ) );
  nodes = [] ;
  for(var i = 0; i < NUM_NODES; i++) {
    var node = {};
    node["x"] = parseInt( Math.random() * w ) ;
    node["y"] = parseInt( Math.random() * h ) ;
    node["tag"] = i; // tag
    nodes.push(node);
  }
  // add to ktree
  tree = new kdTree(nodes, distance, [ "x", "y" ] );
  // add nodes to DOM
  d3.select('svg')
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr('class','hidden') // hide all on default
    .attr('cx',  function(d) { return d.x; })
    .attr('cy',  function(d) { return d.y; })
    .attr('tag', function(d) { return d.tag; })
    .attr('r', CIRCLE_RAD);
  // set hover method
  $('svg').mousemove( onMouseMove );
  // set resize method
  $('svg').mousemove( onMouseMove );
} ;

var onMouseMove = function (event) {
  // reset all circle attrs
  d3.select('svg').selectAll('circle')
    .attr('visited', false)
    .attr('class','hidden')
    .attr('opacity', DEFAULT_OPACITY)
    .attr('r', CIRCLE_RAD);
  // remove all previous lines
  d3.select('svg').selectAll('line').remove();
  // get mouse coords
  var mousePoint = { "x": event.pageX, "y": event.pageY };
  // recur node color
  tagNodesAtPointAndDepth( mousePoint, 0 );
}

var tagNodesAtPointAndDepth = function(point, depth) {
  // base case
  if( depth > MAX_DEPTH ) return;
  // find closest point
  var closestNode = tree.nearest( point, 1 ) [0] [0];
  console.log('closestNode:',closestNode);
  // enlarge closest point
  var closestCircle = $('circle[tag=' + closestNode.tag + ']');
  closestCircle
    .attr('visited',true)
    .attr('class', 'shown')
    .attr('opacity', closestCircle.attr('opacity') * OPACITY_SCALE)
    .attr('r', CIRCLE_RAD * CIRCLE_SCALE );
  // find nbrs
  NUM_NEIGHBORS = Math.min( nodes.length - 1, NUM_NEIGHBORS );
  var closestNeighbors = tree.nearest( point, NUM_NEIGHBORS + 1 ).splice(0, NUM_NEIGHBORS);
  var closestNeighborNodes = closestNeighbors.map(function(x) { return x[0]; } );
  console.log('closestNeighborNodes:',closestNeighborNodes);
  // draw lines
  d3.select('svg')
    .selectAll("line[class=doesnotexist]") // fix this later
    .data(closestNeighborNodes)
    .enter()
    .append("line")
    .attr('opacity', closestCircle.attr('opacity') * Math.pow(OPACITY_SCALE,2) )
    .attr('x1', function(d) { return d.x; })
    .attr('y1', function(d) { return d.y; })
    .attr('x2', function(d) { return closestNode.x; })
    .attr('y2', function(d) { return closestNode.y; });
  // enlarge neighbors
  closestNeighborNodes.forEach(function(closestNeighborNode) {
    // TAG
    $('circle[tag=' + closestNeighborNode.tag + '][visited=false]')
      .attr('class','shown')
      .attr('opacity', closestCircle.attr('opacity') * Math.pow(OPACITY_SCALE,2) )
      .attr('r', CIRCLE_RAD );
    // recur
    var closestNeighborPoint = {"x": closestNeighborNode.x, "y": closestNeighborNode.y };
    tagNodesAtPointAndDepth(closestNeighborPoint, depth + 1);
  });
};
$(document).ready(main);
