import type { ExecutionStep, ExecutionTrace } from "../../types/execution.ts";
import type { LinkedListVisualState, LinkedListNodeData } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";

export interface LinkedListOperationInput {
  initialValues?: number[];
  action: "insertBeginning" | "insertEnd" | "search" | "delete";
  value: number;
}

export const LINKED_LIST_SOURCE_CODE = `class Node {
  constructor(val) { this.val = val; this.next = null; }
}
class LinkedList {
  insertBeginning(val) {
    let node = new Node(val);
    node.next = this.head;
    this.head = node;
  }
  insertEnd(val) {
    let node = new Node(val);
    if (!this.head) { this.head = node; return; }
    let curr = this.head;
    while (curr.next) { curr = curr.next; }
    curr.next = node;
  }
  search(val) {
    let curr = this.head;
    while (curr) {
      if (curr.val === val) return curr;
      curr = curr.next;
    }
    return null;
  }
  delete(val) {
    if (!this.head) return;
    if (this.head.val === val) { this.head = this.head.next; return; }
    let curr = this.head;
    while (curr.next && curr.next.val !== val) { curr = curr.next; }
    if (curr.next) { curr.next = curr.next.next; }
  }
}`;

export function generateLinkedListTrace(
  input: LinkedListOperationInput | number[] = [10, 20, 30]
): ExecutionTrace {
  const steps: ExecutionStep[] = [];
  const nodes: LinkedListNodeData[] = [];
  let stepCounter = 0;
  let searchFoundIndex = -1;

  // Determine initial list values and target operation
  let initialVals = [10, 20];
  let action: "insertBeginning" | "insertEnd" | "search" | "delete" = "insertBeginning";
  let targetVal = 30;

  if (Array.isArray(input)) {
    initialVals = input;
  } else if (input && typeof input === "object") {
    initialVals = input.initialValues !== undefined ? input.initialValues : [10, 20];
    action = input.action || "insertBeginning";
    targetVal = input.value !== undefined ? input.value : 30;
  }

  function createStep(
    line: number,
    event: any,
    variables: Record<string, unknown>,
    description: string,
    activeId?: string | null,
    visitedIds?: string[]
  ) {
    const visualState: LinkedListVisualState = {
      type: "linked-list",
      data: {
        nodes: JSON.parse(JSON.stringify(nodes)),
        headId: nodes.length > 0 ? nodes[0].id : null,
      },
      activeId,
      visitedIds,
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

  createStep(1, "call", { head: null }, "LinkedList initialized.");

  // Build initial list
  initialVals.forEach((val) => {
    const newNodeId = `node-${val}`;
    const newNode: LinkedListNodeData = {
      id: newNodeId,
      value: val,
      nextId: nodes.length > 0 ? nodes[0].id : null,
      highlightState: "default",
    };
    nodes.unshift(newNode);
  });

  if (initialVals.length > 0) {
    createStep(
      2,
      "assign",
      { headVal: nodes[0].value, size: nodes.length },
      `Initial LinkedList populated with ${nodes.length} nodes: [${nodes.map((n) => n.value).join(" → ")}].`,
      nodes[0].id
    );
  }

  // Execute specified operation
  if (action === "insertBeginning") {
    const newNodeId = `node-${targetVal}`;
    const newNode: LinkedListNodeData = {
      id: newNodeId,
      value: targetVal,
      nextId: nodes.length > 0 ? nodes[0].id : null,
      highlightState: "active",
    };
    nodes.unshift(newNode);
    createStep(
      7,
      "assign",
      { action: "insertBeginning", val: targetVal, newHead: newNodeId },
      `Inserted node ${targetVal} at HEAD. New HEAD points to node ${targetVal}.`,
      newNodeId
    );
  } else if (action === "insertEnd") {
    const newNodeId = `node-${targetVal}`;
    const newNode: LinkedListNodeData = {
      id: newNodeId,
      value: targetVal,
      nextId: null,
      highlightState: "active",
    };

    if (nodes.length === 0) {
      nodes.push(newNode);
      createStep(11, "assign", { action: "insertEnd", val: targetVal }, `List empty. Inserted node ${targetVal} as HEAD.`, newNodeId);
    } else {
      const visited: string[] = [];
      for (let i = 0; i < nodes.length; i++) {
        visited.push(nodes[i].id);
        createStep(
          13,
          "loop",
          { action: "traverseToTail", currVal: nodes[i].value, idx: i },
          `Traversing list to locate tail node. Currently at node ${nodes[i].value}.`,
          nodes[i].id,
          [...visited]
        );
      }

      nodes[nodes.length - 1].nextId = newNodeId;
      nodes.push(newNode);

      createStep(
        14,
        "assign",
        { action: "insertEnd", val: targetVal, tailId: newNodeId },
        `Linked previous tail node to new node ${targetVal}. Inserted ${targetVal} at end of list.`,
        newNodeId,
        visited
      );
    }
  } else if (action === "search") {
    const visited: string[] = [];

    for (let i = 0; i < nodes.length; i++) {
      visited.push(nodes[i].id);
      const isMatch = nodes[i].value === targetVal;

      createStep(
        19,
        "compare",
        { action: "search", target: targetVal, currVal: nodes[i].value, isMatch },
        `Searching for value ${targetVal}. Comparing node ${nodes[i].value} === ${targetVal}.`,
        nodes[i].id,
        [...visited]
      );

      if (isMatch) {
        searchFoundIndex = i;
        createStep(
          20,
          "visit",
          { action: "searchSuccess", target: targetVal, foundIndex: i, nodeId: nodes[i].id, found: true },
          `Target value ${targetVal} found at index ${i} (Node ${nodes[i].id})!`,
          nodes[i].id,
          [...visited]
        );
        break;
      }
    }

    if (searchFoundIndex === -1) {
      createStep(
        22,
        "complete",
        { action: "searchFailure", target: targetVal, found: false },
        `Target value ${targetVal} was not found in LinkedList.`,
        null,
        visited
      );
    }
  } else if (action === "delete") {
    if (nodes.length === 0) {
      createStep(25, "complete", { action: "deleteEmpty", target: targetVal }, `Cannot delete from empty LinkedList.`);
    } else if (nodes[0].value === targetVal) {
      const deletedNode = nodes.shift()!;
      createStep(
        26,
        "update",
        { action: "deleteHead", deletedVal: deletedNode.value, newHeadId: nodes.length > 0 ? nodes[0].id : null },
        `Deleted HEAD node containing value ${targetVal}. HEAD updated to ${nodes.length > 0 ? nodes[0].value : "null"}.`,
        nodes.length > 0 ? nodes[0].id : null
      );
    } else {
      const visited: string[] = [nodes[0].id];
      let deletedIndex = -1;

      for (let i = 0; i < nodes.length - 1; i++) {
        const curr = nodes[i];
        const nextNode = nodes[i + 1];
        visited.push(nextNode.id);

        createStep(
          28,
          "compare",
          { action: "deleteSearch", target: targetVal, currVal: curr.value, nextVal: nextNode.value },
          `Searching for node to delete. Checking next node value (${nextNode.value}) === ${targetVal}.`,
          curr.id,
          [...visited]
        );

        if (nextNode.value === targetVal) {
          deletedIndex = i + 1;
          const deletedNode = nodes.splice(deletedIndex, 1)[0];
          curr.nextId = deletedNode.nextId;

          createStep(
            29,
            "update",
            { action: "deleteNode", deletedVal: deletedNode.value, prevVal: curr.value, unlinkedNext: curr.nextId },
            `Unlinked node ${deletedNode.value}. Node ${curr.value} now points to ${curr.nextId ? "next node" : "null"}.`,
            curr.id,
            visited
          );
          break;
        }
      }

      if (deletedIndex === -1) {
        createStep(
          30,
          "complete",
          { action: "deleteNotFound", target: targetVal },
          `Value ${targetVal} not found. No nodes were deleted.`,
          null,
          visited
        );
      }
    }
  }

  createStep(31, "complete", { size: nodes.length, found: action === "search" ? searchFoundIndex !== -1 : undefined }, "LinkedList operation complete.");

  return {
    algorithmId: "linked-list-demo",
    algorithmTitle: "Singly Linked List",
    sourceCode: LINKED_LIST_SOURCE_CODE,
    initialInput: input,
    steps,
    totalSteps: steps.length,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
  };
}

export const linkedListDefinition: AlgorithmDefinition<number[], LinkedListVisualState> = {
  id: "linked-list-demo",
  name: "Linked List Data Structure",
  title: "Singly Linked List",
  category: "data-structures",
  description: "A linear data structure of nodes connected by directional pointer links supporting O(1) head insertion and O(n) traversal/deletion.",
  complexity: { best: "O(1)", average: "O(n)", worst: "O(n)", space: "O(n)" },
  defaultInput: [10, 20, 30],
  sourceCode: LINKED_LIST_SOURCE_CODE,
  generateTrace: (input: number[]) => generateLinkedListTrace(input),
};

ALGORITHM_REGISTRY.register(linkedListDefinition as unknown as AlgorithmDefinition);
