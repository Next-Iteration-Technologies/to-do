# NodeFlow Copilot Instructions

## Project Overview
NodeFlow is a hierarchical to-do application with unlimited depth tree structures. Backend: Spring Boot 3.2 + H2 in-memory database. Frontend: Angular 17+ standalone components with reactive state management.

## Architecture & Data Flow

### Backend (Java/Spring Boot)
- **Structure**: Classic layered architecture - `Controller` → `Service` → `Repository` → `Entity`
- **Key Entity**: `Node.java` uses self-referential hierarchy via `parentId` (nullable Long). Children are NOT eagerly loaded - queries filter by `parentId`
- **Position Management**: Nodes have integer `position` field for ordering within same parent. Service layer handles position recalculation on move/delete operations
- **Cascading Deletes**: Implemented in service layer (`NodeService.deleteNode`) via recursive children deletion, NOT database cascades
- **Move Validation**: `moveNode()` includes circular reference detection by traversing parent chain upward

### Frontend (Angular/TypeScript)
- **State Management**: Centralized in `StateService` using RxJS `BehaviorSubject` pattern. Components subscribe to `nodes$` observable
- **Component Architecture**: Standalone components (no NgModule). Main hierarchy: `AppComponent` → `NodeTreeComponent` (recursive) → `NodeItemComponent`
- **Tree Building**: Client-side tree construction in `NodeTreeComponent.buildTree()` filters flat node array by `parentId` and recursively builds children
- **Zoom Feature**: `ZoomService` maintains "focus node" - when zoomed, tree renders that node's children as root level

## Critical Development Patterns

### State Synchronization Flow
1. User action in component → Call NodeService HTTP method
2. On success → Update StateService (setNodes/addNode/updateNode)
3. StateService emits via BehaviorSubject
4. Components rebuild tree from flat node list (no separate API calls for children)

**Example** (from `node-tree.component.ts`):
```typescript
// After creating node via API
this.stateService.addNode(newNode);
// Tree auto-rebuilds via nodes$ subscription
```

### Undo/Redo System
- Action history stored as `ActionHistory` objects with `type`, `node`, and `previousState`
- Stack managed in `StateService` with `undoStack` and `redoStack` arrays
- Global keyboard shortcuts (Ctrl+Z, Ctrl+Y) handled in `AppComponent`
- When undoing, reverse operations execute (e.g., 'create' → delete node)

### Position Recalculation Pattern
Backend service method pattern for maintaining sibling order:
```java
// Get siblings, recalculate positions sequentially
List<Node> siblings = repository.findByParentIdOrderByPositionAsc(parentId);
int position = 0;
for (Node sibling : siblings) {
    if (!sibling.getId().equals(excludedId)) {
        sibling.setPosition(position++);
    }
}
```

## Development Workflows

### Running Locally
- **Backend**: `cd backend && mvn spring-boot:run` (port 8080)
- **Frontend**: `cd frontend && ng serve` (port 4200)
- **Scripts**: Use `./start-backend.sh` and `./start-frontend.sh` - they auto-kill existing processes on those ports

### Testing
- **Backend**: `cd backend && mvn test`
  - Uses Mockito 5.14.2 (upgraded for Java 24 compatibility)
  - Tests run with `-Dnet.bytebuddy.experimental=true` flag (see `pom.xml` surefire config)
  - Example: `NodeServiceTest.java` mocks repository with `.when(repo.save(any(Node.class))).thenAnswer(i -> i.getArgument(0))`
- **Frontend**: `cd frontend && ng test` (Jasmine/Karma)

### Database Notes
- H2 in-memory DB - data lost on restart
- Schema auto-created via `spring.jpa.hibernate.ddl-auto=update`
- Access console at `http://localhost:8080/h2-console` (credentials in `application.properties`)

## Project-Specific Conventions

### API Patterns
- **CRUD**: Standard REST endpoints in `NodeController` (`@RestController`, `@CrossOrigin`)
- **Toggle Operations**: PATCH endpoints for boolean toggles (`/api/nodes/{id}/complete`, `/expand`, `/star`)
- **Batch Updates**: POST `/api/nodes/batch` accepts List<Node>
- **Search**: GET `/api/nodes/search?q=keyword&tag=value&completed=true`

### Component Interactions
- **Event Emission**: Child components emit `@Output` events (e.g., `NodeItemComponent` emits `contentChanged`, `deleteRequested`)
- **Service Injection**: Heavy use of service composition in `AppComponent` (14+ services injected)
- **Keyboard Shortcuts**: Handled at `AppComponent` level via global `document.addEventListener('keydown')`, not per-component

### Styling
- Uses Angular Material (`@angular/material` v17.3.10)
- Component-specific CSS files (e.g., `node-tree.component.css`)
- No global theming beyond `styles.css`

## Key Files to Reference

- **Backend Entity Definition**: `backend/src/main/java/com/todo/entity/Node.java` - all database fields
- **Service Business Logic**: `backend/src/main/java/com/todo/service/NodeService.java` - position management, move validation
- **Frontend State**: `frontend/src/app/services/state.service.ts` - reactive state pattern
- **Tree Rendering**: `frontend/src/app/components/node-tree/node-tree.component.ts` - recursive tree building
- **Main App**: `frontend/src/app/app.component.ts` - global shortcuts, service orchestration

## Feature Implementation Reference

When implementing search/filter features (per `user-stories/search-filter-tree-view.md`):
- Filtering happens client-side in `buildTree()` method
- Ancestor nodes must be included via upward traversal of `parentId` chain
- Highlighting requires wrapping matched text in `<mark>` tags during render
- Maintain `isExpanded` state during filter mode to preserve user's tree view

## Common Pitfalls

- **Circular Dependencies**: Backend validates in `moveNode()`, but frontend should prevent UI from attempting invalid moves
- **Position Gaps**: Never rely on continuous positions - always sort by position and recalculate sequentially
- **Tree Rebuilds**: Don't call `nodeService.getChildren()` in components - tree is always built from `stateService.getAllNodes()`
- **Observable Subscriptions**: Always unsubscribe in `ngOnDestroy()` to prevent memory leaks (see pattern in `node-tree.component.ts`)
