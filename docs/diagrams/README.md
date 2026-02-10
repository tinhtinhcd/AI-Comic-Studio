# AI Comic Studio Diagrams

This directory contains all architectural diagrams for the AI Comic Studio project in both Mermaid and Draw.io formats.

## Available Diagrams

### 1. High-Level System Architecture
- **Mermaid**: `01-high-level-system-architecture.mmd` (embedded in blog post)
- **Draw.io**: `01-high-level-system-architecture.drawio`
- **Description**: Shows the 5-layer architecture (UI → Agents → Services → Data → APIs)

### 2. Agent Collaboration Workflow
- **Mermaid**: `02-agent-collaboration-workflow.mmd` (embedded in blog post)
- **Draw.io**: `02-agent-collaboration-workflow.drawio`
- **Description**: Illustrates how AI agents collaborate in the comic production pipeline

### 3. Multi-Surface Application Architecture
- **Mermaid**: `03-multi-surface-architecture.mmd` (embedded in blog post)
- **Draw.io**: `03-multi-surface-architecture.drawio`
- **Description**: Shows how one codebase serves four different surfaces (Studio/Reader/Admin/Landing)

### 4. Data Flow & State Management
- **Mermaid**: `04-data-flow-state-management.mmd` (embedded in blog post)
- **Draw.io**: `04-data-flow-state-management.drawio`
- **Description**: Illustrates state flow and persistence strategies

### 5. AI Service Integration Architecture
- **Mermaid**: `05-ai-service-integration.mmd` (embedded in blog post)
- **Draw.io**: `05-ai-service-integration.drawio`
- **Description**: Shows AI service layer and request management

### 6. Component Architecture Overview
- **Mermaid**: `06-component-architecture.mmd` (embedded in blog post)
- **Draw.io**: `06-component-architecture.drawio`
- **Description**: Displays React component hierarchy and relationships

## How to Use

### For Blog Posts & Documentation
The Mermaid diagrams are embedded directly in the blog post and will render automatically on:
- GitHub (native support)
- GitLab (native support)
- Dev.to (Mermaid support)
- Notion (Mermaid blocks)
- Personal blogs (with Mermaid.js)

### For Presentations & Documents
Use the Draw.io files for:
- PowerPoint presentations (export as PNG/SVG)
- PDF documents (export as high-quality images)
- Google Docs (insert as images)
- Design documentation (print-friendly)

### For Editing & Customization
- **Mermaid**: Edit directly in markdown files
- **Draw.io**: Open files in [diagrams.net](https://app.diagrams.net) or VS Code with Draw.io extension

## File Naming Convention

- `01-` to `06-`: Numbered for consistent ordering
- Descriptive names matching blog post sections
- `.drawio` extension for Draw.io format
- `.mmd` extension for Mermaid format (embedded in blog)

## Color Coding Legend

- **Blue/Purple**: User interface and application layers
- **Green**: AI agents and creative components
- **Orange/Yellow**: Processing and state management
- **Pink/Purple**: Data persistence and storage
- **Gray**: External APIs and services

## Technical Notes

### Mermaid Compatibility
- Tested on GitHub, GitLab, Dev.to
- Uses standard Mermaid syntax (graph TB, flowchart LR, stateDiagram-v2)
- Includes styling with `fill` and `stroke` properties

### Draw.io Features
- Professional layouts with proper spacing
- Color-coded components for clarity
- Hierarchical structure visualization
- Export-friendly for multiple formats

## Usage Rights

All diagrams are open-source under the MIT license, same as the AI Comic Studio project. Feel free to:
- Use in presentations
- Modify for your own projects
- Share in documentation
- Reference in technical articles

## Contributing

To add new diagrams or update existing ones:
1. Create both Mermaid and Draw.io versions
2. Follow the naming convention
3. Update this README
4. Test Mermaid rendering on GitHub
5. Ensure color consistency with existing diagrams
