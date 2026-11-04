# Library Hub Nawalpur --- Frontend Development Plan

## Project Overview

**Project name:** Library Hub Nawalpur\
**Business type:** Self-study library / study hub\
**Frontend stack:** React.js, Vite, Tailwind CSS\
**Purpose:** Build a polished, responsive website that presents the
library, its facilities, membership plans, study environment, policies,
gallery, and contact information.

> **Important scope boundary:** This is a frontend-only project. Do not
> build a backend, database, real authentication, payment processing, or
> live seat-booking system in this phase. Any forms or account screens
> must be clearly treated as frontend UI/demo interactions only.

## Brand Direction

-   **Brand name:** Library Hub Nawalpur
-   **Suggested tagline:** Your Space. Your Focus. Your Success.
-   **Positioning:** A calm, comfortable, student-focused self-study
    space.
-   **Design direction:** Premium, modern, welcoming, uncluttered, and
    trustworthy.
-   **Responsive targets:** Mobile, tablet, laptop, and large desktop.

### Images and Assets --- User Supplied

The user will provide the actual library photographs and brand assets
later.

-   Do not search for, generate, or download replacement library photos.
-   Do not use random stock photos as if they represent this actual
    library.
-   Create well-designed image placeholders with clear labels, for
    example `Library exterior image`, `Reading hall image`,
    `Study desk image`, and `Facilities image`.
-   Keep image paths centralized so supplied images can be added easily
    later, e.g. `src/assets/images/`.
-   Use neutral placeholder backgrounds or subtle skeleton blocks until
    the real images are supplied.
-   Do not invent a logo. Use a clean text-based brand treatment until
    the logo is provided.

------------------------------------------------------------------------

# Phase 0 --- Project Setup and Foundation

### Objective

Set up a clean, maintainable React frontend project.

### Tasks

1.  Create a React + Vite project.
2.  Configure Tailwind CSS using the current compatible setup.
3.  Install and configure:
    -   React Router DOM
    -   Lucide React
    -   Framer Motion
    -   Swiper (only where a carousel is needed)
4.  Create a reusable global layout:
    -   Header
    -   Navigation
    -   Main content wrapper
    -   Footer
5.  Define design tokens:
    -   Brand colors
    -   Typography scale
    -   Spacing scale
    -   Border radii
    -   Shadows
6.  Ensure responsive breakpoints are consistent.
7.  Add basic page title and favicon placeholders without inventing a
    logo.

### Suggested folder structure

``` text
src/
  assets/
    images/
    icons/
  components/
    layout/
    common/
    home/
    forms/
  pages/
  data/
  hooks/
  utils/
  styles/
  App.jsx
  main.jsx
```

### Completion criteria

-   Project runs without errors.
-   Routing works.
-   Header and footer are reusable.
-   Tailwind styles are working.
-   Layout is responsive from the start.

------------------------------------------------------------------------

# Phase 1 --- Design System and Shared Components

### Objective

Establish a consistent visual language before building all pages.

### Tasks

1.  Create a premium, calm visual theme suitable for a self-study
    library.
2.  Use a restrained palette. Suggested starting direction:
    -   Deep navy / charcoal for strong text and navigation
    -   Warm off-white for page backgrounds
    -   A restrained warm accent such as amber or muted gold
    -   Soft neutral borders and surfaces
3.  Select readable typography with clear hierarchy.
4.  Build reusable components:
    -   Primary and secondary buttons
    -   Section heading
    -   Breadcrumb
    -   Feature card
    -   Facility card
    -   Pricing card
    -   Testimonial card
    -   FAQ accordion
    -   Contact information card
    -   Image placeholder
    -   Badge / status label
5.  Add accessible hover, focus, active, and disabled states.
6.  Keep motion subtle and purposeful; respect reduced-motion
    preferences.

### Completion criteria

-   Components look consistent across pages.
-   Buttons, cards, and headings are reusable.
-   Keyboard focus is visible.
-   No unnecessary animation or visual clutter.

------------------------------------------------------------------------

# Phase 2 --- Main Website Layout and Home Page

### Objective

Create the main landing page that explains the value of Library Hub
Nawalpur.

### Header

-   Text-based brand: Library Hub Nawalpur
-   Navigation links
-   Clear call-to-action such as `Explore Membership`
-   Mobile navigation drawer/menu
-   Sticky header only if it improves usability

### Home page sections

1.  **Hero**
    -   Brand name
    -   Clear self-study library headline
    -   Short supporting description
    -   Primary CTA: View Membership Plans
    -   Secondary CTA: Contact Us
    -   Large labelled image placeholder for the actual library photo
2.  **Quick highlights**
    -   Display only confirmed facilities or use editable placeholder
        content.
3.  **About preview**
    -   Short introduction and link to About page.
4.  **Facilities preview**
    -   Cards for facilities; do not claim a facility exists unless
        confirmed.
5.  **Membership preview**
    -   Pricing placeholders until actual prices and plans are supplied.
6.  **Study environment preview**
    -   Image placeholders for reading hall / study desks.
7.  **Testimonials**
    -   Use clearly marked sample placeholders, not fabricated real
        student reviews.
8.  **FAQ preview**
9.  **Contact CTA**
10. **Footer**

### Completion criteria

-   Home page has a strong visual hierarchy.
-   All CTA links work.
-   No broken image links.
-   Placeholder content is easy to replace.

------------------------------------------------------------------------

# Phase 3 --- Information Pages

### Objective

Build the supporting pages with a consistent layout.

## 3.1 About Us

-   Introduction to Library Hub Nawalpur
-   Mission and vision sections
-   Why students may choose the study hub
-   Library image placeholders
-   Do not invent founding dates, achievements, or claims.

## 3.2 Facilities

Create a flexible grid of facility cards. Potential examples may
include: - Air conditioning - Wi-Fi - Charging points - CCTV - Power
backup - Drinking water - Lockers - Parking - Washroom - Quiet study
area

**Important:** Keep facility data editable and mark unconfirmed
facilities as placeholders. Do not present them as confirmed services
until the user verifies them.

## 3.3 Membership Plans

-   Build responsive pricing cards.
-   Support hourly, daily, weekly, monthly, or shift-based plan layouts
    as configurable data.
-   Use `Price to be announced` until actual prices are provided.
-   Add a frontend-only enquiry CTA.
-   Do not implement payment processing.

## 3.4 Gallery

-   Create a responsive gallery grid.
-   Use labelled placeholders until actual images are supplied.
-   Add a simple image preview/lightbox interaction only when real
    images are added.
-   Keep image data in one central file.

## 3.5 Rules and Regulations

Create readable sections for: - Silence and discipline - Cleanliness -
Use of mobile phones - Food and drinks - Seat usage - Membership
conduct - Entry and exit rules

Use editable draft content and clearly flag it for owner review. Do not
invent official rules.

## 3.6 FAQs

-   Accessible accordion UI.
-   Keep questions and answers in a data file.
-   Use draft questions until the owner confirms exact policies.

## 3.7 Contact Us

-   Address placeholder
-   Phone / WhatsApp placeholder
-   Opening hours placeholder
-   Map placeholder
-   Frontend-only enquiry form with validation and a demo success
    message.
-   Do not invent an address, phone number, email, or map location.

### Completion criteria

-   All information pages are accessible from navigation/footer.
-   Content is data-driven where practical.
-   Unconfirmed business information is clearly marked as placeholder
    content.

------------------------------------------------------------------------

# Phase 4 --- Frontend Interactions and Polish

### Objective

Make the website feel complete without connecting a backend.

### Tasks

1.  Mobile navigation open/close.
2.  FAQ accordion.
3.  Gallery preview interaction when real photos are available.
4.  Membership enquiry CTA.
5.  Contact form client-side validation.
6.  Demo confirmation state after form submission; explain that no
    message is actually sent.
7.  Smooth in-page navigation where appropriate.
8.  Loading, empty, and error states for UI elements where relevant.
9.  Add subtle page transitions and hover states.
10. Check accessibility:
    -   Semantic HTML
    -   Keyboard navigation
    -   Form labels
    -   Image alt text
    -   Sufficient contrast
    -   Reduced motion support

### Out of scope

-   Real user registration/login
-   Backend APIs
-   Database
-   Online payments
-   Live seat availability
-   Real seat reservations
-   Attendance tracking
-   Admin dashboard connected to real data
-   Email/SMS/WhatsApp automation

------------------------------------------------------------------------

# Phase 5 --- Responsive Testing, QA, and Delivery

### Objective

Verify the frontend on common screen sizes and deliver a clean project.

### Testing checklist

-   [ ] Home page works on mobile.
-   [ ] Home page works on tablet.
-   [ ] Home page works on desktop.
-   [ ] Navigation links work.
-   [ ] Mobile menu works.
-   [ ] All page routes load directly.
-   [ ] No horizontal overflow.
-   [ ] No console errors.
-   [ ] No broken image paths.
-   [ ] Forms show clear validation.
-   [ ] Placeholder content is easy to identify.
-   [ ] Buttons and links have meaningful actions.
-   [ ] Text is readable and consistent.
-   [ ] Keyboard navigation works.
-   [ ] Build completes successfully.

### Delivery

-   Provide the complete source code.
-   Include a README with setup and run commands.
-   Keep business content and image references easy to update.
-   List all content that still needs confirmation from the owner.
-   Provide a short summary of completed pages and known limitations.

------------------------------------------------------------------------

# Content Required From the Owner

Do not block the initial UI build on missing details. Use clearly
labelled placeholders and collect/replace these details when available.

1.  Actual library photos and videos
2.  Official logo, if available
3.  Exact address and map location
4.  Contact number and WhatsApp number
5.  Official email and social media links
6.  Opening and closing times
7.  Membership plans, shifts, and prices
8.  Confirmed facilities
9.  Official rules and regulations
10. Real student testimonials, if available

------------------------------------------------------------------------

# Instructions for the Developer / Antigravity

1.  Implement the project phase by phase in the order above.
2.  Do not skip ahead or add backend functionality.
3.  Do not fabricate business details, prices, reviews, facilities,
    contact information, or location.
4.  Do not use stock images. The owner will provide actual images.
5.  Use clearly labelled placeholders wherever information or images are
    missing.
6.  Keep the code modular, reusable, and easy to maintain.
7.  Make the website fully responsive and accessible.
8.  After each phase, run the app, check for errors, and summarize what
    was completed.
9.  Do not mark a phase complete if its completion criteria are not met.
10. Keep all copy and business data in reusable data files wherever
    practical.

**Final target:** A polished, responsive, frontend-only website for
**Library Hub Nawalpur**, ready for the owner's real photos and verified
business information.
