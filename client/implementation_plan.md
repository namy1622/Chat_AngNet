# Main Layout Implementation Plan

## Goal Description
Implement the core application layout ("Main Layout") following the 3-column design (or Responsive Sidebar + Content) as specified in the project requirements. This serves as the container for the authenticated user experience, hosting the navigation/sidebar and the active chat conversation.

## User Review Required
> [!IMPORTANT]
> - I will use a **Grid/Flexbox** approach for the layout.
> - The layout will be responsive: Sidebar hidden/drawer on mobile, visible on desktop.
> - I will create a `ChatFeature` module (standalone components) to house the chat-specific logic.

## Proposed Changes

### Layout Layer
#### [MODIFY] [main-layout.component.ts](file:///f:/ProjectAngular/Chat_AngNet/client/src/app/layout/main-layout/main-layout.component.ts)
- Implement the HTML structure for the Side Nav and Main Content area.
- Add responsive styling (SCSS).

### Features Layer (New)
#### [NEW] [src/app/features/chat/](file:///f:/ProjectAngular/Chat_AngNet/client/src/app/features/chat/)
- Create `SidebarComponent` or `ConversationListComponent`.
- Create `ChatWindowComponent`.

### Routing
#### [MODIFY] [app.routes.ts](file:///f:/ProjectAngular/Chat_AngNet/client/src/app/app.routes.ts)
- Add a route for `''` (authenticated home) pointing to `MainLayoutComponent`.
- Configure child routes for selecting a conversation.

## Verification Plan

### Manual Verification
- **Desktop**: Verify sidebar is visible and content area is on the right.
- **Mobile**: Verify sidebar collapses into a menu/drawer or takes full width (depending on design choice).
- **Navigation**: Verify URL changes when clicking mock conversations.
