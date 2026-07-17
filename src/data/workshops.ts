export interface SessionDetails {
  num: string;
  title: string;
  about?: string;
  duration: string;
  scheduledAt?: string | null;
  topics: string[];
  assignment: string;
  resources?: string[];
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface LearningOutcome {
  title: string;
  desc: string;
}

export interface Workshop {
  id?: string;
  batchId?: string;
  batchLabel?: string;
  title: string;
  slug: string;
  coverImage?: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Frontend' | 'Backend' | 'AI' | 'Career' | 'Dev Tools' | 'Portfolio';
  duration: string;
  sessions: number;
  price: number;
  originalPrice?: number;
  date: string;
  status: 'Live' | 'Upcoming' | 'Completed';
  seatLimit: number;
  remainingSeats: number;
  instructor: string;
  highlights: string[];
  schedule: SessionDetails[];
  faq: FAQItem[];
  learningOutcomes: LearningOutcome[];
  aboutText?: string;
}

export const workshopsData: Workshop[] = [
  {
    title: 'Build Your Portfolio Website Using AI',
    slug: 'build-your-portfolio',
    description: 'Build a complete developer portfolio website from scratch using AI-assisted development, modern frontend tools, and deployment best practices.',
    aboutText: 'This intensive 2-day live workshop is designed specifically for developers who want to escape tutorial hell and launch a production-grade portfolio. Instead of reading about code, you will work side-by-side with industry mentors using modern AI workflows (such as Cursor prompts and v0 models) to design, animate, and deploy a stunning, fast portfolio that recruiters will notice.',
    difficulty: 'Beginner',
    category: 'Portfolio',
    duration: '2 Days',
    sessions: 4,
    price: 999,
    originalPrice: 2999,
    date: '11 - 12 July',
    status: 'Live',
    seatLimit: 50,
    remainingSeats: 12,
    instructor: 'Alex Coder (Lead Architect)',
    highlights: [
      '4 Interactive Live Classes',
      'Verified Github PR Reviews',
      'Life-time community access',
      'Free developer resources bundle',
    ],
    schedule: [
      {
        num: 'Session 1',
        title: 'Setting Up Development Environment',
        duration: '2 Hours',
        topics: ['VS Code Configuration', 'Git & GitHub Setup', 'AI Code Tools Integration', 'Cursor IDE Settings', 'Project Architecture Setup'],
        assignment: 'Setup your complete development environment and push a template repo to GitHub.',
        resources: ['Cursor Settings Cheat Sheet', 'DTA Starter Boilerplate'],
      },
      {
        num: 'Session 2',
        title: 'Efficient AI-Assisted Development',
        duration: '2.5 Hours',
        topics: ['Advanced Prompt Engineering', 'Vibe Coding workflows', 'AI Context Rules setting', 'AI assisted styling', 'Iterative Code refactoring'],
        assignment: 'Generate, style, and polish 2 customized layout sections using Cursor AI prompts.',
        resources: ['Prompt Design Cookbook', 'Brutalist CSS Tokens list'],
      },
      {
        num: 'Session 3',
        title: 'Build Portfolio Website',
        duration: '2 Hours',
        topics: ['Landing Page Layouts', 'Custom React Components', 'Framer Motion Animations', 'Responsive Breakpoint Design', 'CSS Grid & Flexbox tricks'],
        assignment: 'Complete the core desktop and mobile pages of your developer portfolio.',
        resources: ['Framer Motion Cheat Sheet', 'Mobile Responsive Grid Guide'],
      },
      {
        num: 'Session 4',
        title: 'Deployment & Live Review',
        duration: '2 Hours',
        topics: ['Deploy Website to Vercel/Netlify', 'Custom Domain Configuration', 'GitHub Readme Optimization', 'Resume & Project links sync', 'Live Portfolio reviews'],
        assignment: 'Deploy your portfolio publicly and submit the live URL for review.',
        resources: ['Vercel DNS Mapping Checklist', 'ReadMe Template bundle'],
      },
    ],
    faq: [
      {
        q: 'Why only 50 students per batch?',
        a: 'We cap our classes strictly to ensure instructors can give detailed code reviews on assignments, debug compiler issues live, and unmute participants to answer specific doubt threads without running out of time.',
      },
      {
        q: 'Do I need prior programming experience?',
        a: 'Basic knowledge of HTML, CSS, and Javascript is recommended since we write actual code. However, this workshop is designed to be beginner friendly, and we explain all AI-assisted tools from scratch.',
      },
      {
        q: 'Will session recordings be available?',
        a: 'Yes, absolutely! All session recordings, slides, prompts, and code templates will be made available inside your dashboard portal for life, so you can review them whenever you want.',
      },
      {
        q: 'Will my assignments actually be checked?',
        a: 'Yes. You will push your code to GitHub and submit it to our dashboard. A mentor will review your pull request, check the deployment, and leave comment feedback directly on your code.',
      },
    ],
    learningOutcomes: [
      { title: 'Deploy Live App', desc: 'Deploy a responsive React site on Vercel mapped to your domain.' },
      { title: 'AI Developer Flow', desc: 'Master prompt chains, vibe coding, and AI context libraries.' },
      { title: 'Portfolio Project', desc: 'Add a premium, responsive project to show recruiters.' },
      { title: 'Framer Animations', desc: 'Implement magnetic cards, scroll effects, and custom triggers.' },
    ],
  },
  {
    title: 'React From Scratch: Core Concepts',
    slug: 'react-from-scratch',
    description: 'Learn React by building it yourself. Understand VDOM, fiber reconciler, diffing algorithms, and hooks under the hood.',
    aboutText: 'Why React works the way it works? In this hands-on workshop, we write a simplified version of React from absolute scratch. No packages, just vanilla JavaScript to construct virtual trees, render components, build states, and create reconciliation loops.',
    difficulty: 'Intermediate',
    category: 'Frontend',
    duration: '1 Day',
    sessions: 2,
    price: 499,
    originalPrice: 1499,
    date: '18 July',
    status: 'Completed',
    seatLimit: 50,
    remainingSeats: 0,
    instructor: 'Alex Coder (Lead Architect)',
    highlights: [
      '2 Live Reconciliation coding sessions',
      'Virtual DOM implementation',
      'Step-by-step hook recreation',
      'Life-time recordings and code repo',
    ],
    schedule: [],
    faq: [],
    learningOutcomes: [],
  },
  {
    title: 'Dev Tools Worth ₹2 Lakhs+',
    slug: 'dev-tools-worth-2l',
    description: 'Learn how students can legally access professional developer tools, cloud credits, AI services, IDEs, and premium software worth over ₹2,00,000 for free through educational programs.',
    aboutText: 'Unlock professional licenses, servers, APIs, and AI subscriptions completely for free. We guide you through student developer packs, application essays, validation documents, and credits setups.',
    difficulty: 'Beginner',
    category: 'Dev Tools',
    duration: '1 Day',
    sessions: 1,
    price: 0,
    originalPrice: 999,
    date: '25 July',
    status: 'Upcoming',
    seatLimit: 100,
    remainingSeats: 85,
    instructor: 'DTA Ops Team',
    highlights: [
      'Verification setups walk-through',
      'GitHub Student Pack application review',
      'AWS / GCP Cloud credit setup',
      'Premium IDE activations',
    ],
    schedule: [],
    faq: [],
    learningOutcomes: [],
  },
  {
    title: 'Full Stack SaaS Bootcamp',
    slug: 'full-stack-bootcamp',
    description: 'Build and deploy a complete production-ready SaaS product with Next.js, Stripe Payments, Prisma, Postgres, and Resend.',
    difficulty: 'Advanced',
    category: 'Backend',
    duration: '3 Days',
    sessions: 6,
    price: 2499,
    originalPrice: 5999,
    date: 'August (Est.)',
    status: 'Upcoming',
    seatLimit: 50,
    remainingSeats: 50,
    instructor: 'Alex Coder',
    highlights: [],
    schedule: [],
    faq: [],
    learningOutcomes: [],
  },
  {
    title: 'AI Agents & LLM Pipelines',
    slug: 'ai-agents-workshop',
    description: 'Create multi-agent orchestration systems, custom RAG pipelines, and API tool calling structures using LangChain and Vercel AI SDK.',
    difficulty: 'Advanced',
    category: 'AI',
    duration: '2 Days',
    sessions: 4,
    price: 1999,
    originalPrice: 4999,
    date: 'August (Est.)',
    status: 'Upcoming',
    seatLimit: 50,
    remainingSeats: 50,
    instructor: 'Alex Coder',
    highlights: [],
    schedule: [],
    faq: [],
    learningOutcomes: [],
  },
  {
    title: 'System Design for Scale',
    slug: 'system-design-workshop',
    description: 'Learn load balancing, horizontal scaling, caching strategies, and database sharding workflows by designing real high-traffic apps.',
    difficulty: 'Intermediate',
    category: 'Backend',
    duration: '2 Days',
    sessions: 3,
    price: 1499,
    originalPrice: 3999,
    date: 'September (Est.)',
    status: 'Upcoming',
    seatLimit: 50,
    remainingSeats: 50,
    instructor: 'DTA Engineering team',
    highlights: [],
    schedule: [],
    faq: [],
    learningOutcomes: [],
  }
];
