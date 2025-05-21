var container = document.getElementById("container");
var nodeCount = 0;
var connectBool = 0;
var lastSource;
// Track actionHistory for undo functionality
var actionHistory = [];
// Add a graph object to store the network
var graph = {};

function check() {
  if (document.documentElement.scrollTop != 0) {
    window.scrollTo(0, 0);
    return;
  }
  var x = event.clientX;
  var y = event.clientY;
  var source = document.elementFromPoint(x, y);
  console.log(source)
  if (source.classList == "") {
    if (lastSource && lastSource.classList.contains("active")) {
      lastSource.classList.remove("active");
      connectBool = 0;
    } else if (lastSource != source) {
      createNode()
      nodeCount++
    }
  } else {
    if (connectBool == 1 && source.classList != "" && lastSource.classList != "" && lastSource != source) {
      lastSource.classList.remove("active");
      var connection = document.createElement("connection")
      connection.setAttribute("from", "#" + lastSource.id);
      connection.setAttribute("to", "#" + source.id);
      connection.setAttributeNode(document.createAttribute("tail"));
      container.appendChild(connection);
      var input = document.createElement("input")
      input.type = "number";
      input.min = 0;
      input.classList.add("cost")
      input.id = lastSource.id + "-" + source.id;
      input.placeholder = lastSource.id + " > " + source.id;
      input.setAttribute("from", lastSource.id);
      input.setAttribute("to", source.id);
      input.setAttribute("line", document.getElementsByClassName("line").length)
      input.setAttribute("onChange", "updatePath(" + document.getElementsByClassName('line').length + ")")
      document.getElementById("inputs").appendChild(input);
      lastSource.classList.remove("active");
      connectBool = 0;
      
      // Track this connection in actionHistory
      actionHistory.push({type: 'connection', connection: connection, input: input});
    } else {
      lastSource = document.elementFromPoint(x, y);
      if (lastSource.classList != "") {
        lastSource.classList.add("active");
        connectBool = 1;
      }
    }
  }
}
function updatePath(num) {
  document.getElementsByClassName("line")[num].firstChild.innerHTML = "<span>" + document.getElementsByTagName('input')[num].value + "</span>";
}

function createNode() {
  var newDiv = document.createElement("div");
  newDiv.classList = "node";
  newDiv.innerText = nodeCount;
  newDiv.id = "node" + nodeCount;
  newDiv.style.top = event.clientY - container.offsetTop - 25 + "px";
  newDiv.style.left = event.clientX - container.offsetLeft - 25 + "px";
  container.appendChild(newDiv);
  
  // Track this node in actionHistory
  actionHistory.push({type: 'node', node: newDiv});
}

// Clear the last step (node or connection)
function clearLastStep() {
  if (actionHistory.length === 0) return;
  
  const lastAction = actionHistory.pop();
  
  if (lastAction.type === 'node') {
    // Remove the node
    container.removeChild(lastAction.node);
    nodeCount--;
  } else if (lastAction.type === 'connection') {
    // Remove the connection
    container.removeChild(lastAction.connection);
    document.getElementById("inputs").removeChild(lastAction.input);
  }
  
  // Clear the graph when clearing elements
  graph = {};
  document.getElementById("result").innerHTML = "";
}

// Clear all nodes and connections
function clearAll() {
  // Remove all nodes
  const nodes = document.querySelectorAll('.node');
  nodes.forEach(node => {
    container.removeChild(node);
  });
  
  // Remove all connections
  const connections = document.querySelectorAll('connection');
  connections.forEach(connection => {
    container.removeChild(connection);
  });
  
  // Clear all inputs
  const inputs = document.getElementById("inputs");
  while (inputs.firstChild) {
    inputs.removeChild(inputs.firstChild);
  }
  
  // Reset variables
  nodeCount = 0;
  connectBool = 0;
  lastSource = null;
  actionHistory = [];
  graph = {};
  
  // Clear results
  document.getElementById("result").innerHTML = "";
}

/********************************************************** */
(() => {
  function getNumberOrDef(val, def) {
    return typeof val === 'number' && !isNaN(val) ? val : def;
  }

  function isVisible(element) {
    return element && element.style.visibility !== 'hidden';
  }

  function inside(minX, minY, maxX, maxY, x1, y1) {
    return minX <= x1 && x1 <= maxX && minY <= y1 && y1 <= maxY;
  }

  function intersectionPoint(x1, y1, x2, y2, minX, minY, maxX, maxY) {
    var min = Math.min, max = Math.max;
    var good = inside.bind(null, min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2));

    if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY) || (inside(minX, minY, maxX, maxY, x1, y1) && inside(minX, minY, maxX, maxY, x2, y2)))
      return null;

    var m = (y2 - y1) / (x2 - x1);
    var y = m * (minX - x1) + y1;
    if (minY < y && y < maxY && good(minX, y)) return { x: minX, y: y };

    y = m * (maxX - x1) + y1;
    if (minY < y && y < maxY && good(maxX, y)) return { x: maxX, y: y };

    var x = (minY - y1) / m + x1;
    if (minX < x && x < maxX && good(x, minY)) return { x: x, y: minY };

    x = (maxY - y1) / m + x1;
    if (minX < x && x < maxX && good(x, maxY)) return { x: x, y: maxY };

    return null;
  }


  function adjustLine(from, to, line, trafo) {
    var color = trafo && trafo.color || 'gray';
    var W = trafo && trafo.width || 2;

    var fromB = parseFloat(from.style.top) ? null : from.getBoundingClientRect();
    var toB = parseFloat(to.style.top) ? null : to.getBoundingClientRect();
    var fromBStartY = (fromB ? window.scrollY + fromB.top : parseFloat(from.style.top));
    var fromBStartX = (fromB ? window.scrollX + fromB.left : parseFloat(from.style.left));
    var toBStartY = (toB ? window.scrollY + toB.top : parseFloat(to.style.top));
    var toBStartX = (toB ? window.scrollX + toB.left : parseFloat(to.style.left));
    var fromBWidth = (fromB ? fromB.width : parseFloat(from.style.width) || from.offsetWidth);
    var fromBHeight = (fromB ? fromB.height : parseFloat(from.style.height) || from.offsetHeight);
    var toBWidth = (toB ? toB.width : parseFloat(to.style.width) || to.offsetWidth);
    var toBHeight = (toB ? toB.height : parseFloat(to.style.height) || to.offsetHeight);

    var fT = fromBStartY + fromBHeight * getNumberOrDef(trafo && trafo.fromY, getNumberOrDef(trafo, 0.5));
    var tT = toBStartY + toBHeight * getNumberOrDef(trafo && trafo.toY, getNumberOrDef(trafo, 0.5));
    var fL = fromBStartX + fromBWidth * getNumberOrDef(trafo && trafo.fromX, getNumberOrDef(trafo, 0.5));
    var tL = toBStartX + toBWidth * getNumberOrDef(trafo && trafo.toX, getNumberOrDef(trafo, 0.5));

    var CA = Math.abs(tT - fT);
    var CO = Math.abs(tL - fL);
    var H = Math.sqrt(CA * CA + CO * CO);
    var ANG = 180 / Math.PI * Math.acos(CO / H);

    if ((fT >= tT || fL >= tL) && (tT >= fT || tL >= fL)) {
      ANG *= -1;
    }

    if (trafo && trafo.onlyVisible) {
      var arrangeFrom = intersectionPoint(fL, fT, tL, tT, fromBStartX, fromBStartY, fromBStartX + fromBWidth, fromBStartY + fromBHeight);
      var arrangeTo = intersectionPoint(fL, fT, tL, tT, toBStartX, toBStartY, toBStartX + toBWidth, toBStartY + toBHeight);

      if (arrangeFrom) {
        fL = arrangeFrom.x;
        fT = arrangeFrom.y;
      }
      if (arrangeTo) {
        tL = arrangeTo.x;
        tT = arrangeTo.y;
      }
      CA = Math.abs(tT - fT);
      CO = Math.abs(tL - fL);
      H = Math.sqrt(CA * CA + CO * CO);
    }

    var top = (tT + fT) / 2 - W / 2;
    var left = (tL + fL) / 2 - H / 2;

    var arrows = [...line.getElementsByClassName('arrow')];

    var needSwap = (fL > tL || (fL == tL && fT < tT));
    var arrowFw = needSwap && isVisible(arrows[0]) && arrows[0] || !needSwap && isVisible(arrows[1]) && arrows[1];
    var arrowBw = !needSwap && isVisible(arrows[0]) && arrows[0] || needSwap && isVisible(arrows[1]) && arrows[1];
    if (arrowFw) {
      arrowFw.classList.remove('arrow-bw');
      arrowFw.classList.add('arrow-fw');
      arrowFw.style.borderRightColor = color;
      arrowFw.style.top = W / 2 - 6 + "px";
    }
    if (arrowBw) {
      arrowBw.classList.remove('arrow-fw');
      arrowBw.classList.add('arrow-bw');
      arrowBw.style.borderLeftColor = color;
      arrowBw.style.top = W / 2 - 6 + "px";
    }
    line.style.display = "none";
    line.style["-webkit-transform"] = 'rotate(' + ANG + 'deg)';
    line.style["-moz-transform"] = 'rotate(' + ANG + 'deg)';
    line.style["-ms-transform"] = 'rotate(' + ANG + 'deg)';
    line.style["-o-transform"] = 'rotate(' + ANG + 'deg)';
    line.style["-transform"] = 'rotate(' + ANG + 'deg)';
    line.style.top = top + 'px';
    line.style.left = left + 'px';
    line.style.width = H + 'px';
    line.style.height = W + 'px';
    line.style.background = "linear-gradient(to right, " +
      (arrowFw ? "transparent" : color) + " 11px, " +
      color + " 11px " + (H - 11) + "px, " +
      (arrowBw ? "transparent" : color) + " " + (H - 11) + "px 100%)";
    line.style.display = "initial";
  }

  function repaintConnection(connectionElement) {
    var fromQ = connectionElement.getAttribute('from');
    var fromE = document.querySelector(fromQ);
    var toQ = connectionElement.getAttribute('to');
    var toE = document.querySelector(toQ);
    connectedObserver.observe(fromE, { attributes: true });
    connectedObserver.observe(toE, { attributes: true });

    var lineE = connectionElement.getElementsByClassName('line')[0];
    if (!lineE) {
      lineE = document.createElement('div');
      lineE.classList.add('line');
      connectionElement.appendChild(lineE);
    }
    var needTail = connectionElement.hasAttribute('tail');
    var needHead = connectionElement.hasAttribute('head');
    var arrows = lineE.getElementsByClassName('arrow');
    var tail = arrows[0];
    var head = arrows[1];
    if (!tail && (needHead || needTail)) {
      tail = document.createElement('div');
      tail.classList.add('arrow');
      lineE.appendChild(tail);
    }

    if (!head && needHead) {
      head = document.createElement('div');
      head.classList.add('arrow');
      lineE.appendChild(head);
    }

    tail && (tail.style.visibility = needTail ? 'visible' : 'hidden');
    head && (head.style.visibility = needHead ? 'visible' : 'hidden');

    var textE = lineE.getElementsByClassName('text')[0];
    var textMessage = connectionElement.getAttribute('text');

    if (!textE && textMessage) {
      textE = document.createElement('div');
      textE.classList.add('text');
      lineE.appendChild(textE);
    }
    if (textE && textE.innerText != textMessage) {
      textE.innerText = textMessage;
    }

    adjustLine(fromE, toE, lineE, {
      color: connectionElement.getAttribute('color'),
      onlyVisible: connectionElement.hasAttribute('onlyVisible'),
      fromX: parseFloat(connectionElement.getAttribute('fromX')),
      fromY: parseFloat(connectionElement.getAttribute('fromY')),
      toX: parseFloat(connectionElement.getAttribute('toX')),
      toY: parseFloat(connectionElement.getAttribute('toY')),
      width: parseFloat(connectionElement.getAttribute('width'))
    });
  }

  function repaintWithoutObserve(tag) {
    connectionObserver.observe(tag, { attributeFilter: [] });
    repaintConnection(tag);
    connectionObserver.observe(tag, { attributes: true, childList: true, subtree: true });
  }

  function createOne(newElement) {
    connectionElements.push(newElement);
    repaintConnection(newElement);
    connectionObserver.observe(newElement, { attributes: true, childList: true, subtree: true });
  }

  function create() {
    bodyObserver.observe(document.body, { childList: true, subtree: true });
    [...document.body.getElementsByTagName('connection')].forEach(createOne);
  }

  function removeConnection(tag) {
    for (var i = connectionElements.length - 1; i >= 0; i--)
      if (connectionElements[i] === tag)
        connectionElements.splice(i, 1);

    connectionObserver.observe(tag, { attributeFilter: [] });
  }

  function changedConnectedTag(changes) {
    changes.forEach(e => {
      var changedElem = e.target;
      var wasConnection = false;
      for (var i = 0; i < connectionElements.length; ++i) {
        var fromE = document.querySelector(connectionElements[i].getAttribute('from'));
        if (fromE === changedElem) {
          wasConnection = true;
          repaintWithoutObserve(connectionElements[i]);
          continue;
        }
        var toE = document.querySelector(connectionElements[i].getAttribute('to'));
        if (toE === changedElem) {
          wasConnection = true;
          repaintWithoutObserve(connectionElements[i]);
        }
      }
      if (!wasConnection) {
        connectionObserver.observe(changedElem, { attributeFilter: [] });
      }
    });
  }

  function changedConnectionTag(changes) {
    changes.forEach(e => {
      var conn = e.target;
      if (conn.tagName.toLowerCase() !== 'connection' && e.attributeName === 'class')
        ;
      while (conn && conn.tagName.toLowerCase() !== 'connection')
        conn = conn.parentElement;
      if (!conn) return;
      repaintWithoutObserve(conn);
    });
  }

  function bodyNewElement(changes) {
    changes.forEach(e => {
      e.removedNodes.forEach(n => {
        if (n.tagName && n.tagName.toLowerCase() === 'connection')
          removeConnection(n);
      });
      e.addedNodes.forEach(n => {
        if (n.tagName && n.tagName.toLowerCase() === 'connection')
          createOne(n);
      });
    });
  }

  var connectionElements = [];
  var MutationObserver = window.MutationObserver ||
    window.WebKitMutationObserver || window.MozMutationObserver;
  var bodyObserver = new MutationObserver(bodyNewElement);
  var connectionObserver = new MutationObserver(changedConnectionTag);
  var connectedObserver = new MutationObserver(changedConnectedTag);
  document.body && create() || window.addEventListener("load", create);
})();

// Implementation of Dijkstra's algorithm
function makeGraph() {
  // Clear existing graph and results
  graph = {};
  document.getElementById("result").innerHTML = "";
  
  // Get all input fields with costs
  const inputs = document.querySelectorAll("#inputs input");
  let hasInvalidValues = false;
  let invalidInputs = [];
  
  // Build the graph from the inputs
  inputs.forEach(input => {
    const from = input.getAttribute("from");
    const to = input.getAttribute("to");
    const cost = parseInt(input.value);
    
    // Check for negative or null/undefined values
    if (isNaN(cost) || cost < 0) {
      hasInvalidValues = true;
      input.style.borderColor = "red";
      invalidInputs.push(`${from} to ${to}`);
      return; // Skip this input
    } else {
      input.style.borderColor = ""; // Reset border if it was previously marked as invalid
      
      // Initialize nodes if they don't exist in the graph
      if (!graph[from]) graph[from] = {};
      if (!graph[to]) graph[to] = {};
      
      // Add edge with positive cost
      graph[from][to] = cost;
    }
  });
  
  // If invalid values were found, show error message and return
  if (hasInvalidValues) {
    document.getElementById("result").innerHTML = `<div style="color: red">Error: All connections must have positive values. Please fix the highlighted connections: ${invalidInputs.join(", ")}</div>`;
    return;
  }
  
  // Check if we have any nodes to work with
  if (Object.keys(graph).length === 0) {
    document.getElementById("result").innerHTML = "Please create nodes and connections first.";
    return;
  }
  
  // Start node is always node0 (the first node created)
  const startNode = "node0";
  
  // Check if start node exists
  if (!graph[startNode]) {
    document.getElementById("result").innerHTML = "Start node (node0) not found in the graph.";
    return;
  }
  
  // Run Dijkstra's algorithm
  const result = dijkstra(graph, startNode);
  
  // Display results
  let resultHTML = "<h2>Shortest Paths from Node 0:</h2><ul>";
  
  for (const node in result.distances) {
    if (node !== startNode) {
      const distance = result.distances[node];
      const path = reconstructPath(result.previous, startNode, node);
      
      resultHTML += `<li>To Node ${node.replace('node', '')}: `;
      
      if (distance === Infinity) {
        resultHTML += "No path available";
      } else {
        resultHTML += `Distance: ${distance}, Path: ${path.map(n => n.replace('node', '')).join(" → ")}`;
      }
      
      resultHTML += "</li>";
    }
  }
  
  resultHTML += "</ul>";
  document.getElementById("result").innerHTML = resultHTML;
}

function dijkstra(graph, startNode) {
  const distances = {};
  const previous = {};
  const unvisited = new Set();
  
  // Initialize all distances and add all nodes to unvisited set
  for (let node in graph) {
    if (node === startNode) {
      distances[node] = 0;
    } else {
      distances[node] = Infinity;
    }
    previous[node] = null;
    unvisited.add(node);
  }
  
  while (unvisited.size > 0) {
    // Find the unvisited node with the smallest distance
    let currentNode = null;
    let smallestDistance = Infinity;
    
    for (const node of unvisited) {
      if (distances[node] < smallestDistance) {
        smallestDistance = distances[node];
        currentNode = node;
      }
    }
    
    // If we couldn't find a node, there are no more reachable nodes
    if (currentNode === null) break;
    
    // Remove current node from unvisited
    unvisited.delete(currentNode);
    
    // Check all neighbors of current node
    for (const neighbor in graph[currentNode]) {
      const distance = distances[currentNode] + graph[currentNode][neighbor];
      
      // If we found a better path, update it
      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
        previous[neighbor] = currentNode;
      }
    }
  }
  
  return {
    distances,
    previous
  };
}

function reconstructPath(previous, startNode, endNode) {
  const path = [];
  let currentNode = endNode;
  
  while (currentNode !== null) {
    path.unshift(currentNode);
    currentNode = previous[currentNode];
  }
  
  // If the path doesn't start with the startNode, there's no valid path
  if (path[0] !== startNode) {
    return [];
  }
  
  return path;
}

