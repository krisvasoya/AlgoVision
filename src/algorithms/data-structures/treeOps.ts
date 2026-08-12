import type { ExecutionStep, ExecutionTrace } from "../../types/execution.ts";
import type { TreeVisualState, TreeNodeData } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";

export interface TreeOperationInput {
  initialValues?: number[];
  action: "insert" | "search" | "inorder" | "preorder" | "postorder";
  value?: number;
}

export const TREE_SOURCE_CODE = `class TreeNode {
  constructor(val) { this.val = val; this.left = null; this.right = null; }
}
class BST {
  insert(val) { /* Insert node following BST property */ }
  search(val) {
    let curr = this.root;
    while (curr) {
      if (curr.val === val) return curr;
      curr = val < curr.val ? curr.left : curr.right;
    }
    return null;
  }
  inorder(node) { if (!node) return; this.inorder(node.left); visit(node); this.inorder(node.right); }
  preorder(node) { if (!node) return; visit(node); this.preorder(node.left); this.preorder(node.right); }
  postorder(node) { if (!node) return; this.postorder(node.left); this.postorder(node.right); visit(node); }
}`;

export function generateTreeTrace(
  input: TreeOperationInput | number[] = [8, 4, 12, 2, 6]
): ExecutionTrace {
  const steps: ExecutionStep[] = [];
  const nodesMap = new Map<string, TreeNodeData>();
  let rootId: string | null = null;
  let stepCounter = 0;

  // Determine initial values and operation
  let initialVals = [8, 4, 12, 2, 6];
  let action: "insert" | "search" | "inorder" | "preorder" | "postorder" = "inorder";
  let targetVal: number = 6;

  if (Array.isArray(input)) {
    initialVals = input;
  } else if (input && typeof input === "object") {
    initialVals = input.initialValues !== undefined ? input.initialValues : [8, 4, 12, 2, 6];
    action = input.action || "inorder";
    targetVal = input.value !== undefined ? input.value : 6;
  }

  function createStep(
    line: number,
    event: any,
    variables: Record<string, unknown>,
    description: string,
    activeId?: string | null,
    comparedIds?: string[],
    visitedIds?: string[],
    pathIds?: string[]
  ) {
    const nodesArray = Array.from(nodesMap.values());
    const visualState: TreeVisualState = {
      type: "tree",
      data: {
        nodes: JSON.parse(JSON.stringify(nodesArray)),
        rootId,
      },
      activeId,
      comparedIds,
      visitedIds,
      pathIds,
    };

    steps.push({
      step: stepCounter++,
      line,
      event,
      variables: JSON.parse(JSON.stringify(variables)),
      state: visualState,
      metadata: { description },
    });
  }

  createStep(1, "call", { root: null }, "Binary Search Tree initialized.");

  // Helper to insert a value into the BST model
  function insertNodeIntoBST(val: number) {
    const id = `tree-${val}`;
    if (nodesMap.has(id)) return; // Duplicate handling: ignore existing value

    if (!rootId) {
      rootId = id;
      nodesMap.set(id, { id, value: val, leftId: null, rightId: null, highlightState: "default" });
    } else {
      let currId: string | null = rootId;
      while (currId) {
        const currNode: TreeNodeData = nodesMap.get(currId)!;
        if (val < currNode.value) {
          if (!currNode.leftId) {
            currNode.leftId = id;
            nodesMap.set(id, { id, value: val, leftId: null, rightId: null, highlightState: "default" });
            break;
          }
          currId = currNode.leftId;
        } else {
          if (!currNode.rightId) {
            currNode.rightId = id;
            nodesMap.set(id, { id, value: val, leftId: null, rightId: null, highlightState: "default" });
            break;
          }
          currId = currNode.rightId;
        }
      }
    }
  }

  // Populate initial tree
  initialVals.forEach((val) => insertNodeIntoBST(val));

  if (nodesMap.size > 0) {
    createStep(
      2,
      "assign",
      { rootVal: nodesMap.get(rootId!)?.value, totalNodes: nodesMap.size },
      `BST built with ${nodesMap.size} nodes: [${Array.from(nodesMap.values()).map((n) => n.value).join(", ")}].`,
      rootId
    );
  }

  // Execute requested operation
  if (action === "insert") {
    const insertVal = targetVal;
    const id = `tree-${insertVal}`;

    if (nodesMap.has(id)) {
      createStep(
        3,
        "compare",
        { action: "insertDuplicate", val: insertVal },
        `Value ${insertVal} already exists in BST. Duplicate ignored.`,
        id
      );
    } else if (!rootId) {
      rootId = id;
      nodesMap.set(id, { id, value: insertVal, leftId: null, rightId: null, highlightState: "active" });
      createStep(3, "assign", { action: "insertRoot", val: insertVal }, `Inserted ${insertVal} as ROOT.`, id);
    } else {
      let currId: string | null = rootId;
      const path: string[] = [];

      while (currId) {
        const currNode: TreeNodeData = nodesMap.get(currId)!;
        path.push(currId);

        createStep(
          4,
          "compare",
          { action: "insertCompare", val: insertVal, currVal: currNode.value },
          `Compare ${insertVal} with node ${currNode.value}.`,
          currId,
          [...path]
        );

        if (insertVal < currNode.value) {
          if (!currNode.leftId) {
            currNode.leftId = id;
            nodesMap.set(id, { id, value: insertVal, leftId: null, rightId: null, highlightState: "active" });
            createStep(
              5,
              "assign",
              { action: "insertLeft", val: insertVal, parent: currNode.value },
              `Inserted ${insertVal} as left child of ${currNode.value}.`,
              id,
              undefined,
              undefined,
              path
            );
            break;
          }
          currId = currNode.leftId;
        } else {
          if (!currNode.rightId) {
            currNode.rightId = id;
            nodesMap.set(id, { id, value: insertVal, leftId: null, rightId: null, highlightState: "active" });
            createStep(
              5,
              "assign",
              { action: "insertRight", val: insertVal, parent: currNode.value },
              `Inserted ${insertVal} as right child of ${currNode.value}.`,
              id,
              undefined,
              undefined,
              path
            );
            break;
          }
          currId = currNode.rightId;
        }
      }
    }
  } else if (action === "search") {
    let currId: string | null = rootId;
    const path: string[] = [];
    let found = false;

    while (currId) {
      const currNode: TreeNodeData = nodesMap.get(currId)!;
      path.push(currId);

      const isMatch = currNode.value === targetVal;
      createStep(
        8,
        "compare",
        { action: "searchCompare", target: targetVal, currVal: currNode.value, isMatch },
        `Comparing target ${targetVal} with node ${currNode.value}.`,
        currId,
        [...path]
      );

      if (isMatch) {
        found = true;
        createStep(
          9,
          "visit",
          { action: "searchSuccess", target: targetVal, foundNodeId: currId },
          `Target value ${targetVal} successfully found in BST!`,
          currId,
          undefined,
          [...path]
        );
        break;
      }

      if (targetVal < currNode.value) {
        createStep(
          10,
          "update",
          { action: "searchMoveLeft", target: targetVal, currVal: currNode.value },
          `Since ${targetVal} < ${currNode.value}, search moves to left subtree.`,
          currNode.leftId,
          [...path]
        );
        currId = currNode.leftId;
      } else {
        createStep(
          12,
          "update",
          { action: "searchMoveRight", target: targetVal, currVal: currNode.value },
          `Since ${targetVal} > ${currNode.value}, search moves to right subtree.`,
          currNode.rightId,
          [...path]
        );
        currId = currNode.rightId;
      }
    }

    if (!found) {
      createStep(
        13,
        "complete",
        { action: "searchFailure", target: targetVal, found: false },
        `Target ${targetVal} was not found in BST.`,
        null,
        undefined,
        path
      );
    }
  } else if (action === "inorder") {
    const visited: string[] = [];
    function inorder(nodeId: string | null) {
      if (!nodeId) return;
      const node: TreeNodeData = nodesMap.get(nodeId)!;
      inorder(node.leftId);
      visited.push(nodeId);
      createStep(
        15,
        "visit",
        { action: "inorderVisit", visitedVal: node.value, order: "Left -> Root -> Right" },
        `Inorder Traversal visited node ${node.value}.`,
        nodeId,
        undefined,
        [...visited]
      );
      inorder(node.rightId);
    }
    createStep(14, "loop", { action: "startInorder" }, "Start Inorder Traversal (Left, Root, Right).");
    if (rootId) inorder(rootId);
  } else if (action === "preorder") {
    const visited: string[] = [];
    function preorder(nodeId: string | null) {
      if (!nodeId) return;
      const node: TreeNodeData = nodesMap.get(nodeId)!;
      visited.push(nodeId);
      createStep(
        16,
        "visit",
        { action: "preorderVisit", visitedVal: node.value, order: "Root -> Left -> Right" },
        `Preorder Traversal visited node ${node.value}.`,
        nodeId,
        undefined,
        [...visited]
      );
      preorder(node.leftId);
      preorder(node.rightId);
    }
    createStep(16, "loop", { action: "startPreorder" }, "Start Preorder Traversal (Root, Left, Right).");
    if (rootId) preorder(rootId);
  } else if (action === "postorder") {
    const visited: string[] = [];
    function postorder(nodeId: string | null) {
      if (!nodeId) return;
      const node: TreeNodeData = nodesMap.get(nodeId)!;
      postorder(node.leftId);
      postorder(node.rightId);
      visited.push(nodeId);
      createStep(
        17,
        "visit",
        { action: "postorderVisit", visitedVal: node.value, order: "Left -> Right -> Root" },
        `Postorder Traversal visited node ${node.value}.`,
        nodeId,
        undefined,
        [...visited]
      );
    }
    createStep(17, "loop", { action: "startPostorder" }, "Start Postorder Traversal (Left, Right, Root).");
    if (rootId) postorder(rootId);
  }

  createStep(18, "complete", { totalNodes: nodesMap.size }, "BST Operation complete.");

  return {
    algorithmId: "tree-demo",
    algorithmTitle: "Binary Search Tree (BST)",
    sourceCode: TREE_SOURCE_CODE,
    initialInput: input,
    steps,
    totalSteps: steps.length,
    timeComplexity: "O(log n)",
    spaceComplexity: "O(h)",
  };
}

export const treeDefinition: AlgorithmDefinition<number[], TreeVisualState> = {
  id: "tree-demo",
  name: "Binary Search Tree",
  title: "Binary Search Tree (BST)",
  category: "data-structures",
  description: "A hierarchical node tree where left children are smaller and right children are larger supporting insertion, search, and traversals.",
  complexity: { best: "O(log n)", average: "O(log n)", worst: "O(n)", space: "O(h)" },
  defaultInput: [8, 4, 12, 2, 6],
  sourceCode: TREE_SOURCE_CODE,
  generateTrace: (input: number[]) => generateTreeTrace(input),
};

ALGORITHM_REGISTRY.register(treeDefinition as unknown as AlgorithmDefinition);
