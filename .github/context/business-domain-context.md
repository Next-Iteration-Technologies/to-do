# NodeFlow - Business Domain Context

## Purpose

NodeFlow is a hierarchical task management application designed to help users organize complex tasks and information using an unlimited-depth tree structure. It provides a keyboard-driven, fast, and intuitive interface for managing nested to-do lists, project plans, notes, and any hierarchically organized information.

## Target Users

**Current Scope**: Individual users managing personal tasks, projects, or knowledge bases  
**Future Scope**: Multi-user support with authentication and authorization (planned enhancement)

## Core Business Domain

### Domain Model

The application revolves around a single core entity: **Node**

A **Node** represents any item in the hierarchy and can be:
- A task or to-do item
- A project or category
- A note or information snippet
- A folder-like container for organizing other nodes

### Key Business Concepts

#### 1. Hierarchical Structure
- **Unlimited Depth**: Nodes can nest infinitely (parent-child relationships)
- **Self-Referential**: Each node may reference a parent node via `parentId`
- **Root Nodes**: Top-level nodes with `parentId = null`
- **Sibling Ordering**: Nodes at the same level maintain sequential `position` for consistent ordering

**Business Rules**:
- A node cannot be its own ancestor (circular reference prevention)
- Position numbers are automatically recalculated when nodes are moved or deleted
- Deleting a parent cascades to all descendants

#### 2. Node Lifecycle States

**Completion Status** (`isCompleted`):
- Tracks whether a task is done
- Used for filtering and productivity metrics
- Does not automatically affect child nodes (manual per-node control)

**Expansion State** (`isExpanded`):
- UI state indicating whether children are visible
- Persisted to maintain user's view preferences across sessions

**Starred/Favorited** (`isStarred`):
- Quick-access marking for important nodes
- Used for filtering priority items

#### 3. Content Enrichment

**Tags** (`tags[]`):
- Multi-value categorization
- Enables cross-hierarchy filtering (e.g., all nodes tagged "urgent")
- Case-insensitive search support

**Notes** (`notes`):
- Extended text content separate from main node content
- Supports detailed descriptions, context, or sub-information
- Full-text searchable

**Formatting**:
- Rich text support in node content
- Underline, bold, and other formatting preserved
- Hyperlink auto-detection and rendering

#### 4. Mirror Nodes
- Concept for future enhancement
- `mirrorId` field reserved for linking/referencing other nodes without duplication
- Not currently implemented in business logic

---

## Core Business Capabilities

### 1. Hierarchy Management

**Create Nodes**:
- Add child nodes at any level
- Automatically assigned position at end of sibling list
- Parent validation ensures referential integrity

**Move Nodes**:
- Change parent (re-parent operation)
- Change position within sibling list
- Maintains all descendant relationships
- Position recalculation for both source and destination parent's children

**Delete Nodes**:
- Recursive deletion of all descendants
- Sibling positions automatically compressed
- Cannot be undone after persistence (UI undo only works for current session)

**Duplicate Nodes**:
- Creates a copy of a node (including content, tags, notes)
- Does not duplicate children (shallow copy)
- Assigned new ID and position

### 2. Content Management

**Editing**:
- Inline content editing
- Notes management via dedicated panel
- Tag addition/removal
- Formatting application

**Search**:
- Full-text search across content, tags, and notes
- Combined filtering (query + tag + completion status)
- Results include context snippets showing match location
- Case-insensitive matching

### 3. View Management

**Zoom Feature**:
- Focus on a specific subtree by "zooming into" a node
- Treats selected node's children as temporary root level
- Breadcrumb navigation maintains zoom stack
- Enables deep work on specific project areas without distraction

**Filtering**:
- By completion status (show only completed/incomplete)
- By starred status
- By search results
- Combines with tree expansion for focused views

### 4. User Actions & History

**Undo/Redo**:
- Action history tracking for create, delete, update, move, toggle operations
- Session-based stack (lost on refresh)
- Keyboard shortcuts: Ctrl/Cmd+Z (undo), Ctrl/Cmd+Y (redo)

**Clipboard Operations**:
- Copy/paste nodes
- Preserves node structure (shallow copy)
- Cross-session clipboard (within browser session)

**Batch Operations**:
- Multiple node updates in single transaction
- Used for bulk state changes
- Sort children alphabetically

### 5. Data Portability

**Export Formats**:
- **JSON**: Full data structure with metadata
- **Markdown**: Human-readable hierarchical format with indentation
- **Plain Text**: Simple text representation with bullets

**Import Formats**:
- JSON import with validation
- Markdown import (detects hierarchy from indentation)
- Plain text import (supports bullet points and indentation)

**Use Cases**:
- Backup/restore personal data
- Share hierarchies with others
- Migrate to/from other tools
- Archive completed projects

---

## System Architecture Context

### Application Type
**Standalone Web Application** - No external system integrations

### Technology Stack

**Backend**:
- Java 17 + Spring Boot 3.2
- H2 In-Memory Database (volatile storage)
- RESTful API
- CORS enabled for frontend communication

**Frontend**:
- Angular 17+ (standalone components)
- TypeScript
- Angular Material UI
- Reactive state management with RxJS

### Data Persistence

**Current**: H2 in-memory database
- **Volatility**: All data lost on application restart
- **Scope**: Development/demo environment
- **Access**: H2 console available at `/h2-console`

**Implication**: Users should regularly export their data for persistence

**Future Consideration**: Migration to persistent database (PostgreSQL, MySQL) for production

---

## Integration Points

### Current State
**No External Integrations** - This is a self-contained application

### Internal Communication

**Frontend ↔ Backend**:
- REST API over HTTP
- Base URL: `http://localhost:8080/api/nodes`
- JSON request/response payloads
- CORS configuration for local development

**API Endpoints**:
```
GET    /api/nodes                    # Get root nodes
GET    /api/nodes/{id}/children      # Get node's children
GET    /api/nodes/{id}               # Get specific node
POST   /api/nodes                    # Create node
PUT    /api/nodes/{id}               # Update node
DELETE /api/nodes/{id}               # Delete node (cascades)
PUT    /api/nodes/{id}/move          # Move node
PATCH  /api/nodes/{id}/complete      # Toggle completion
PATCH  /api/nodes/{id}/expand        # Toggle expansion
PATCH  /api/nodes/{id}/star          # Toggle starred
PATCH  /api/nodes/{id}/notes         # Update notes
POST   /api/nodes/batch              # Batch update
GET    /api/nodes/search             # Search nodes
```

### Future Integration Opportunities

When multi-user support is added:
- **Authentication Service**: OAuth2/OIDC provider (Auth0, Keycloak)
- **User Management**: User profiles, preferences, quotas
- **Team Collaboration**: Shared hierarchies, permissions
- **Notification Service**: Task reminders, due dates
- **Cloud Storage**: Attachments, file uploads
- **Third-Party Tools**: Export to Jira, Trello, Notion, etc.

---

## Business Rules & Constraints

### Data Validation
- Node content is required (cannot be empty)
- Position must be non-negative integer
- Parent node must exist before creating children
- Maximum position value automatically calculated

### Hierarchy Constraints
- **No Circular References**: A node cannot become its own ancestor
- **Orphan Prevention**: Deleting parent deletes all descendants
- **Position Integrity**: Positions automatically maintained sequentially (no gaps)

### UI/UX Rules
- **Keyboard-First Design**: All operations accessible via keyboard shortcuts
- **Inline Editing**: Click to edit, Enter to save
- **Instant Feedback**: Optimistic UI updates, background sync
- **Expand/Collapse Memory**: Tree state persisted per user session

### Performance Considerations
- **Client-Side Tree Building**: Frontend reconstructs tree from flat node list
- **Lazy Loading**: Not currently implemented (all nodes loaded at once)
- **Search Throttling**: Prevents excessive backend calls during typing

---

## Business Metrics & KPIs (Future)

While not currently tracked, potential metrics for multi-user version:

**User Engagement**:
- Total nodes created
- Hierarchy depth distribution
- Active users per day/week
- Average nodes per user

**Productivity Metrics**:
- Task completion rate
- Time to completion
- Starred item usage
- Search query patterns

**System Health**:
- API response times
- Error rates
- Data export frequency

---

## Domain Terminology

| Term | Definition |
|------|------------|
| **Node** | Core entity representing any hierarchical item (task, note, category) |
| **Root Node** | Top-level node with no parent (`parentId = null`) |
| **Parent Node** | Node that contains children |
| **Child Node** | Node that belongs to a parent |
| **Sibling Nodes** | Nodes sharing the same parent |
| **Descendant** | Any node in the subtree below a given node |
| **Ancestor** | Any node in the path from a node to root |
| **Position** | Integer determining order among siblings |
| **Zoom** | Focusing view on a specific subtree |
| **Completion** | Binary state indicating task done/not done |
| **Starring** | Marking a node as important/favorite |
| **Mirror Node** | (Future) Reference to another node without duplication |

---

## Common User Workflows

### 1. Quick Task Capture
1. User types task in quick-add input
2. Press Enter to create root-level task
3. Press Shift+Enter to create child task
4. Continue adding siblings/children as needed
5. Space toggles completion when done

### 2. Project Planning
1. Create project root node
2. Add major phases as child nodes
3. Add specific tasks under each phase (unlimited depth)
4. Tag tasks by priority, assignee (future), or category
5. Star critical path items
6. Toggle expansion to focus on specific phases

### 3. Knowledge Organization
1. Create topic nodes as categories
2. Add notes with detailed information
3. Use tags for cross-referencing
4. Search across content and notes
5. Export as Markdown for documentation

### 4. Daily Review
1. Filter by starred items
2. Use search to find specific tags ("today", "urgent")
3. Check completion status
4. Zoom into active projects
5. Update notes and mark completed

### 5. Data Backup
1. Open Export menu
2. Select JSON format (full fidelity)
3. Save file locally
4. On restore: Import JSON file
5. Hierarchy recreated with all metadata

---

## Known Limitations

1. **Data Volatility**: H2 in-memory database means data lost on restart
2. **No Authentication**: Single-user, no login required
3. **No Collaboration**: Cannot share hierarchies between users
4. **No Due Dates**: Task scheduling not implemented
5. **No Attachments**: Cannot upload files or images
6. **No Mobile Optimization**: Keyboard-centric design assumes desktop use
7. **No Offline Mode**: Requires backend connection
8. **Search Performance**: Full-table scan on large hierarchies
9. **No Audit Trail**: Changes not logged beyond session undo stack

---

## Security Considerations

**Current State** (Development):
- No authentication or authorization
- No rate limiting
- No input sanitization beyond basic validation
- CORS open to localhost only
- No HTTPS enforcement

**Production Requirements** (Future):
- User authentication (OAuth2/JWT)
- Authorization per node (owner-based access control)
- Input sanitization against XSS
- SQL injection prevention (parameterized queries already in place)
- Rate limiting on API endpoints
- HTTPS mandatory
- CSRF protection
- Session management

---

## Deployment Context

**Current Setup**:
- Local development only
- Backend: `./start-backend.sh` (port 8080)
- Frontend: `./start-frontend.sh` (port 4200)
- No containerization
- No CI/CD pipeline

**Future Production Deployment**:
- Docker containerization
- Cloud hosting (AWS, Azure, GCP)
- Database migration to persistent store
- Load balancing for scalability
- CDN for frontend assets
- Environment-based configuration

---

## Getting Started for New Team Members

### Business Domain Learning Path

1. **Understand the Core Entity**: Read the Node entity definition ([backend/src/main/java/com/todo/entity/Node.java](backend/src/main/java/com/todo/entity/Node.java))
2. **Explore Key Operations**: Review NodeService business logic ([backend/src/main/java/com/todo/service/NodeService.java](backend/src/main/java/com/todo/service/NodeService.java))
3. **Try the Application**: Run locally and create a sample project hierarchy
4. **Experiment with Features**: 
   - Create multi-level hierarchies
   - Test move operations
   - Try search and filtering
   - Export and re-import data
   - Use keyboard shortcuts
5. **Review Test Cases**: See business scenarios in test files

### Key Questions to Ask

- How deep is the typical user hierarchy?
- What are common use cases beyond to-do lists?
- How should we handle very large hierarchies (1000+ nodes)?
- What are the most valuable features for users?
- When will multi-user support be prioritized?

---

## Future Roadmap Considerations

**Multi-User Support**:
- User registration and authentication
- Per-user data isolation
- Sharing and collaboration features
- Permission management

**Enhanced Task Management**:
- Due dates and reminders
- Recurring tasks
- Task dependencies
- Time tracking
- Priority levels

**Collaboration Features**:
- Shared hierarchies
- Real-time collaboration
- Comments and discussions
- Activity feed

**Advanced Features**:
- Mobile application
- Offline mode with sync
- File attachments
- Calendar integration
- Templates for common structures
- AI-powered suggestions

---

## Questions & Support

For business domain questions, contact the product owner or refer to:
- [README.md](README.md) - Setup and usage instructions
- [Tech Onboarding](.github/context/tech-onboarding.md) - Technical architecture
- User Stories folder - Feature specifications
- Test cases - Business scenario examples

Welcome to NodeFlow! 🚀
