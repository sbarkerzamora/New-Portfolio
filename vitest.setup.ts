/**
 * Vitest Setup
 * 
 * Setup file for Vitest test environment
 */

import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock scrollIntoView for jsdom environment
Element.prototype.scrollIntoView = vi.fn();

