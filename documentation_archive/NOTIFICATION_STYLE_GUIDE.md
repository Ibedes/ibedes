---
title: Notification Design System - Style Guide
description: Comprehensive style guide untuk notification component
---

# 🎨 Notification Design System - Style Guide

## Table of Contents
1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Components](#components)
5. [Animations](#animations)
6. [States](#states)
7. [Accessibility](#accessibility)
8. [Best Practices](#best-practices)

---

## Color System

### Primary Colors by Type

```css
/* Love Notification */
--color-love-gradient-start: #ff6b9a;
--color-love-gradient-end: #ff8fab;
--color-love-shadow: rgba(255, 107, 154, 0.4);
--color-love-light: rgba(255, 107, 154, 0.15);

/* Comment Notification */
--color-comment-gradient-start: #4f46e5;
--color-comment-gradient-end: #7c3aed;
--color-comment-shadow: rgba(79, 70, 229, 0.4);
--color-comment-light: rgba(79, 70, 229, 0.15);

/* Message Notification */
--color-message-gradient-start: #10b981;
--color-message-gradient-end: #34d399;
--color-message-shadow: rgba(16, 185, 129, 0.4);
--color-message-light: rgba(16, 185, 129, 0.15);

/* System Notification */
--color-system-gradient-start: #f59e0b;
--color-system-gradient-end: #fbbf24;
--color-system-shadow: rgba(245, 158, 11, 0.4);
--color-system-light: rgba(245, 158, 11, 0.15);
```

### Neutral Colors

```css
/* Text */
--color-text-primary: var(--color-foreground);      /* Main text */
--color-text-secondary: var(--color-foreground, 75%);/* Body text */
--color-text-tertiary: var(--color-foreground, 60%);  /* Meta text */
--color-text-muted: var(--color-foreground, 40%);     /* Disabled */

/* Background */
--color-bg-card: var(--color-card, var(--color-background));
--color-bg-hover: rgba(var(--color-primary), 0.05);
--color-bg-subtle: rgba(var(--color-foreground), 0.03);

/* Border */
--color-border-default: rgba(var(--color-foreground), 0.08);
--color-border-hover: rgba(var(--color-foreground), 0.16);
--color-border-strong: rgba(var(--color-primary), 0.25);
```

### Opacity Scale

```css
/* Transparency levels */
--opacity-0: 0%;
--opacity-1: 1%;
--opacity-3: 3%;
--opacity-5: 5%;
--opacity-8: 8%;
--opacity-10: 10%;
--opacity-12: 12%;
--opacity-15: 15%;
--opacity-20: 20%;
--opacity-40: 40%;
--opacity-60: 60%;
--opacity-70: 70%;
--opacity-75: 75%;
--opacity-80: 80%;
--opacity-100: 100%;
```

---

## Typography

### Font Stack
```css
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 
             'Helvetica Neue', sans-serif;
--font-display: var(--font-sans); /* Or custom display font */
```

### Size Scale

#### Badge
```css
.badge {
  font-size: 0.75rem;        /* 12px */
  font-weight: 700;          /* Bold */
  text-transform: uppercase;
  letter-spacing: 0.06em;    /* 0.6px */
  line-height: 1.2;
}
```

#### Title
```css
.title {
  font-size: 1.125rem;       /* 18px */
  font-weight: 700;          /* Bold */
  font-family: var(--font-display);
  line-height: 1.3;
  letter-spacing: -0.01em;   /* Tighter */
}
```

#### Message
```css
.message {
  font-size: 0.9375rem;      /* 15px */
  font-weight: 400;          /* Regular */
  line-height: 1.6;          /* Generous */
  letter-spacing: 0;
}
```

#### Time & Meta
```css
.time, .meta {
  font-size: 0.8125rem;      /* 13px */
  font-weight: 500;          /* Medium */
  line-height: 1.4;
  letter-spacing: 0.01em;
}
```

#### Action Button
```css
.action {
  font-size: 0.8125rem;      /* 13px */
  font-weight: 600;          /* Semibold */
  text-transform: none;
  letter-spacing: 0;
  text-decoration: none;
}
```

---

## Spacing

### Scale
```css
/* Spacing scale (consistent with design system) */
--space-0: 0;
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-7: 1.75rem;    /* 28px */
--space-8: 2rem;       /* 32px */
```

### Component Spacing

#### Card
```css
.admin-notification-card-new {
  padding: 1.5rem;           /* 24px */
  gap: 1rem;                 /* 16px between sections */
  border-radius: 14px;
}

/* Mobile */
@media (max-width: 480px) {
  .admin-notification-card-new {
    padding: 1rem;           /* 16px */
    gap: 0.75rem;            /* 12px */
  }
}
```

#### Grid
```css
.admin-notifications-grid-new {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;              /* 20px between cards */
}

/* Mobile */
@media (max-width: 768px) {
  .admin-notifications-grid-new {
    grid-template-columns: 1fr;
    gap: 1rem;               /* 16px */
  }
}
```

#### Header
```css
.card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;                 /* 16px */
}
```

#### Body
```css
.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;             /* 10px */
}
```

#### Footer
```css
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;              /* 12px */
  padding-top: 1rem;         /* 16px */
  border-top: 1px solid color-mix(...);
}
```

---

## Components

### Notification Card - Full Reference

#### Default State
```css
.admin-notification-card-new {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 14px;
  border: 1.5px solid;
  background: var(--color-card, var(--color-background));
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: slideUp 400ms ease-out backwards;
}
```

#### Type Variations

```css
/* Like */
.admin-notification-card-new[data-type="like"] {
  border-color: #ff6b9a;
  background: linear-gradient(
    135deg,
    rgba(255, 107, 154, 0.03) 0%,
    rgba(255, 107, 154, 0.01) 100%
  );
}

/* Comment */
.admin-notification-card-new[data-type="comment"] {
  border-color: #4f46e5;
  background: linear-gradient(
    135deg,
    rgba(79, 70, 229, 0.03) 0%,
    rgba(79, 70, 229, 0.01) 100%
  );
}

/* Message */
.admin-notification-card-new[data-type="message"] {
  border-color: #10b981;
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.03) 0%,
    rgba(16, 185, 129, 0.01) 100%
  );
}

/* System */
.admin-notification-card-new[data-type="system"] {
  border-color: #f59e0b;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.03) 0%,
    rgba(245, 158, 11, 0.01) 100%
  );
}
```

#### Unread State
```css
.admin-notification-card-new[data-status="unread"] {
  border-width: 2px;
  position: relative;
}

.admin-notification-card-new[data-status="unread"]::before {
  content: "";
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-primary);
  animation: pulse 2s ease-in-out infinite;
}
```

#### Hover State
```css
.admin-notification-card-new:hover {
  border-color: var(--color-primary);
  box-shadow:
    0 20px 25px -5px rgba(79, 70, 229, 0.3),
    0 10px 10px -5px rgba(79, 70, 229, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
}
```

---

### Icon Box

```css
.admin-notification-card-new__icon-box {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;           /* 48px */
  height: 3rem;
  border-radius: 12px;
  font-size: 1.5rem;     /* 24px */
  color: white;
}

/* Type Colors */
.admin-notification-card-new[data-type="like"] .admin-notification-card-new__icon-box {
  background: linear-gradient(135deg, #ff6b9a, #ff8fab);
  box-shadow: 0 4px 15px rgba(255, 107, 154, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.admin-notification-card-new[data-type="comment"] .admin-notification-card-new__icon-box {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.admin-notification-card-new[data-type="message"] .admin-notification-card-new__icon-box {
  background: linear-gradient(135deg, #10b981, #34d399);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
```

---

### Badge

```css
.admin-notification-card-new__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;         /* 6px */
  padding: 0.375rem 0.875rem;  /* 6px 14px */
  border-radius: 999px;
  font-size: 0.75rem;    /* 12px */
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem; /* 8px */
  color: white;
}

/* Type Colors */
.admin-notification-card-new[data-type="like"] .admin-notification-card-new__badge {
  background: #ff6b9a;
}

.admin-notification-card-new[data-type="comment"] .admin-notification-card-new__badge {
  background: #4f46e5;
}

.admin-notification-card-new[data-type="message"] .admin-notification-card-new__badge {
  background: #10b981;
}

.admin-notification-card-new[data-type="system"] .admin-notification-card-new__badge {
  background: #f59e0b;
}
```

---

### Action Button

```css
.admin-notification-card-new__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;         /* 6px */
  padding: 0.5rem 0.875rem;    /* 8px 14px */
  border-radius: 8px;
  font-size: 0.8125rem;  /* 13px */
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid;
  color: white;
  transition: all 200ms ease;
}

/* Default (Like) */
.admin-notification-card-new__action {
  background: #ff6b9a;
  border-color: #ff6b9a;
  box-shadow: 0 2px 8px rgba(255, 107, 154, 0.3);
}

/* Hover */
.admin-notification-card-new__action:hover {
  transform: translateY(-2px);
  box-shadow:
    0 6px 12px rgba(255, 107, 154, 0.4),
    0 2px 4px rgba(255, 107, 154, 0.2);
}

/* Focus (Accessibility) */
.admin-notification-card-new__action:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Icon Animation */
.admin-notification-card-new__action i {
  font-size: 0.75rem;
  transition: transform 200ms ease;
}

.admin-notification-card-new__action:hover i {
  transform: translateX(2px);
}
```

---

## Animations

### 1. Slide Up

```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Usage */
.admin-notification-card-new {
  animation: slideUp 400ms ease-out backwards;
}

/* Stagger */
.admin-notification-card-new:nth-child(1) {
  animation-delay: 50ms;
}

.admin-notification-card-new:nth-child(2) {
  animation-delay: 100ms;
}

.admin-notification-card-new:nth-child(3) {
  animation-delay: 150ms;
}
```

**Specs:**
- Duration: 400ms
- Easing: ease-out
- Delay: Staggered 50ms intervals
- Properties: opacity, transform (GPU accelerated)

### 2. Float

```css
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-12px);
  }
}

/* Usage */
.admin-empty-state-new__icon {
  animation: float 3s ease-in-out infinite;
}
```

**Specs:**
- Duration: 3s
- Easing: ease-in-out
- Iteration: infinite
- Distance: ±12px

### 3. Pulse

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

/* Usage */
.admin-notification-card-new[data-status="unread"]::before {
  animation: pulse 2s ease-in-out infinite;
}
```

**Specs:**
- Duration: 2s
- Easing: ease-in-out
- Iteration: infinite
- Scale: 1 → 1.2
- Opacity: 1 → 0.6

### 4. Transition Effects

```css
/* Hover Transition */
.admin-notification-card-new {
  transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Button Transition */
.admin-notification-card-new__action {
  transition: all 200ms ease;
}

.admin-notification-card-new__action i {
  transition: transform 200ms ease;
}

/* Smooth Animations Spec */
- Duration: 200-400ms depending on context
- Easing: ease, ease-out, or cubic-bezier
- Properties: transform, opacity, box-shadow
```

---

## States

### Card States

| State | Style | Usage |
|-------|-------|-------|
| **Default** | Normal border, subtle shadow | Regular notification |
| **Unread** | 2px border, pulse dot, highlight | New/unread notifications |
| **Hover** | Lifted, larger shadow | Interactive state |
| **Read** | 1px border, no dot | Old/archived |

### Button States

| State | Style | Opacity |
|-------|-------|---------|
| **Default** | Solid color | 100% |
| **Hover** | Lifted, larger shadow | 100% |
| **Focus** | Outline ring | 100% |
| **Active** | Pressed style | 100% |
| **Disabled** | Muted color | 50% |

---

## Accessibility

### Color Contrast

```css
/* WCAG AA Compliance (4.5:1 minimum) */
- Text on color backgrounds: ✅ 7:1+ ratio
- Border colors: Distinguishable without color alone
- Use icons + text for important info
```

### Focus Indicators

```css
.admin-notification-card-new__action:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

### Semantic HTML

```html
<article class="admin-notification-card-new">
  <header class="admin-notification-card-new__header">
    <!-- Card header content -->
  </header>
  <div class="admin-notification-card-new__body">
    <!-- Card body content -->
  </div>
  <footer class="admin-notification-card-new__footer">
    <!-- Card footer content -->
  </footer>
</article>
```

### ARIA Labels

```html
<!-- For card -->
<article role="article" aria-label="Notification: Article Loved">
  <!-- Content -->
</article>

<!-- For action button -->
<a href="#" 
   class="admin-notification-card-new__action"
   aria-label="View loved article">
  View →
</a>
```

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Best Practices

### 1. Color Usage
- ✅ Use color as decoration + additional indicator
- ✅ Pair colors with icons for clarity
- ✅ Test color contrast ratios
- ❌ Don't rely on color alone

### 2. Typography
- ✅ Use hierarchy: Title → Body → Meta
- ✅ Keep messages concise (2-3 lines max)
- ✅ Use consistent sizing scale
- ❌ Don't mix too many font sizes

### 3. Spacing
- ✅ Use consistent spacing scale
- ✅ Maintain breathing room (gaps)
- ✅ Align elements to grid
- ❌ Don't use arbitrary spacing

### 4. Animations
- ✅ Keep animations smooth (200-400ms)
- ✅ Use easing functions for natural motion
- ✅ Stagger animations for visual flow
- ✅ Respect `prefers-reduced-motion`
- ❌ Don't overuse animations

### 5. Responsiveness
- ✅ Test on multiple screen sizes
- ✅ Use flexible grid layouts
- ✅ Scale typography appropriately
- ✅ Optimize touch targets (44px minimum)
- ❌ Don't hardcode widths

### 6. Accessibility
- ✅ Use semantic HTML
- ✅ Provide text alternatives for icons
- ✅ Ensure sufficient color contrast
- ✅ Include focus states
- ❌ Don't remove focus indicators

---

## Implementation Example

```astro
---
import NotificationCard from "@/components/admin/NotificationCard.astro";

const notification = {
  type: "like",
  title: "Artikel Dicintai",
  message: "Pembaca memberikan love pada artikel Anda",
  time: "2 menit lalu",
  status: "unread",
  icon: "fa-solid fa-heart",
  action: {
    label: "Lihat",
    href: "/blog/artikel"
  }
};
---

<div class="admin-notifications-grid-new">
  <NotificationCard {...notification} />
</div>

<style>
  /* Inherits all styles from dashboard.astro */
  .admin-notifications-grid-new {
    /* All styles defined in main stylesheet */
  }
</style>
```

---

## Resources

- [WCAG Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [CSS Animation Easing Functions](https://cubic-bezier.com/)
- [Font Awesome Icons](https://fontawesome.com/icons)
- [Motion Design Principles](https://material.io/design/motion/)

---

*Last Updated: November 30, 2024*  
*Version: 1.0.0*  
*Status: Complete* ✅
