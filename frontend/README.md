# Library Hub Nawalpur — Frontend Application

Modern React.js frontend for **Library Hub Nawalpur**, built with Vite, Tailwind CSS, Framer Motion, and Lucide React icons.

---

## Architecture Overview

```text
frontend/src/
├── assets/
│   ├── images/              # Authentic desk photography, official banner, logos
│   └── icons/               # SVG assets
├── components/
│   ├── common/              # Reusable UI building blocks
│   │   ├── Badge.jsx            # Status pills and verification indicators
│   │   ├── Breadcrumb.jsx       # Page breadcrumb hierarchy
│   │   ├── Button.jsx           # Universal accessible button / link
│   │   ├── FacilityCard.jsx     # Amenity card with hover micro-interactions
│   │   ├── FaqAccordion.jsx     # Animated smooth height disclosure accordion
│   │   ├── FeatureCard.jsx      # Key study sanctuary highlights
│   │   ├── ImagePlaceholder.jsx # Adaptive frame for actual / placeholder imagery
│   │   ├── PricingCard.jsx      # Membership plan card with hover elevation
│   │   ├── ScrollToTop.jsx      # Automatic top scroll on route changes
│   │   ├── SectionHeading.jsx   # Standardized heading with scroll reveal
│   │   └── TestimonialCard.jsx  # Verified Google review card with Google badge
│   └── layout/
│       ├── Header.jsx           # Locked brand navigation with formulas pattern
│       ├── Footer.jsx           # Locked footer with quick links & hours
│       └── Layout.jsx           # Page wrapper with animated route transitions
├── data/                    # Business datasets (decoupled from UI)
│   ├── facilities.js        # 11 verified amenities
│   ├── faqs.js              # Frequently asked questions
│   ├── gallery.js           # Visual gallery index and categories
│   ├── images.js            # Centralized image mapping registry
│   ├── membership.js        # Official pricing plans (₹600, ₹1000, ₹600)
│   ├── navigation.js        # Navigation menus and links
│   ├── rules.js             # Library code of conduct & silence policy
│   ├── siteConfig.js        # Verified address, phone, Instagram, and maps link
│   └── testimonials.js      # Authentic 5-star Google Reviews
├── hooks/                   # Custom reusable React hooks
├── pages/                   # Application pages (routed in App.jsx)
│   ├── HomePage.jsx         # Hero, exam targets, features, preview pricing, reviews
│   ├── AboutPage.jsx        # Story, mission, vision, desks showcase
│   ├── FacilitiesPage.jsx   # 11 amenities with category filters
│   ├── MembershipPage.jsx   # 3 shift plans, transparent pricing, comparison table
│   ├── GalleryPage.jsx      # Interactive gallery with animated modal lightbox
│   ├── RulesPage.jsx        # Do's and Don'ts discipline guidelines
│   ├── FaqPage.jsx          # Searchable FAQ accordion
│   ├── ContactPage.jsx      # Direct Call, WhatsApp chat, and Google Maps cards
│   └── NotFoundPage.jsx     # 404 error page
├── services/                # API client architecture ready for future backend
│   ├── api/
│   │   ├── client.js        # Base fetch client with timeout and error handling
│   │   └── endpoints.js     # API endpoint registry
│   └── index.js
├── styles/
│   └── index.css            # Tailwind directives, fonts, focus-visible styles
├── utils/
│   ├── formatters.js        # Currency, telephone, and WhatsApp link formatters
│   └── index.js
├── App.jsx                  # Main routing tree
└── main.jsx                 # Entry point
```

---

## Production Dependencies

- **`react` & `react-dom`** (`^19.0.0`): Core React library.
- **`react-router-dom`** (`^7.1.5`): Declarative client-side routing.
- **`framer-motion`** (`^12.4.7`): GPU-accelerated micro-interactions, page transitions, accordion disclosures, and modal lightbox animations.
- **`lucide-react`** (`^0.475.0`): Crisp, lightweight feather icons.

*(Note: Unused dependencies like `swiper` have been removed to keep the bundle lean).*

---

## Development & Build Commands

All commands are run from within the `frontend/` directory:

```bash
# Start local development server (port 3000)
npm run dev

# Run production build
npm run build

# Preview production build locally
npm run preview
```

---

## Asset Replacement Instructions

Real photography and brand graphics are mapped centrally in **`src/data/images.js`**:

1. Place the new photograph into `src/assets/images/`.
2. Open `src/data/images.js`.
3. Import the photograph:
   ```javascript
   import newPhoto from '../assets/images/new-photo.jpg';
   ```
4. Assign `src: newPhoto` to the appropriate key (e.g. `readingRoom`, `quietZone`, `exterior`).
5. All components will automatically render the authentic image across the entire site.

---

## UI Micro-Interactions & Transitions

The frontend implements tasteful, non-bulky micro-interactions:
- **Route transitions**: Smooth page entrance via `<AnimatePresence>` in `Layout.jsx`.
- **Scroll reveals**: Non-intrusive scroll entrance on section headings via Framer Motion's `whileInView`.
- **Card elevations**: CSS GPU-accelerated hover lift (`hover:-translate-y-1` / `hover:-translate-y-1.5`) with soft shadow expansion on Pricing, Facilities, Features, and Testimonials.
- **Tactile buttons**: Responsive click compression (`active:scale-[0.98]`).
- **Smooth FAQ expansion**: Native layout animation on accordion toggle without abrupt layout pop.
- **Gallery lightbox**: Smooth zoom & fade animation using Framer Motion.

