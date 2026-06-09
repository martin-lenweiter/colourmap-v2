import { describe, expect, it } from 'vitest';

import { buildGraph, findNode } from './geopolitics-graph';

describe('geopolitics-graph', () => {
  const graph = buildGraph();

  it('contains every authored page as a node with valid coordinates', () => {
    expect(graph.nodes.length).toBeGreaterThanOrEqual(15);
    for (const node of graph.nodes) {
      expect(node.x).toBeGreaterThan(0);
      expect(node.y).toBeGreaterThan(0);
      expect(node.slug.length).toBeGreaterThan(0);
    }
  });

  it('models depends-on edges between sequential Hormuz chapter pages', () => {
    const ironLeverage = findNode(graph, 'iran-leverage');
    expect(ironLeverage).toBeDefined();

    const incoming = graph.edges.filter((e) => e.to === 'iran-leverage' && e.kind === 'dependsOn');
    expect(incoming.length).toBeGreaterThanOrEqual(1);
    expect(incoming.some((e) => e.from === 'hormuz-oil-share')).toBe(true);
  });

  it('counts in/out degree per node', () => {
    const epicFury = findNode(graph, 'epic-fury');
    expect(epicFury?.outgoing).toBeGreaterThanOrEqual(1);
    expect(epicFury?.incoming).toBeGreaterThanOrEqual(1);
  });

  it('width and height accommodate every column and row', () => {
    expect(graph.width).toBeGreaterThan(0);
    expect(graph.height).toBeGreaterThan(0);
    for (const node of graph.nodes) {
      expect(node.x).toBeLessThan(graph.width);
      expect(node.y).toBeLessThan(graph.height);
    }
  });
});
