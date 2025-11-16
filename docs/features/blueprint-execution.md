# Blueprint Execution Feature

## Overview
The Blueprint Execution feature provides a detailed, structured view of AI-generated project blueprints with step-by-step guidance for implementation.

## Features

### 1. Structured Blueprint Display
- **Blueprint Header**: Title, summary, and action buttons (Save, Export, Generate UI)
- **Tabbed Interface**: Easy navigation between different sections
- **Responsive Design**: Works seamlessly on mobile and desktop

### 2. Blueprint Sections

#### Scope Tab
- List of all planned features
- Clear checkmark indicators
- Comprehensive feature breakdown

#### Tech Stack Tab
- Visual cards for each technology category
  - Frontend
  - Backend
  - Database
  - Authentication
  - Styling
  - Hosting
  - Additional tools
- Color-coded for easy identification

#### System Design Tab
- Module breakdown with:
  - Description
  - API endpoints
  - Component list
- Database schema overview
- Architecture visualization

#### Folder Structure Tab
- Visual file tree representation
- Directory and file icons
- Monospace font for clarity
- Collapsible structure

#### Tasks Tab
- Task cards with:
  - Title and description
  - Estimated hours
  - Difficulty rating (1-10 stars)
  - Sprint assignment
  - Dependencies tracking
- Sortable and filterable

#### Hints & Risks Tab
- Development best practices
- Architectural hints
- Potential risks and warnings
- Color-coded alerts

### 3. Project Estimates
- Total estimated hours
- Difficulty level (1-10 scale)
- Monthly hosting cost estimate
- Visual dashboard cards

## API Endpoints

### Get Blueprint
```
GET /api/ai/blueprint/:id
```

Returns structured blueprint JSON with all details.

### Generate Blueprint
```
POST /api/ai/blueprint
```

**Request Body:**
```json
{
  "idea": "Build a task management app",
  "userId": "user123",
  "complexity": "moderate",
  "platform": "web",
  "features": ["auth", "real-time", "notifications"]
}
```

**Response:**
```json
{
  "blueprint": {
    "title": "Task Management App",
    "summary": "A collaborative task manager...",
    "scope": [...],
    "stack": {...},
    "systemDesign": {...},
    "tasks": [...],
    "hints": [...],
    "risks": [...],
    "estimatedTotalHours": 80,
    "difficulty": 7,
    "monthlyHostingCost": 20
  },
  "blueprintId": "blueprint_123abc",
  "success": true
}
```

## Components

### BlueprintHeader
Location: `components/feature/BlueprintHeader.tsx`

**Props:**
- `title`: string - Blueprint title
- `summary`: string - Brief description
- `onSave?`: () => void - Save callback
- `onExport?`: () => void - Export callback
- `onGenerateUI?`: () => void - Generate UI callback
- `isSaving?`: boolean - Loading state

**Usage:**
```tsx
<BlueprintHeader
  title="My Project"
  summary="A great app idea"
  onSave={handleSave}
  onExport={handleExport}
  onGenerateUI={handleGenerateUI}
/>
```

### BlueprintSteps
Location: `components/feature/BlueprintSteps.tsx`

**Props:**
- `scope`: string[] - Feature list
- `stack`: object - Technology stack
- `systemDesign?`: object - Architecture details
- `folderStructure`: string[] - File tree
- `tasks`: Task[] - Development tasks
- `hints?`: string[] - Best practices
- `risks?`: string[] - Potential issues

**Usage:**
```tsx
<BlueprintSteps
  scope={blueprint.scope}
  stack={blueprint.stack}
  systemDesign={blueprint.systemDesign}
  folderStructure={blueprint.folderStructure}
  tasks={blueprint.tasks}
  hints={blueprint.hints}
  risks={blueprint.risks}
/>
```

### UiGeneratorPreview
Location: `components/feature/UiGeneratorPreview.tsx`

**Props:**
- `screens`: Screen[] - List of screens
- `componentDefs`: ComponentDef[] - Component definitions
- `colorPalette?`: object - Color scheme
- `onCopyComponent?`: (component) => void - Copy callback

**Usage:**
```tsx
<UiGeneratorPreview
  screens={uiData.screens}
  componentDefs={uiData.componentDefs}
  colorPalette={uiData.colorPalette}
  onCopyComponent={handleCopyComponent}
/>
```

## Page Routes

### Blueprint Detail Page
Route: `/blueprint/[id]`  
Location: `app/blueprint/[id]/page.tsx`

Displays full blueprint details with all sections and allows UI generation for Pro users.

## User Flow

1. **Generate Blueprint**: User creates a blueprint from the home page
2. **View Blueprint**: Blueprint is saved and user is redirected to `/blueprint/[id]`
3. **Explore Sections**: User navigates tabs to view different aspects
4. **Generate UI** (Pro): Click "Generate UI" to create component code
5. **Copy Components**: Copy generated code to clipboard
6. **Export**: Download as PDF, Markdown, or create GitHub repo

## Pro Features
- UI Generation
- Code Generation
- GitHub Auto-creation
- Unlimited blueprints
- Advanced estimates

## Technical Details

### Storage
- Blueprints stored in Firestore under `users/{userId}/blueprints_v2/{blueprintId}`
- Includes original idea, generated data, and metadata
- Timestamped for history tracking

### State Management
- Local React state for UI interactions
- Firebase for authentication state
- Real-time updates via Firestore listeners (future)

### Performance
- Server-side rendering for initial load
- Client-side navigation for tabs
- Lazy loading for large code blocks

## Future Enhancements
- [ ] Blueprint versioning
- [ ] Collaborative editing
- [ ] Task progress tracking
- [ ] Integration with project management tools
- [ ] Real-time collaboration
- [ ] AI-powered suggestions during development
- [ ] Automated testing recommendations

## Troubleshooting

### Blueprint not loading
- Check if user is authenticated
- Verify blueprint ID exists in Firestore
- Check console for API errors

### UI generation fails
- Verify user has Pro subscription
- Check Mistral API key configuration
- Ensure rate limits not exceeded

### Components not copying
- Check browser clipboard permissions
- Verify component JSX is valid
- Try using copy button in modal view

## Related Documentation
- [API Endpoints](./api-endpoints.md)
- [UI Generator](./ui-generator.md)
- [Code Generator](./code-generator.md)
