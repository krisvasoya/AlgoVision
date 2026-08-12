import type { ExamQuestion, ExamTopic, ExamQuestionType } from "./types.ts";
import { ALGORITHM_REGISTRY } from "../../algorithms/index.ts";
import type { SearchInput } from "../../algorithms/searching/linearSearch.ts";

export class QuestionGenerator {
  public static generateQuestionsForTopic(topic: ExamTopic, count: number = 5): ExamQuestion[] {
    const questions: ExamQuestion[] = [];

    if (topic === "sorting") {
      const bubble = ALGORITHM_REGISTRY.get("bubble-sort");
      const selection = ALGORITHM_REGISTRY.get("selection-sort");

      if (bubble) {
        const trace = bubble.generateTrace([5, 2, 8, 1]);
        const step1 = trace.steps[1];

        questions.push({
          id: `q-sort-1`,
          type: "trace_prediction",
          topic: "sorting",
          prompt: `In Bubble Sort with input [5, 2, 8, 1], what operation occurs on Step 2?`,
          options: ["compare", "swap", "sorted", "complete"],
          correctAnswer: step1.event,
          explanation: `At Step 2, the algorithm compares adjacent elements 5 and 2.`,
          sourceStep: 1,
          difficulty: "easy",
        });

        questions.push({
          id: `q-sort-2`,
          type: "complexity",
          topic: "sorting",
          prompt: `What is the worst-case time complexity of Bubble Sort?`,
          options: ["O(n^2)", "O(n log n)", "O(n)", "O(1)"],
          correctAnswer: "O(n^2)",
          explanation: `Bubble Sort requires nested loops over n elements in the worst case.`,
          difficulty: "easy",
        });
      }

      if (selection) {
        questions.push({
          id: `q-sort-3`,
          type: "concept",
          topic: "sorting",
          prompt: `What is the primary mechanism of Selection Sort during each pass?`,
          options: [
            "Find minimum element in unsorted subarray and swap to front",
            "Swap adjacent out-of-order elements repeatedly",
            "Divide array into halves recursively",
            "Insert element into sorted position",
          ],
          correctAnswer: "Find minimum element in unsorted subarray and swap to front",
          explanation: `Selection Sort repeatedly selects the minimum element from the unsorted region.`,
          difficulty: "medium",
        });
      }
    } else if (topic === "searching") {
      const binary = ALGORITHM_REGISTRY.get("binary-search");
      if (binary) {
        const trace = binary.generateTrace({ array: [10, 20, 30, 40, 50], target: 40 } as unknown as SearchInput);

        questions.push({
          id: `q-search-1`,
          type: "trace_prediction",
          topic: "searching",
          prompt: `When performing Binary Search for target 40 in sorted array [10, 20, 30, 40, 50], which index is checked first?`,
          options: ["Index 2 (value 30)", "Index 0 (value 10)", "Index 4 (value 50)", "Index 1 (value 20)"],
          correctAnswer: "Index 2 (value 30)",
          explanation: `Binary Search calculates midpoint mid = floor((0 + 4)/2) = 2 (value 30).`,
          sourceStep: 1,
          difficulty: "easy",
        });

        questions.push({
          id: `q-search-2`,
          type: "complexity",
          topic: "searching",
          prompt: `Why is Binary Search faster than Linear Search on large sorted arrays?`,
          options: [
            "It halves the search space at each step (O(log n))",
            "It checks elements from both ends simultaneously",
            "It uses a hash table lookup (O(1))",
            "It skips even-indexed elements",
          ],
          correctAnswer: "It halves the search space at each step (O(log n))",
          explanation: `Halving the active search range yields logarithmic time complexity O(log n).`,
          difficulty: "medium",
        });
      }
    } else if (topic === "data-structures") {
      questions.push({
        id: `q-ds-1`,
        type: "concept",
        topic: "data-structures",
        prompt: `Which abstract data structure follows the Last-In, First-Out (LIFO) discipline?`,
        options: ["Stack", "Queue", "Binary Search Tree", "Linked List"],
        correctAnswer: "Stack",
        explanation: `A Stack processes the most recently pushed element first (LIFO).`,
        difficulty: "easy",
      });

      questions.push({
        id: `q-ds-2`,
        type: "data_structure_state",
        topic: "data-structures",
        prompt: `After executing push(10), push(20), pop() on an empty stack, what is on top of the stack?`,
        options: ["10", "20", "empty", "undefined"],
        correctAnswer: "10",
        explanation: `push(10) -> [10], push(20) -> [10, 20], pop() removes 20, leaving 10 on top.`,
        difficulty: "easy",
      });
    } else if (topic === "graphs") {
      questions.push({
        id: `q-graph-1`,
        type: "concept",
        topic: "graphs",
        prompt: `Which data structure does Breadth-First Search (BFS) use to track candidate vertices?`,
        options: ["Queue (FIFO)", "Stack (LIFO)", "Priority Queue", "Array"],
        correctAnswer: "Queue (FIFO)",
        explanation: `BFS uses a FIFO queue to visit vertices level-by-level in order of discovery.`,
        difficulty: "medium",
      });

      questions.push({
        id: `q-graph-2`,
        type: "complexity",
        topic: "graphs",
        prompt: `What is the time complexity of Dijkstra's algorithm with a Min-Heap priority queue?`,
        options: ["O((V + E) log V)", "O(V^2)", "O(V * E)", "O(E^2)"],
        correctAnswer: "O((V + E) log V)",
        explanation: `Min-Heap extract-min and decrease-key operations yield O((V + E) log V) time complexity.`,
        difficulty: "hard",
      });
    } else if (topic === "recursion") {
      const fact = ALGORITHM_REGISTRY.get("factorial");
      if (fact) {
        const trace = fact.generateTrace(4);
        const maxStackStep = trace.steps.find((s) => s.runtimeState?.callStack.length === 4);

        questions.push({
          id: `q-rec-1`,
          type: "runtime_state",
          topic: "recursion",
          prompt: `What is the maximum call stack depth when calculating factorial(4)?`,
          options: ["4 frames", "1 frame", "5 frames", "8 frames"],
          correctAnswer: "4 frames",
          explanation: `factorial(4) -> factorial(3) -> factorial(2) -> factorial(1) creates 4 call stack frames.`,
          sourceStep: maxStackStep?.step || 4,
          difficulty: "medium",
        });

        questions.push({
          id: `q-rec-2`,
          type: "code_line",
          topic: "recursion",
          prompt: `In a recursive function, what happens if the base case condition is missing?`,
          options: [
            "Infinite recursion leading to stack overflow error",
            "The function returns 0 immediately",
            "The compiler converts it to a for loop",
            "The program completes normally",
          ],
          correctAnswer: "Infinite recursion leading to stack overflow error",
          explanation: `Without a base case, recursive calls continue indefinitely until stack depth limits are exceeded.`,
          difficulty: "easy",
        });
      }
    }

    return questions.slice(0, count);
  }
}
