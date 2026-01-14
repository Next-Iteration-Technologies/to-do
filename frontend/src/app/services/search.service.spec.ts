import { SearchService } from './search.service';
import { Node } from '../models/node.model';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    service = new SearchService();
  });

  it('should search across content, tags and notes', () => {
    const nodes: Node[] = [
      { 
        id: 1, 
        content: 'Buy milk #groceries', 
        notes: 'from store', 
        tags: ['groceries'],
        parentId: null,
        position: 0,
        createdAt: '',
        updatedAt: ''
      },
      { 
        id: 2, 
        content: 'Work task', 
        notes: 'deadline soon', 
        tags: ['work'],
        parentId: null,
        position: 1,
        createdAt: '',
        updatedAt: ''
      }
    ];

    service.search('groceries', nodes);
    const res = service.getCurrentResults();
    expect(res.length).toBe(1);
    expect(res[0].node.id).toBe(1);
  });

  describe('Filtered Node IDs Computation', () => {
    it('should return empty set when query is empty', (done) => {
      const mockNodes: Node[] = [
        { id: 1, content: 'Buy milk', parentId: null, position: 0, createdAt: '', updatedAt: '' },
        { id: 2, content: 'Buy bread', parentId: null, position: 1, createdAt: '', updatedAt: '' }
      ];

      service.search('', mockNodes);

      service.filteredNodeIds$.subscribe(ids => {
        expect(ids.size).toBe(0);
        done();
      });
    });

    it('should return empty set and set isSearching to false when query is empty', (done) => {
      const mockNodes: Node[] = [
        { id: 1, content: 'Buy milk', parentId: null, position: 0, createdAt: '', updatedAt: '' }
      ];

      service.search('', mockNodes);

      service.isSearching$.subscribe(isSearching => {
        expect(isSearching).toBe(false);
        done();
      });
    });

    it('should include all ancestor nodes of matching nodes', (done) => {
      const nodes: Node[] = [
        { id: 1, content: 'Projects', parentId: null, position: 0, createdAt: '', updatedAt: '' },
        { id: 2, content: 'Shopping', parentId: 1, position: 0, createdAt: '', updatedAt: '' },
        { id: 3, content: 'Buy milk', parentId: 2, position: 0, createdAt: '', updatedAt: '' }
      ];

      service.search('milk', nodes);

      service.filteredNodeIds$.subscribe(ids => {
        expect(ids.has(3)).toBe(true); // matching node
        expect(ids.has(2)).toBe(true); // parent
        expect(ids.has(1)).toBe(true); // grandparent
        expect(ids.size).toBe(3);
        done();
      });
    });

    it('should include all descendant nodes of matching nodes', (done) => {
      const nodes: Node[] = [
        { id: 1, content: 'Groceries', parentId: null, position: 0, createdAt: '', updatedAt: '' },
        { id: 2, content: 'Buy milk', parentId: 1, position: 0, createdAt: '', updatedAt: '' },
        { id: 3, content: 'Organic milk', parentId: 2, position: 0, createdAt: '', updatedAt: '' }
      ];

      service.search('groceries', nodes);

      service.filteredNodeIds$.subscribe(ids => {
        expect(ids.has(1)).toBe(true); // matching node
        expect(ids.has(2)).toBe(true); // child
        expect(ids.has(3)).toBe(true); // grandchild
        expect(ids.size).toBe(3);
        done();
      });
    });

    it('should match nodes by content, tags, and notes', (done) => {
      const nodes: Node[] = [
        { 
          id: 1, 
          content: 'Task 1', 
          tags: ['shopping', 'urgent'], 
          parentId: null, 
          position: 0, 
          createdAt: '', 
          updatedAt: '' 
        },
        { 
          id: 2, 
          content: 'Task 2', 
          notes: 'Remember to go shopping later', 
          parentId: null, 
          position: 1, 
          createdAt: '', 
          updatedAt: '' 
        },
        { 
          id: 3, 
          content: 'Buy shopping items', 
          parentId: null, 
          position: 2, 
          createdAt: '', 
          updatedAt: '' 
        }
      ];

      service.search('shopping', nodes);

      service.filteredNodeIds$.subscribe(ids => {
        expect(ids.has(1)).toBe(true); // matches in tags
        expect(ids.has(2)).toBe(true); // matches in notes
        expect(ids.has(3)).toBe(true); // matches in content
        expect(ids.size).toBe(3);
        done();
      });
    });

    it('should perform case-insensitive search', (done) => {
      const nodes: Node[] = [
        { id: 1, content: 'Buy MILK', parentId: null, position: 0, createdAt: '', updatedAt: '' },
        { id: 2, content: 'buy Milk', parentId: null, position: 1, createdAt: '', updatedAt: '' }
      ];

      service.search('milk', nodes);

      service.filteredNodeIds$.subscribe(ids => {
        expect(ids.has(1)).toBe(true);
        expect(ids.has(2)).toBe(true);
        expect(ids.size).toBe(2);
        done();
      });
    });

    it('should include both ancestors and descendants of matching node', (done) => {
      const nodes: Node[] = [
        { id: 1, content: 'Root', parentId: null, position: 0, createdAt: '', updatedAt: '' },
        { id: 2, content: 'Parent', parentId: 1, position: 0, createdAt: '', updatedAt: '' },
        { id: 3, content: 'Matching groceries node', parentId: 2, position: 0, createdAt: '', updatedAt: '' },
        { id: 4, content: 'Child 1', parentId: 3, position: 0, createdAt: '', updatedAt: '' },
        { id: 5, content: 'Child 2', parentId: 3, position: 1, createdAt: '', updatedAt: '' }
      ];

      service.search('groceries', nodes);

      service.filteredNodeIds$.subscribe(ids => {
        expect(ids.has(1)).toBe(true); // grandparent
        expect(ids.has(2)).toBe(true); // parent
        expect(ids.has(3)).toBe(true); // matching node
        expect(ids.has(4)).toBe(true); // child 1
        expect(ids.has(5)).toBe(true); // child 2
        expect(ids.size).toBe(5);
        done();
      });
    });

    it('should handle multiple matching nodes with overlapping ancestors', (done) => {
      const nodes: Node[] = [
        { id: 1, content: 'Root', parentId: null, position: 0, createdAt: '', updatedAt: '' },
        { id: 2, content: 'Buy milk', parentId: 1, position: 0, createdAt: '', updatedAt: '' },
        { id: 3, content: 'Buy milk powder', parentId: 1, position: 1, createdAt: '', updatedAt: '' }
      ];

      service.search('milk', nodes);

      service.filteredNodeIds$.subscribe(ids => {
        expect(ids.has(1)).toBe(true); // shared ancestor
        expect(ids.has(2)).toBe(true); // matching node 1
        expect(ids.has(3)).toBe(true); // matching node 2
        expect(ids.size).toBe(3);
        done();
      });
    });

    it('should handle nodes with no parents (root nodes)', (done) => {
      const nodes: Node[] = [
        { id: 1, content: 'Buy milk', parentId: null, position: 0, createdAt: '', updatedAt: '' }
      ];

      service.search('milk', nodes);

      service.filteredNodeIds$.subscribe(ids => {
        expect(ids.has(1)).toBe(true);
        expect(ids.size).toBe(1);
        done();
      });
    });

    it('should handle nodes with no children (leaf nodes)', (done) => {
      const nodes: Node[] = [
        { id: 1, content: 'Projects', parentId: null, position: 0, createdAt: '', updatedAt: '' },
        { id: 2, content: 'Buy milk', parentId: 1, position: 0, createdAt: '', updatedAt: '' }
      ];

      service.search('projects', nodes);

      service.filteredNodeIds$.subscribe(ids => {
        expect(ids.has(1)).toBe(true); // matching node
        expect(ids.has(2)).toBe(true); // child
        expect(ids.size).toBe(2);
        done();
      });
    });

    it('should clear filtered node IDs when clearSearch is called', () => {
      const nodes: Node[] = [
        { id: 1, content: 'Buy milk', parentId: null, position: 0, createdAt: '', updatedAt: '' }
      ];

      service.search('milk', nodes);
      expect(service.getFilteredNodeIds().size).toBeGreaterThan(0);

      service.clearSearch();
      expect(service.getFilteredNodeIds().size).toBe(0);
    });

    it('should return current filtered node IDs via getFilteredNodeIds', () => {
      const nodes: Node[] = [
        { id: 1, content: 'Root', parentId: null, position: 0, createdAt: '', updatedAt: '' },
        { id: 2, content: 'Buy milk', parentId: 1, position: 0, createdAt: '', updatedAt: '' }
      ];

      service.search('milk', nodes);
      const filteredIds = service.getFilteredNodeIds();

      expect(filteredIds.has(1)).toBe(true);
      expect(filteredIds.has(2)).toBe(true);
      expect(filteredIds.size).toBe(2);
    });

    it('should handle deep hierarchies correctly', (done) => {
      const nodes: Node[] = [
        { id: 1, content: 'Level 1', parentId: null, position: 0, createdAt: '', updatedAt: '' },
        { id: 2, content: 'Level 2', parentId: 1, position: 0, createdAt: '', updatedAt: '' },
        { id: 3, content: 'Level 3', parentId: 2, position: 0, createdAt: '', updatedAt: '' },
        { id: 4, content: 'Level 4', parentId: 3, position: 0, createdAt: '', updatedAt: '' },
        { id: 5, content: 'Buy milk Level 5', parentId: 4, position: 0, createdAt: '', updatedAt: '' },
        { id: 6, content: 'Level 6', parentId: 5, position: 0, createdAt: '', updatedAt: '' }
      ];

      service.search('milk', nodes);

      service.filteredNodeIds$.subscribe(ids => {
        // All ancestors
        expect(ids.has(1)).toBe(true);
        expect(ids.has(2)).toBe(true);
        expect(ids.has(3)).toBe(true);
        expect(ids.has(4)).toBe(true);
        // Matching node
        expect(ids.has(5)).toBe(true);
        // Descendant
        expect(ids.has(6)).toBe(true);
        expect(ids.size).toBe(6);
        done();
      });
    });

    it('should not include unrelated nodes', (done) => {
      const nodes: Node[] = [
        { id: 1, content: 'Root 1', parentId: null, position: 0, createdAt: '', updatedAt: '' },
        { id: 2, content: 'Buy milk', parentId: 1, position: 0, createdAt: '', updatedAt: '' },
        { id: 3, content: 'Root 2', parentId: null, position: 1, createdAt: '', updatedAt: '' },
        { id: 4, content: 'Unrelated task', parentId: 3, position: 0, createdAt: '', updatedAt: '' }
      ];

      service.search('milk', nodes);

      service.filteredNodeIds$.subscribe(ids => {
        expect(ids.has(1)).toBe(true); // ancestor of matching node
        expect(ids.has(2)).toBe(true); // matching node
        expect(ids.has(3)).toBe(false); // unrelated root
        expect(ids.has(4)).toBe(false); // unrelated child
        expect(ids.size).toBe(2);
        done();
      });
    });
  });
});

