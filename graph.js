function Vertex(dependencies, calculationFunction) {
  this.dependencies = dependencies;
  this.calculationFunction = calculationFunction;
}

var graph = {
  'xs' : new Vertex([], () => [1, 1, 1, 2, 2, 2]),

  'n' : new Vertex(['xs'], xs => xs.length),

  'm' : new Vertex(['xs', 'n'], (xs, n) => {
      var sum = 0;
      xs.forEach(x => sum += x);
      return sum / n;
  }),

  'm2' : new Vertex(['xs', 'n'], (xs, n) => {
      var sum = 0;
      xs.forEach(x => sum += x*x);
      return sum / n;
  }),

  'v' : new Vertex(['m', 'm2'], (m, m2) => m2 - m * m)
}

function lazyCalc(graph, nodeNames) {
  var nodeStack = [];
  var nodeValues = {};

  function lazyCalcOneNode(graph, nodeName) {
    if (nodeName in nodeValues) {
      return nodeValues[nodeName];
    }

    if (nodeStack.indexOf(nodeName) != -1) {
      throw new Error("Cycle with" + nodeName);
    }

    nodeStack.push(nodeName);
    const node = graph[nodeName];

    if (node.dependencies.length === 0) {
      nodeStack.splice(nodeName, 1);
      nodeValues[nodeName] = node.calculationFunction();
      return nodeValues[nodeName];
    }

    var dependencies = [];
    node.dependencies.forEach((subNode) => dependencies.push(lazyCalcOneNode(graph, subNode)));

    nodeStack.splice(nodeName, 1);
    nodeValues[nodeName] = node.calculationFunction.apply(this, dependencies);
    return nodeValues[nodeName];
  }

  results = {};
  nodeNames.forEach(nodeName => (results[nodeName] = lazyCalcOneNode(graph, nodeName)));
  return results;
}

function calc(graph) {
  return lazyCalc(graph, Object.keys(graph));
}

console.log(lazyCalc(graph, ['m2', 'n']));
console.log(calc(graph))
