import type { AlgorithmDefinition, AlgorithmCategory } from "../types/algorithm.ts";

export class AlgorithmRegistry {
  private registry: Map<string, AlgorithmDefinition> = new Map();

  public register(algorithm: AlgorithmDefinition): void {
    if (!algorithm.id) {
      throw new Error("Algorithm registration failed: id is required.");
    }
    this.registry.set(algorithm.id, algorithm);
  }

  public get(id: string): AlgorithmDefinition | undefined {
    return this.registry.get(id);
  }

  public getAll(): AlgorithmDefinition[] {
    return Array.from(this.registry.values());
  }

  public getByCategory(category: AlgorithmCategory): AlgorithmDefinition[] {
    return this.getAll().filter((algo) => algo.category === category);
  }

  public has(id: string): boolean {
    return this.registry.has(id);
  }

  public clear(): void {
    this.registry.clear();
  }
}

// Global registry singleton
export const ALGORITHM_REGISTRY = new AlgorithmRegistry();
