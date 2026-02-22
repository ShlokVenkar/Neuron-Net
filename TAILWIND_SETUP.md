# Tailwind CSS & shadcn Integration Guide

## ✅ What's Been Set Up

### 1. **Tailwind CSS Integration**
Your project now has Tailwind CSS v3 fully configured:

**Files Created:**
- `tailwind.config.js` - Tailwind configuration with custom theme
- `postcss.config.js` - PostCSS configuration for Tailwind processing
- `src/index.css` - Updated with Tailwind directives

**Dependencies Installed:**
```bash
npm install -D tailwindcss postcss autoprefixer
```

---

### 2. **shadcn/ui Component System**
Modern, accessible UI components with Radix UI primitives:

**Files Created:**
- `src/lib/utils.js` - Utility function for class name merging
- `src/components/ui/button.jsx` - Reusable Button component
- `src/components/ui/hero-modern.jsx` - Modern Hero section with animations

**Dependencies Installed:**
```bash
npm install lucide-react @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

---

### 3. **Path Alias Configuration**
Import components using `@/` prefix:

**Files Modified:**
- `vite.config.js` - Added path alias for `@` → `./src`
- `jsconfig.json` - JavaScript IntelliSense support for path aliases

**Usage:**
```javascript
// Instead of: import { Button } from '../../../components/ui/button'
// You can now: import { Button } from '@/components/ui/button'
```

---

### 4. **Demo Page Created**
`src/pages/HeroDemo.jsx` - Showcase of the new Hero component

**Route:** `/hero-demo`

---

## 🎨 Design System

### Color Palette (Monad Theme)
```css
/* Primary Purple Gradient */
--primary-color: #8b5cf6
--secondary-color: #a78bfa
--accent-color: #c084fc

/* Dark Backgrounds */
--background: #080310
--background-secondary: #100820

/* Text Colors */
--text-primary: #ffffff
--text-secondary: #c4b5fd
```

### shadcn Theme Variables
All shadcn components use HSL color variables defined in `src/index.css`:
- Primary: Purple (`262 83% 58%`)
- Background: Dark (`222.2 84% 4.9%`)
- Foreground: Light (`210 40% 98%`)

---

## 🚀 How to Use

### Using the New Hero Component

**1. View the Demo:**
```
http://localhost:5176/hero-demo
```

**2. Use in Your Pages:**
```jsx
import { HeroModern } from '@/components/ui/hero-modern';

function YourPage() {
  return (
    <HeroModern 
      title="Your Title"
      subtitle="Your subtitle text"
      eyebrow="Optional badge text"
      ctaLabel="Get Started"
      ctaHref="/signup"
      secondaryCtaLabel="Learn More"
      secondaryCtaHref="/about"
    />
  );
}
```

**3. Customizable Props:**
```javascript
{
  eyebrow: string,          // Badge text (default: "Powered by Monad Blockchain")
  title: string,            // Main heading (required)
  subtitle: string,         // Description text (required)
  ctaLabel: string,         // Primary button text
  ctaHref: string,          // Primary button link
  secondaryCtaLabel: string, // Secondary button text
  secondaryCtaHref: string   // Secondary button link
}
```

---

## 🎯 Component Features

### HeroModern Component

**Visual Effects:**
- ✨ Animated grid background with purple accent
- 🌊 Radial gradient glow effect
- 💫 Fade-in animations for all elements
- 📱 Fully responsive design
- 🎨 GPU showcase cards with hover effects

**Animations:**
```css
.animate-fade-in {
  animation: fade-in 0.5s ease-in-out forwards;
}

.animate-fade-up {
  animation: fade-up 0.5s ease-in-out forwards;
}
```

**Key Features:**
1. **Purple-themed** - Matches Monad brand colors
2. **GPU Cards** - Shows RTX 4090, A100, H100 pricing
3. **Responsive** - Mobile-first design
4. **Accessible** - Built with Radix UI primitives
5. **Customizable** - All props can be overridden

---

## 🔧 Using shadcn Button Component

```jsx
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🚀</Button>

// With Link
<Button asChild>
  <a href="/signup">Sign Up</a>
</Button>
```

---

## 📦 Adding More shadcn Components

### Manual Installation Process:

1. **Find the component** at https://ui.shadcn.com/docs/components
2. **Copy the code** into `src/components/ui/[component-name].jsx`
3. **Install dependencies** if prompted
4. **Import and use** in your pages

### Example: Adding Card Component
```bash
# Install if needed
npm install @radix-ui/react-card

# Create file: src/components/ui/card.jsx
# Copy code from shadcn docs
# Import: import { Card } from '@/components/ui/card'
```

---

## 🎨 Tailwind CSS Usage

### In JSX/React Components:
```jsx
<div className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
  Styled with Tailwind
</div>
```

### Custom Utilities:
```jsx
// Gradient text
<h1 className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
  Gradient Text
</h1>

// Glass morphism
<div className="backdrop-blur-md bg-white/10 rounded-xl border border-white/20">
  Glass Card
</div>
```

---

## 🔄 Migrating from CSS to Tailwind

### Before (CSS):
```css
.my-button {
  background: #8b5cf6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
```

### After (Tailwind):
```jsx
<button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
  Click Me
</button>
```

---

## 🐛 Troubleshooting

### Issue: "@tailwind" errors in VS Code
**Solution:** These are just linting warnings. The code works fine. Install Tailwind CSS IntelliSense extension:
```
code --install-extension bradlc.vscode-tailwindcss
```

### Issue: Import paths not working
**Solution:** Restart VS Code or TypeScript server after adding `jsconfig.json`

### Issue: Styles not applying
**Solution:** Make sure `src/index.css` is imported in `main.jsx`:
```javascript
import './index.css'
```

### Issue: Build errors
**Solution:** Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📊 Comparison: Old vs New Hero

### Original Hero Component
**Location:** `src/components/Hero.jsx`
- ✅ Custom typing animation for "NEURON NET"
- ✅ Monad blockchain branding
- ✅ Plain CSS styling
- ✅ Integrated with CosmicBackground

### New HeroModern Component
**Location:** `src/components/ui/hero-modern.jsx`
- ✅ Tailwind CSS styling
- ✅ Modern shadcn design patterns
- ✅ Built-in animations (fade-in, fade-up)
- ✅ GPU showcase cards
- ✅ More customizable props
- ✅ Responsive grid background

**When to Use Each:**
- **Original Hero:** Main homepage (`/`) - Keep for consistent branding
- **HeroModern:** Landing pages, marketing pages, A/B testing

---

## 🎯 Next Steps

### Option 1: Keep Both Heroes
- Main page (`/`) uses original Hero
- Demo page (`/hero-demo`) uses HeroModern
- Other marketing pages can use HeroModern

### Option 2: Replace Original Hero
```jsx
// In src/pages/HomePage.jsx
import { HeroModern } from '@/components/ui/hero-modern';

// Replace <Hero /> with:
<HeroModern 
  title="NEURON NET"
  subtitle="Decentralized GPU compute power..."
  ctaLabel="Get Started"
  ctaHref="/signup"
/>
```

### Option 3: Hybrid Approach
- Use HeroModern layout
- Add typing animation from original Hero
- Best of both worlds

---

## 📚 Resources

### Tailwind CSS:
- Docs: https://tailwindcss.com/docs
- Playground: https://play.tailwindcss.com/

### shadcn/ui:
- Component Library: https://ui.shadcn.com/docs/components
- Examples: https://ui.shadcn.com/examples

### Radix UI:
- Primitives: https://www.radix-ui.com/primitives/docs/overview/introduction
- Accessibility: https://www.radix-ui.com/primitives/docs/overview/accessibility

### Lucide Icons:
- Icon Search: https://lucide.dev/icons

---

## 💡 Pro Tips

1. **Use Tailwind IntelliSense** - Install VS Code extension for autocomplete
2. **Customize Theme** - Edit `tailwind.config.js` for brand colors
3. **Build Incrementally** - Add shadcn components as needed
4. **Keep CSS for Complex Animations** - Not everything needs Tailwind
5. **Use Path Aliases** - Always import with `@/` for cleaner code

---

## 🎉 You're All Set!

Visit **http://localhost:5176/hero-demo** to see the new component in action!

Your project now supports:
✅ Tailwind CSS utility classes
✅ shadcn/ui component system
✅ Modern path aliases (`@/`)
✅ Accessible Radix UI primitives
✅ Lucide React icons
✅ Custom animations

**Questions?** Check the resources above or experiment with the demo page!

---

*Last Updated: February 22, 2026*
*Version: v5*
