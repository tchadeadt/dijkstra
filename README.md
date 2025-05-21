# Dijkstra Algorithm Visualization Tool

This interactive web application allows users to visualize and understand Dijkstra's algorithm for finding the shortest path in a graph. Users can create nodes, establish connections between them with custom weights, and run the algorithm to find the shortest paths.

## Features

- **Interactive Graph Creation**: Click on the canvas to create nodes and connect them
- **Custom Connection Weights**: Assign numeric weights to each connection
- **Customizable Starting Point**: Right-click any node to set it as the starting point for the algorithm
- **Real-time Calculation**: Calculate shortest paths from the selected starting node to all other nodes
- **Edit and Modify**: Clear the last step or reset the entire graph as needed

## How to Use

### Creating the Graph

1. **Create Nodes**: 
   - Click anywhere on the canvas to create a node
   - Each node is automatically assigned a sequential number

2. **Connect Nodes**:
   - Click on a source node first (it will highlight in green)
   - Then click on a destination node to create a connection
   - An input field will appear where you can set the weight of the connection

3. **Set Connection Weights**:
   - Enter positive numbers in the input fields below the canvas
   - Each input represents the cost/weight of moving from one node to another

4. **Choose Starting Point**:
   - By default, node 0 is the starting point
   - Right-click on any node to set it as the new starting point
   - The selected starting point will be highlighted in blue

### Running the Algorithm

1. Click the "Calculate Shortest Path" button to run Dijkstra's algorithm
2. The results will display below the canvas, showing:
   - The shortest path from the starting node to each other node
   - The total distance (sum of weights) for each path
   - "No path available" message for unreachable nodes

### Editing the Graph

- **Clear Last Step**: Remove the most recently added node or connection
- **Clear All**: Reset the entire canvas and start over

## Technical Information

The application implements Dijkstra's algorithm to find the shortest paths in a weighted directed graph. The algorithm:

1. Initializes distances from the source to all other nodes as infinity
2. Sets distance to the source node as 0
3. Iteratively finds the unvisited node with the smallest distance
4. Updates distances to all neighboring nodes if a shorter path is found
5. Continues until all nodes are visited or unreachable nodes remain

## Requirements

- A modern web browser with JavaScript enabled
- No external dependencies required

## Limitations

- Only supports directed graphs (connections have a specific direction)
- Connection weights must be positive numbers (negative weights are not supported)

## Troubleshooting

- If connections are not displaying correctly, ensure you've entered valid weights
- Red highlighted inputs indicate invalid values that need correction
- For optimal performance, limit graphs to a reasonable number of nodes (< 50)
