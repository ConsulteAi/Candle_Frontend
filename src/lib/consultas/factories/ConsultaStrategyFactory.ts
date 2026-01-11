/**
 * ConsultaStrategyFactory
 * Factory Pattern for creating consultation strategies
 *
 * SOLID Principles:
 * - Single Responsibility: Only creates strategies
 * - Open/Closed: Open for extension (add new strategies), closed for modification
 * - Dependency Inversion: Returns interface, not concrete implementation
 */

import { ConsultaStrategy } from "../strategies/ConsultaStrategy";
import { CpfCreditStrategy } from "../strategies/CpfCreditStrategy";
import { PremiumCreditStrategy } from "../strategies/PremiumCreditStrategy";

/**
 * Factory for creating consultation strategies
 */
export class ConsultaStrategyFactory {
  private static strategies = new Map<string, ConsultaStrategy>();
  private static initialized = false;

  /**
   * Initialize factory with all available strategies
   * This is called automatically on first use
   */
  private static initialize(): void {
    if (this.initialized) return;

    // Register all available strategies
    this.register(new CpfCreditStrategy());
    this.register(new PremiumCreditStrategy());

    // TODO: Add more strategies as they are implemented
    // this.register(new CnpjCreditStrategy());
    // this.register(new VehicleConsultationStrategy());
    // etc.

    this.initialized = true;
  }

  /**
   * Register a strategy
   * @param strategy - Strategy to register
   */
  static register(strategy: ConsultaStrategy): void {
    this.strategies.set(strategy.slug, strategy);
  }

  /**
   * Create a strategy based on slug
   * @param slug - Consultation slug (e.g., "avalie-credito-cpf")
   * @returns Strategy instance or null if not found
   */
  static create(slug: string): ConsultaStrategy | null {
    this.initialize();
    return this.strategies.get(slug) || null;
  }

  /**
   * Get all registered strategies
   * @returns Array of all strategies
   */
  static getAll(): ConsultaStrategy[] {
    this.initialize();
    return Array.from(this.strategies.values());
  }

  /**
   * Check if a strategy exists for a given slug
   * @param slug - Consultation slug
   * @returns true if strategy exists
   */
  static has(slug: string): boolean {
    this.initialize();
    return this.strategies.has(slug);
  }

  /**
   * Get all registered slugs
   * @returns Array of slugs
   */
  static getSlugs(): string[] {
    this.initialize();
    return Array.from(this.strategies.keys());
  }
}
