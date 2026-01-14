import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Node, SearchResult } from '../models/node.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchQuerySubject = new BehaviorSubject<string>('');
  private searchResultsSubject = new BehaviorSubject<SearchResult[]>([]);
  private filteredNodeIdsSubject = new BehaviorSubject<Set<number>>(new Set());
  private isSearchingSubject = new BehaviorSubject<boolean>(false);

  searchQuery$ = this.searchQuerySubject.asObservable();
  searchResults$ = this.searchResultsSubject.asObservable();
  filteredNodeIds$ = this.filteredNodeIdsSubject.asObservable();
  isSearching$ = this.isSearchingSubject.asObservable();

  constructor() {}

  search(query: string, nodes: Node[]): void {
    this.searchQuerySubject.next(query);
    
    if (!query.trim()) {
      this.searchResultsSubject.next([]);
      this.filteredNodeIdsSubject.next(new Set());
      this.isSearchingSubject.next(false);
      return;
    }

    this.isSearchingSubject.next(true);
    const results = this.performSearch(query.toLowerCase(), nodes);
    this.searchResultsSubject.next(results);
    
    // Compute visible node IDs for filtered tree view
    const visibleIds = this.computeVisibleNodeIds(query.toLowerCase(), nodes);
    this.filteredNodeIdsSubject.next(visibleIds);
  }

  private performSearch(query: string, nodes: Node[]): SearchResult[] {
    const results: SearchResult[] = [];
    
    for (const node of nodes) {
      if (this.nodeMatches(node, query)) {
        const matches: string[] = [];
        
        // Find matches in content
        if (node.content.toLowerCase().includes(query)) {
          matches.push('content');
        }
        
        // Find matches in tags
        const tags = node.tags?.join(' ').toLowerCase() || '';
        if (tags.includes(query)) {
          matches.push('tags');
        }
        
        // Find matches in notes
        if (node.notes?.toLowerCase().includes(query)) {
          matches.push('notes');
        }
        
        // Extract context around the match
        const context = this.extractContext(node.content, query);
        
        results.push({
          node,
          matches,
          context
        });
      }
    }
    
    return results;
  }

  private computeVisibleNodeIds(query: string, nodes: Node[]): Set<number> {
    const visibleIds = new Set<number>();
    const matchingNodes: Node[] = [];

    // Find all matching nodes
    for (const node of nodes) {
      if (this.nodeMatches(node, query)) {
        matchingNodes.push(node);
        visibleIds.add(node.id);
      }
    }

    // Add all ancestors of matching nodes
    for (const node of matchingNodes) {
      this.addAncestors(node, nodes, visibleIds);
    }

    // Add all descendants of matching nodes
    for (const node of matchingNodes) {
      this.addDescendants(node, nodes, visibleIds);
    }

    return visibleIds;
  }

  private nodeMatches(node: Node, query: string): boolean {
    const content = node.content.toLowerCase();
    const tags = node.tags?.join(' ').toLowerCase() || '';
    const notes = node.notes?.toLowerCase() || '';
    const searchText = `${content} ${tags} ${notes}`;
    
    return searchText.includes(query);
  }

  private addAncestors(node: Node, allNodes: Node[], visibleIds: Set<number>): void {
    let currentNode = node;
    
    while (currentNode.parentId !== null) {
      const parent = allNodes.find(n => n.id === currentNode.parentId);
      if (!parent) break;
      
      visibleIds.add(parent.id);
      currentNode = parent;
    }
  }

  private addDescendants(node: Node, allNodes: Node[], visibleIds: Set<number>): void {
    const children = allNodes.filter(n => n.parentId === node.id);
    
    for (const child of children) {
      visibleIds.add(child.id);
      this.addDescendants(child, allNodes, visibleIds);
    }
  }

  private extractContext(content: string, query: string): string {
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return content;
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 50);
    
    let context = content.substring(start, end);
    
    if (start > 0) {
      context = '...' + context;
    }
    
    if (end < content.length) {
      context = context + '...';
    }
    
    return context;
  }

  clearSearch(): void {
    this.searchQuerySubject.next('');
    this.searchResultsSubject.next([]);
    this.filteredNodeIdsSubject.next(new Set());
    this.isSearchingSubject.next(false);
  }

  getCurrentQuery(): string {
    return this.searchQuerySubject.value;
  }

  getFilteredNodeIds(): Set<number> {
    return this.filteredNodeIdsSubject.value;
  }

  getCurrentResults(): SearchResult[] {
    return this.searchResultsSubject.value;
  }

  isCurrentlySearching(): boolean {
    return this.isSearchingSubject.value;
  }
}
