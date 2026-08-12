import { ALGORITHM_REGISTRY } from "./registry.ts";
import { bubbleSortDefinition, generateBubbleSortTrace } from "./sorting/bubbleSort.ts";
import { selectionSortDefinition, generateSelectionSortTrace } from "./sorting/selectionSort.ts";
import { insertionSortDefinition, generateInsertionSortTrace } from "./sorting/insertionSort.ts";
import { linearSearchDefinition, generateLinearSearchTrace } from "./searching/linearSearch.ts";
import { binarySearchDefinition, generateBinarySearchTrace } from "./searching/binarySearch.ts";

import { stackDefinition, generateStackTrace } from "./data-structures/stackOps.ts";
import { queueDefinition, generateQueueTrace } from "./data-structures/queueOps.ts";
import { linkedListDefinition, generateLinkedListTrace } from "./data-structures/linkedListOps.ts";
import { treeDefinition, generateTreeTrace } from "./data-structures/treeOps.ts";
import { graphDefinition, generateGraphTrace } from "./data-structures/graphOps.ts";

import { bfsDefinition, generateBFSTrace } from "./graph/bfs.ts";
import { dfsDefinition, generateDFSTrace } from "./graph/dfs.ts";
import { dijkstraDefinition, generateDijkstraTrace } from "./graph/dijkstra.ts";

import { factorialDefinition, generateFactorialTrace } from "./recursion/factorial.ts";
import { fibonacciDefinition, generateFibonacciTrace } from "./recursion/fibonacci.ts";
import { recursiveBinarySearchDefinition, generateRecursiveBinarySearchTrace } from "./recursion/recursiveBinarySearch.ts";
import { towerOfHanoiDefinition, generateHanoiTrace } from "./recursion/towerOfHanoi.ts";

export { ALGORITHM_REGISTRY, AlgorithmRegistry } from "./registry.ts";
export { ArrayTraceBuilder } from "../engine/tracing/ArrayTraceBuilder.ts";
export { bubbleSortDefinition, bubbleSortAlgorithm, generateBubbleSortTrace } from "./sorting/bubbleSort.ts";
export { selectionSortDefinition, generateSelectionSortTrace } from "./sorting/selectionSort.ts";
export { insertionSortDefinition, generateInsertionSortTrace } from "./sorting/insertionSort.ts";
export { linearSearchDefinition, generateLinearSearchTrace } from "./searching/linearSearch.ts";
export { binarySearchDefinition, generateBinarySearchTrace } from "./searching/binarySearch.ts";

export { stackDefinition, generateStackTrace } from "./data-structures/stackOps.ts";
export { queueDefinition, generateQueueTrace } from "./data-structures/queueOps.ts";
export { linkedListDefinition, generateLinkedListTrace } from "./data-structures/linkedListOps.ts";
export { treeDefinition, generateTreeTrace } from "./data-structures/treeOps.ts";
export { graphDefinition, generateGraphTrace } from "./data-structures/graphOps.ts";

export { bfsDefinition, generateBFSTrace } from "./graph/bfs.ts";
export { dfsDefinition, generateDFSTrace } from "./graph/dfs.ts";
export { dijkstraDefinition, generateDijkstraTrace } from "./graph/dijkstra.ts";

export { factorialDefinition, generateFactorialTrace } from "./recursion/factorial.ts";
export { fibonacciDefinition, generateFibonacciTrace } from "./recursion/fibonacci.ts";
export { recursiveBinarySearchDefinition, generateRecursiveBinarySearchTrace } from "./recursion/recursiveBinarySearch.ts";
export { towerOfHanoiDefinition, generateHanoiTrace } from "./recursion/towerOfHanoi.ts";
