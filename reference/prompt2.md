# DevTrackAcademy Workshop Website V2 Update Prompt

The website has already been built based on the previous prompt.

**Do NOT redesign the website.**

Keep everything exactly the same:

* Neo Brutalist design language
* Color palette
* Typography
* Component styling
* GSAP animations
* Framer Motion interactions
* Lenis smooth scrolling
* Responsive layouts
* Existing reusable components
* Overall visual identity

This update is purely a **content architecture and routing improvement**.

---

# New Website Structure

Restructure the application into the following pages.

```text
/
Home Page

/workshops
All Workshops Page

/workshops/[slug]
Individual Workshop Details

/auth
Authentication

/dashboard
Future Dashboard (placeholder)
```

---

# 1. Home Page Changes

The homepage should no longer contain the complete workshop information.

Instead, it should act as a landing page that introduces the workshop platform.

Remove the following sections completely.

❌ Workshop Timeline

❌ Workshop Curriculum

❌ Session Breakdown

❌ Detailed Schedule

❌ Why Only 50 Students

Those belong only on the workshop detail page.

---

# Featured Workshop Section

Replace the large workshop information with a cleaner preview.

The section should contain

Large heading

```text
Featured Workshop
```

Large workshop card containing

* Workshop image
* Workshop title
* Short description
* Difficulty
* Duration
* Total Sessions
* Available Seats
* Date
* Status badge
* Price
* Register button
* View Details button

Clicking anywhere on the card should navigate to

```text
/workshops/build-your-portfolio
```

The View Details button should also navigate there.

---

# Latest Workshops Section

Create a completely new section.

Heading

```text
Latest Workshops
```

Display 3 workshop cards.

Each card should contain

* Thumbnail
* Title
* Short description
* Date
* Difficulty
* Seats Left
* Price
* Status

Example cards

Build Portfolio with AI

Dev Tools Worth ₹2L+

React From Scratch

At the bottom

Large button

```text
View All Workshops →
```

Navigate to

```text
/workshops
```

Cards should have

* hover lift
* slight rotation
* magnetic buttons
* floating decorations

---

# Upcoming Workshops Section

Create another section below Latest Workshops.

Heading

```text
Upcoming Workshops
```

Display future workshop cards.

Examples

* Dev Tools Worth ₹2 Lakhs+
* Full Stack Bootcamp
* AI Agents Workshop
* System Design Workshop

Each card

Coming Soon badge

Estimated Month

Difficulty

Short description

Hover animation

At bottom

```text
Notify Me
```

---

# Suggest a Workshop Topic

Create a brand new section.

Heading

```text
Didn't Find the Workshop You Need?
```

Subtitle

Encourage learners to suggest future workshop ideas.

Layout

Large colorful Neo Brutalist card.

Left Side

Illustration

Lightbulb

Laptop

Sticky Notes

Floating Icons

Right Side

Suggestion form

Fields

Name

Email

Workshop Topic

Description

Experience Level

Dropdown

Beginner

Intermediate

Advanced

Submit Button

Below the form

Show

```text
We regularly review community suggestions and prioritize workshops based on demand.
```

Animate success state beautifully.

---

# View All Workshops Page

Create a completely new page.

Route

```text
/workshops
```

---

Hero

Heading

```text
Live Practical Workshops
```

Subtitle

Browse all available and upcoming workshops.

---

Search Bar

Allow searching by title.

---

Filters

Difficulty

Beginner

Intermediate

Advanced

Status

Live

Upcoming

Completed

Category

Frontend

Backend

AI

Career

Dev Tools

Portfolio

---

Workshop Grid

Large colorful cards.

Each card contains

Workshop Cover

Title

Short Description

Instructor

Duration

Sessions

Difficulty

Price

Seats Left

Date

Status

Buttons

Register

View Details

Cards animate on hover.

---

Pagination

If needed.

---

Empty State

Beautiful illustration

No workshops found.

---

# Individual Workshop Page

Route

```text
/workshops/[slug]
```

Every workshop should have its own page.

---

Hero

Workshop title

Large illustration

Date

Price

Difficulty

Seats Remaining

Register Button

Share Button

---

About Workshop

Explain

Goals

Who should attend

Prerequisites

Outcome

---

Workshop Schedule

Beautiful timeline.

Session cards.

Each session contains

Session title

Topics

Duration

Assignment

Resources

---

Pricing

Large Neo Brutalist pricing card.

Contains

Price

What's Included

Certificate

Assignments

Resources

Community

Live Sessions

---

Why Only 50 Students?

Dedicated section.

Large Mint card.

Explain

Personal guidance

Individual doubt solving

Assignment reviews

Mentor interaction

Better learning experience

Illustration

Students around instructor.

---

Learning Outcomes

Large cards

By the end you will

Deploy project

Understand workflow

Learn AI tools

Build portfolio

Gain confidence

---

Frequently Asked Questions

Workshop specific FAQs.

---

Related Workshops

Carousel

Show similar workshops.

---

Sticky Register Card

Desktop only.

While scrolling

Show floating registration card.

Contains

Price

Seats Left

Register Button

---

# Workshop Data Structure

Prepare the application so workshops are data-driven.

Each workshop should have

```typescript
title

slug

coverImage

description

difficulty

category

duration

sessions

price

date

status

seatLimit

remainingSeats

instructor

highlights

schedule

faq

learningOutcomes
```

The UI should consume this object so adding future workshops only requires creating another data entry.

---

# Navigation Changes

Navbar

Replace

Browse Workshops

with

All Workshops

Click

Navigate to

```text
/workshops
```

---

Featured workshop buttons

Navigate to

```text
/workshops/[slug]
```

---

Upcoming workshop cards

If not available

Open modal

```text
Coming Soon

Notify Me
```

---

# Future Scalability

Architect the workshop platform so it can easily support:

* Multiple instructors
* Hundreds of workshops
* Categories
* Tags
* Filters
* Search
* Certificates
* Assignments
* Workshop recordings
* Payments
* Waitlists
* Notifications

Avoid hardcoding workshop content into components. Everything should be driven by reusable data structures and modular UI components.

---

# Maintain Existing Design System

Do **not** change any existing visual style.

Continue using:

* Neo Brutalist components
* Space Grotesk + Inter typography
* Color palette

  * Orange `#FF6B35`
  * Deep Navy `#1B1F3B`
  * Soft Cream `#FFF8F0`
  * Mint `#6EE7B7`
  * Sky `#4EA8FF`
  * Coral `#FF5C7A`
* 4px borders
* Large rounded corners
* Strong shadows
* Floating geometric decorations
* GSAP storytelling
* Framer Motion interactions
* Lenis smooth scrolling
* Magnetic buttons
* Hover lift and rotation
* Responsive layouts

The result should feel like a polished product website where the **homepage markets the platform**, the **All Workshops page acts as a catalog**, and each **Workshop Details page functions as a dedicated landing page** optimized for registrations, while maintaining a consistent Neo-Brutalist identity throughout.
