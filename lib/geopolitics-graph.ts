import { GEOPOLITICS_CATEGORIES, type Page } from './geopolitics-content';

export type GraphNode = {
  slug: string;
  title: string;
  programSlug: string;
  programTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  categoryTitle: string;
  x: number;
  y: number;
  outgoing: number;
  incoming: number;
};

export type GraphEdge = {
  from: string;
  to: string;
  kind: 'dependsOn' | 'feedsInto' | 'related';
};

export type Graph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
};

const COLUMN_WIDTH = 220;
const ROW_HEIGHT = 80;
const TOP_PADDING = 64;
const LEFT_PADDING = 60;

export function buildGraph(): Graph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const incomingByPage = new Map<string, number>();
  const outgoingByPage = new Map<string, number>();
  const allPages: Page[] = [];

  let columnIndex = 0;
  let maxRows = 0;

  for (const category of GEOPOLITICS_CATEGORIES) {
    for (const program of category.programs) {
      for (const chapter of program.chapters) {
        chapter.pages.forEach((page, rowIndex) => {
          nodes.push({
            slug: page.slug,
            title: page.title,
            programSlug: program.slug,
            programTitle: program.title,
            chapterSlug: chapter.slug,
            chapterTitle: chapter.title,
            categoryTitle: category.title,
            x: LEFT_PADDING + columnIndex * COLUMN_WIDTH,
            y: TOP_PADDING + rowIndex * ROW_HEIGHT,
            outgoing: 0,
            incoming: 0,
          });
          allPages.push(page);
          maxRows = Math.max(maxRows, rowIndex + 1);
        });
        columnIndex += 1;
      }
    }
  }

  const nodeBySlug = new Map(nodes.map((n) => [n.slug, n] as const));
  for (const page of allPages) {
    for (const target of page.dependsOn) {
      if (!nodeBySlug.has(target)) continue;
      edges.push({ from: target, to: page.slug, kind: 'dependsOn' });
      incomingByPage.set(page.slug, (incomingByPage.get(page.slug) ?? 0) + 1);
      outgoingByPage.set(target, (outgoingByPage.get(target) ?? 0) + 1);
    }
    for (const target of page.feedsInto) {
      if (!nodeBySlug.has(target)) continue;
      const exists = edges.some(
        (e) => e.from === page.slug && e.to === target && e.kind === 'dependsOn',
      );
      if (exists) continue;
      edges.push({ from: page.slug, to: target, kind: 'feedsInto' });
      outgoingByPage.set(page.slug, (outgoingByPage.get(page.slug) ?? 0) + 1);
      incomingByPage.set(target, (incomingByPage.get(target) ?? 0) + 1);
    }
    for (const target of page.related) {
      if (!nodeBySlug.has(target)) continue;
      const exists = edges.some(
        (e) =>
          (e.from === page.slug && e.to === target) || (e.from === target && e.to === page.slug),
      );
      if (exists) continue;
      edges.push({ from: page.slug, to: target, kind: 'related' });
    }
  }

  for (const node of nodes) {
    node.outgoing = outgoingByPage.get(node.slug) ?? 0;
    node.incoming = incomingByPage.get(node.slug) ?? 0;
  }

  const width = LEFT_PADDING * 2 + columnIndex * COLUMN_WIDTH;
  const height = TOP_PADDING * 2 + maxRows * ROW_HEIGHT;
  return { nodes, edges, width, height };
}

export function findNode(graph: Graph, slug: string): GraphNode | undefined {
  return graph.nodes.find((n) => n.slug === slug);
}
