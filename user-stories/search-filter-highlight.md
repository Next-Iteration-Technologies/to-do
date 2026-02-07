# User Story: Basic Tree Search Filtering

## Story Text

**As a** NodeFlow user managing hierarchical to-do lists  
**I want to** search for keywords in node content and see matching nodes highlighted in the tree  
**So that** I can quickly find nodes containing my search term

---

## Business Context

Currently, users have no way to visually filter or highlight nodes based on search terms within the tree view. This MVP provides immediate visual feedback by highlighting matching nodes, making it easy to spot search results at a glance.

**Note:** This is Phase 1 of the enhanced search feature. Future phases will add filtering (hiding non-matches), ancestor/descendant inclusion, multi-field search, and real-time updates.

---

## Acceptance Criteria

### AC1: Search Input with Search Button
**Given** I am viewing the tree  
**When** I click the search button/icon  
**Then** a search input field appears  
**And** I can type a search keyword  
**And** a "Search" button is available to trigger the search

### AC2: Highlight Matching Nodes
**Given** I have entered a search term and clicked "Search"  
**When** nodes contain the search keyword in their content text  
**Then** the search term should be highlighted with a yellow background within the node content  
**And** highlighting should be case-insensitive (searching "milk" highlights "Milk", "MILK", "milk")  
**And** all occurrences of the term in the same node should be highlighted  
**And** only the matching text is highlighted, not the entire node

### AC3: Clear Search
**Given** I have performed a search and see highlighted nodes  
**When** I click the "Clear" or "×" button  
**Then** all highlighting is removed  
**And** the search input is cleared  
**And** the tree returns to its normal state

### AC4: No Results Message
**Given** I have entered a search term that doesn't match any nodes  
**When** I click "Search"  
**Then** a message appears: "No results found for '[search term]'"  
**And** the message is displayed prominently in the tree area  
**And** a "Clear Search" button is available

### AC5: Search Only in Node Content
**Given** I have nodes with content text  
**When** I search for a keyword  
**Then** the search matches only against the node's main content text  
**And** tags and notes are not searched (out of scope for MVP)

---

## Out of Scope (Future Enhancements)

The following are **NOT** included in this MVP story:

1. **Filtering/hiding non-matching nodes** - All nodes remain visible, only matching text is highlighted
2. **Ancestor/descendant inclusion** - Only exact matches are highlighted
3. **Real-time search** - Search is triggered by button click, not as you type
4. **Search in tags or notes** - Only node content is searched
5. **State preservation** - Tree state (expanded/collapsed) is not preserved
6. **Keyboard shortcuts** - No keyboard navigation between results
7. **Search result count** - No badge showing number of matches

---

## Technical Requirements

### Implementation Approach

1. **Search Input Component**
   - Add search input field (can reuse existing if available)
   - Add "Search" button next to input
   - Add "Clear" or "×" button

2. **Highlighting Logic**
   - Create utility function to wrap matching text with highlight span
   - Use case-insensitive string matching
   - Escape special regex characters in search term
   - Apply highlight class (yellow background: `bg-yellow-200` or similar)

3. **Search Function**
   - Simple function that takes search term and node list
   - Returns nodes with matches (or highlights in place)
   - Case-insensitive matching

4. **No Results State**
   - Simple conditional rendering when no matches found
   - Display message with search term
   - Show Clear button


---

## Visual Mockup

```
┌─────────────────────────────────────────────────────┐
│ NodeFlow                              [Search] [≡]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔍 [milk____________] [Search] [×]                  │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Tree View (all nodes visible, matches highlighted) │
│                                                     │
│  ▼ Projects                                        │
│    ▼ Shopping                                      │
│        ▼ Groceries                                 │
│            □ Buy [milk] from store ← yellow bg     │
│                □ Get organic [milk]                │
│            □ Buy bread                             │
│    ▼ Work                                          │
│        □ Send [milk] expense report                │
│        □ Review budget                             │
│                                                     │
└─────────────────────────────────────────────────────┘

Legend:
- [milk] = highlighted with yellow background
- All nodes remain visible
- Only matching text is highlighted
```

### No Results State

```
┌─────────────────────────────────────────────────────┐
│ NodeFlow                              [Search] [≡]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔍 [xyz_nonexistent___] [Search] [×]              │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│              🔍                                      │
│                                                     │
│        No results found for "xyz_nonexistent"      │
│                                                     │
│              [Clear Search]                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Definition of Done

- [ ] Search input field appears when search is activated
- [ ] "Search" button triggers highlighting
- [ ] Matching text is highlighted with yellow background
- [ ] Highlighting is case-insensitive
- [ ] Multiple occurrences in same node are all highlighted
- [ ] "Clear" button removes all highlights and clears input
- [ ] No results message displays when no matches found
- [ ] Code follows existing patterns in codebase
- [ ] Basic unit tests for search/highlight functions
- [ ] Manual testing: search works, highlights appear, clear works
- [ ] No console errors
- [ ] Works in Chrome (at minimum)


## Success Criteria

✅ **Immediate Visual Value:** User can see highlighted matches instantly  
✅ **Simple Implementation:** No complex state management or tree traversal  
✅ **Foundation for Future:** Sets up structure for Phase 2 (filtering)  
✅ **Quick Win:** Can be completed and demoed in 1-2 days

---

## Edge Cases to Handle

1. **Empty search term:** Don't highlight anything, show all nodes normally
2. **Special characters:** Escape regex special chars (e.g., "C++", "user@email.com")
3. **Multiple matches in same node:** Highlight all occurrences
4. **Very long search terms:** Handle gracefully (no truncation needed for MVP)
5. **Search term with spaces:** Should match partial words (e.g., "mil" matches "milk")
