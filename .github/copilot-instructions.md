# Copilot Instructions - NodeFlow To-Do Application

This repository contains a hierarchical to-do application with unlimited depth tree structures. This file provides quick navigation to all AI agent guidance documents.

## Documentation Structure

### **Start Here: Project Context**
→ [**Tech Onboarding**](context/tech-onboarding.md)  
**Purpose**: Complete project overview, architecture, data flow, and development workflows  
**When to use**: First time working in this codebase; understanding the backend/frontend architecture, state management, API patterns, and keyboard-driven interface design

### **Coding Standards & Guidelines**

#### [**Core Standards**](code-guidelines/core-standards.md)
**Purpose**: Universal coding principles applicable to all languages and projects  
**What it covers**:
- General principles (KISS, YAGNI, DRY, Boy Scout Rule)
- SOLID design principles
- Code smell detection and elimination
- Method/class size guidelines
- Naming conventions and readability requirements

**When to consider**: 
- Before writing any new code or refactoring
- When reviewing code quality
- Resolving design decisions (should I extract this method? is this class doing too much?)

#### [**Java Spring Boot Standards**](code-guidelines/java-springboot.md)
**Purpose**: Java-specific and Spring Boot best practices  
**What it covers**:
- Java 17+ conventions
- Package-by-feature organization
- Spring Boot layer patterns (Controller → Service → Repository)
- Exception handling strategies
- Testing patterns (unit, integration, mocking)
- Database and API conventions

**When to consider**:
- Building or modifying backend services
- Structuring multi-layer applications
- Writing REST controllers or service layers
- Working with JPA entities and repository patterns

#### [**Angular Standards**](code-guidelines/angular.md)
**Purpose**: Angular-specific and TypeScript best practices  
**What it covers**:
- Angular 17+ standalone components
- Reactive state management with RxJS
- Service patterns and dependency injection
- Component architecture and communication
- TypeScript conventions

**When to consider**:
- Building or modifying frontend components
- Managing application state
- Implementing reactive patterns
- Working with Angular Material


## Recommended Workflow

1. **First visit**: Read [tech-onboarding.md](context/tech-onboarding.md) for complete project context
2. **Backend work**: Reference [java-springboot.md](code-guidelines/java-springboot.md) for Spring Boot patterns
3. **Frontend work**: Reference [angular.md](code-guidelines/angular.md) for Angular best practices
4. **All work**: Apply [core-standards.md](code-guidelines/core-standards.md) principles
5. **Before commits**: Run tests (`mvn test` for backend, `ng test` for frontend)

## Project-Specific Reminders

- **Full-stack application**: Java Spring Boot 3.2 backend + Angular 17+ frontend
- **Architecture**: Classic layered backend with reactive frontend state management
- **Database**: H2 in-memory (data lost on restart)
- **Key patterns**: Self-referential hierarchy, client-side tree building, position management
- **Testing**: Mockito 5.14.2 with ByteBuddy experimental flag for backend
- **Scripts**: Use `./start-backend.sh` and `./start-frontend.sh` for local development

## Additional Resources

- [README.md](../README.md) for project overview, setup instructions, and keyboard shortcuts
- Tech stack: Spring Boot 3.2, Angular 17+, H2 Database, Angular Material
- Ports: Backend runs on 8080, Frontend on 4200
