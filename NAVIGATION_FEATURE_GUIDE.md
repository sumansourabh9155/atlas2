# Left Navigation - Complete Feature Guide

**Version**: 1.0.0
**Date**: 2026-03-25
**Status**: Production Ready ✅

---

## 🎯 Overview

The Left Navigation component is a fully featured, accessible sidebar that provides a unified entry point to all CMS modules. It features automatic state management, responsive design, and comprehensive keyboard support.

---

## 📋 Features

### 1. **Sidebar Sections**

#### Home Section
- **Dashboard** → Main dashboard view

#### Websites Section
- **Website Editor** → Build clinic websites
- **Clinic Management** (expandable) → Access clinic list, groups, multi-site options
- **Data Collection** → Import clinic data
- **Media Library** → Manage clinic media assets

#### Management Section
- **Banner Management** → Create/edit ad banners
- **Approval Flow** → Review pending clinic changes (with approval count badge)
- **User Management** → Manage team members

#### Bottom Section
- **Settings** → Access settings
- **Get Help** → Help & documentation

### 2. **Visual Indicators**

#### Active Page Highlighting
- Current page shows teal background (bg-teal-50)
- Active text in teal (text-teal-700)
- White/gray styling for inactive pages

#### Approval Badges
- Red badge on "Approval Flow" showing pending count
- Displays "99+" for counts > 99
- Only shows when count > 0

#### Submenu Indicators
- Chevron icon rotates 180° when submenu opens
- Left border accent on submenu items
- Indented styling for visual hierarchy

### 3. **Submenu Management**

#### Clinic Management Submenu
When expanded, shows:
- **Clinic List** → All clinics in system
- **Group Clinic** → Clinic groups management
- **Multi-site Clinic** → Multi-location setups

#### Behavior
- Click parent to toggle open/closed
- Click submenu item to navigate
- Smooth chevron rotation animation
- Left border visual indicator
- Remembers state during session (can be persisted)

### 4. **User Profile Section**

#### Display
- Dynamic avatar with user initials
- User name from props
- User role (admin/manager/local)
- One-click logout button

#### Customization
Pass user data via props:
```tsx
<LeftNavigation
  userName="John Smith"
  userRole="admin"
  // ...
/>
```

Avatar will display first 2 letters: "JS"

### 5. **Mobile Responsiveness**

#### Desktop (≥ 768px)
- Sidebar always visible on left
- Full width 256px (w-64)
- Smooth transitions on hover

#### Mobile (< 768px)
- Hidden by default
- Floating menu button (bottom-right)
- Slide-out drawer on open
- Dark backdrop overlay with blur effect
- Click outside drawer to close
- Close button in top-right corner

### 6. **Keyboard Navigation**

#### Supported Keys
- **Tab** → Navigate between items (focus rings visible)
- **Enter/Space** → Activate button or toggle submenu
- **Escape** → (Can be added to close mobile drawer)
- **Arrow Keys** → (Can be added for advanced nav)

#### Accessibility
- `aria-current="page"` on active nav item
- `aria-expanded` on submenu toggle
- `aria-hidden="true"` on decorative icons
- `aria-label` on icon-only buttons
- `role="navigation"` on nav sections
- Focus visible rings (teal color)

### 7. **Animation & Transitions**

#### Smooth Transitions
- All state changes: 200ms duration
- Chevron rotation: 300ms duration
- Color transitions: 200ms
- Mobile drawer: 300ms
- No jank or jumping

#### Effects
- Hover state background color
- Active state teal highlight
- Submenu chevron rotation
- Badge pulse (optional)

---

## 🚀 How to Use

### Basic Integration

```tsx
import { LeftNavigation, type AppMode } from '@/components/LeftNavigation';

function App() {
  const [activeMode, setActiveMode] = useState<AppMode>('dashboard');
  const approvalCount = 5; // From your context/API

  return (
    <LeftNavigation
      activeMode={activeMode}
      onModeChange={setActiveMode}
      approvalCount={approvalCount}
      userRole="admin"
      userName="John Smith"
      userEmail="john@clinic.com"
      onLogout={() => console.log('Logging out...')}
    />
  );
}
```

### Prop Reference

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `activeMode` | `AppMode` | - | ✓ | Current active page/module |
| `onModeChange` | `(mode: AppMode) => void` | - | ✓ | Called when user clicks nav item |
| `approvalCount` | `number` | 0 | ✗ | Pending approval count |
| `userRole` | `"admin" \| "manager" \| "local"` | "admin" | ✗ | User's role |
| `userName` | `string` | "Admin" | ✗ | Display name |
| `userEmail` | `string` | "admin@clinic.com" | ✗ | Email (shown in tooltip) |
| `onLogout` | `() => void` | - | ✗ | Logout handler |

### Updating Approval Count

```tsx
// In your parent component
const { getPendingCount } = useApproval();

<LeftNavigation
  approvalCount={getPendingCount()}
  // ... other props
/>
```

### Responsive Layout

```tsx
// Example full layout structure
<div className="h-screen flex flex-col">
  {/* Top bar */}
  <header className="h-12 bg-white border-b"></header>

  {/* Main content */}
  <div className="flex-1 overflow-hidden flex">
    {/* Left navigation */}
    <LeftNavigation
      activeMode={appMode}
      onModeChange={setAppMode}
      // ...
    />

    {/* Main content area */}
    <main className="flex-1 overflow-auto">
      {/* Page content */}
    </main>
  </div>
</div>
```

---

## 🎨 Design Customization

### Color Scheme

To customize colors, edit the `STYLES` constant:

```typescript
const STYLES = {
  sidebarWidth: "w-64",           // Sidebar width
  sidebarBg: "bg-white",          // Background color
  border: "border-gray-200",      // Border color
  activeText: "text-teal-700",    // Active text color
  activeBg: "bg-teal-50",         // Active background
  hoverBg: "hover:bg-gray-100",   // Hover background
  inactiveText: "text-gray-700",  // Inactive text
  badgeBg: "bg-red-500",          // Badge background
  badgeText: "text-white",        // Badge text
};
```

### Styling Examples

**Change primary color (teal → blue)**
```typescript
const STYLES = {
  activeText: "text-blue-700",
  activeBg: "bg-blue-50",
  // ... rest of styles
};
```

**Change sidebar width**
```typescript
const STYLES = {
  sidebarWidth: "w-72",  // 288px instead of 256px
  // ... rest of styles
};
```

**Dark mode variant** (coming soon)
```typescript
const STYLES = {
  sidebarBg: "dark:bg-gray-900",
  // ... other dark variants
};
```

---

## 📱 Mobile Behavior

### Open Menu
1. User taps floating menu button (bottom-right)
2. Drawer slides in from left
3. Backdrop appears with slight blur
4. Navigation fully accessible

### Close Menu
1. User can:
   - Click the X button in top-right
   - Click the backdrop overlay
   - Click a nav item (auto-closes)
2. Drawer slides out smoothly
3. Focus returns to menu button

### Touch Interactions
- Buttons have larger touch targets (py-2)
- Spacing designed for mobile (gap-3)
- Smooth scrolling on long lists
- No hover states on touch devices

---

## ⌨️ Keyboard Navigation Guide

### Tab Navigation
1. **Tab** through all interactive elements
2. Each button shows **teal focus ring**
3. Order follows visual layout (top to bottom, left to right)

### Submenu Toggle
```
1. Focus on "Clinic Management"
2. Press Enter or Space
3. Submenu expands (chevron rotates)
4. Tab again to move to first submenu item
```

### Page Navigation
```
1. Focus on any nav item
2. Press Enter or Space
3. Page changes immediately
4. Focus remains on navigation
```

### Screen Reader Announcements
- "Dashboard, navigation" → Page link
- "Clinic Management, button, expanded" → Submenu toggle
- "Active page" indicator for current page

---

## 🔄 State Management

### Current Component State
- `isMobileOpen` → Mobile drawer visibility
- `isClinicManagementOpen` → Submenu expanded state

### Props-based State
- `activeMode` → Current page (passed from parent)
- `approvalCount` → From approval context

### Persistence Options

**Save mobile state** (optional):
```typescript
useEffect(() => {
  localStorage.setItem('nav-mobile-open', isMobileOpen);
}, [isMobileOpen]);
```

**Save submenu state** (optional):
```typescript
useEffect(() => {
  localStorage.setItem('clinic-submenu-open', isClinicManagementOpen);
}, [isClinicManagementOpen]);
```

---

## 🐛 Troubleshooting

### Mobile menu button not showing
**Issue**: Button appears on desktop instead of mobile
**Solution**: Check Tailwind breakpoints - use `md:hidden` class

### Approval badge not updating
**Issue**: Badge count stays same after action
**Solution**: Ensure `approvalCount` prop is updated from context

### Submenu items not visible
**Issue**: Submenu appears but items are cut off
**Solution**: Check parent `overflow` setting - should be `overflow-hidden` on aside

### Focus rings not visible
**Issue**: Can't see keyboard focus indicators
**Solution**: Ensure you're using Firefox/Chrome with proper color contrast

### Mobile drawer position wrong
**Issue**: Drawer overlaps with content
**Solution**: Ensure `fixed` positioning is set - check parent z-index context

---

## ✨ Best Practices

### 1. Always Provide Required Props
```tsx
// ✅ Good
<LeftNavigation
  activeMode={currentMode}
  onModeChange={handleModeChange}
/>

// ❌ Bad - missing required props
<LeftNavigation />
```

### 2. Handle Logout Properly
```tsx
// ✅ Good - clear user context
<LeftNavigation
  onLogout={() => {
    userContext.logout();
    navigate('/login');
  }}
/>

// ❌ Bad - no cleanup
<LeftNavigation onLogout={() => console.log('goodbye')} />
```

### 3. Keep Section Names Consistent
- Use single words when possible
- Match naming in page titles
- Update both sidebar and top bar names together

### 4. Test Mobile Responsiveness
- Test on actual mobile devices
- Check touch interactions
- Verify drawer animation smoothness
- Ensure overlay backdrop works

### 5. Monitor Performance
- Use React DevTools to check re-renders
- Optimize parent updates
- Consider useMemo for section data
- Profile animations on low-end devices

---

## 📊 Component Stats

- **Lines of Code**: ~425
- **Functions**: 3 (component + 2 render helpers)
- **Interfaces**: 2 (NavItem, SubmenuItem)
- **Sections**: 4 (Home, Websites, Management, Bottom)
- **Responsive Breakpoints**: 1 (md: 768px)
- **Accessibility Features**: 12+
- **Animation Durations**: 2 (200ms, 300ms)

---

## 🔜 Future Enhancements

### Planned Features
- [ ] Keyboard shortcuts (e.g., Cmd+K to open search)
- [ ] Search/filter navigation items
- [ ] Custom color themes
- [ ] Dark mode support
- [ ] Drag to reorder navigation items
- [ ] Customizable section collapsing
- [ ] Activity indicators per page
- [ ] Notification badges on multiple items

### Performance Improvements
- [ ] Virtualization for long lists
- [ ] Lazy loading section content
- [ ] Memoization optimization
- [ ] Code splitting by section

### Accessibility Enhancements
- [ ] Skip navigation links
- [ ] Breadcrumb trail
- [ ] Landmark regions
- [ ] Custom heading hierarchy

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review component JSDoc comments
3. Check TypeScript types
4. Run TypeScript compiler: `npx tsc --noEmit`
5. Review browser console for errors

---

## 📝 Changelog

### v1.0.0 (2026-03-25)
- ✅ Initial release
- ✅ Full responsive design
- ✅ Complete accessibility
- ✅ Smooth animations
- ✅ Dynamic user profile
- ✅ Approval badges
- ✅ Mobile drawer
- ✅ Submenu support
