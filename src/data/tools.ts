export interface Tool {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: 'Design' | 'Development' | 'Productivity' | 'Other';
  tags: string[];
  url: string;
  github?: string | null;
  stars?: number | null;
  license: string;
  featured: boolean;
  addedDate: string;
  
  // Kurator review data
  review: {
    rating: number; // 1-5 stars
    kuratorNotes: string; // Personal review by curator
    pros: string[]; // List of advantages
    cons: string[]; // List of disadvantages
    useCases: string[]; // Best use cases for this tool
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    timeToLearn: string; // e.g., "1-2 hours", "1 week"
  };
  
  // Analytics for filtering
  popularity: {
    views: number;
    clicks: number;
    trendScore: number; // Calculated based on recent activity
  };
}

export const toolsData: Tool[] = [
  // Featured Design Tools
  {
    id: "figma",
    name: "Figma",
    shortDescription: "Collaborative design tool for UI/UX prototyping",
    description: "Figma telah merevolusi cara tim desain bekerja dengan fitur real-time collaboration yang luar biasa. Sebagai kurator, saya suka bagaimana Figma memungkinkan multiple people edit file yang sama secara bersamaan tanpa konflik. Interface yang clean dan intuitive membuat it perfect untuk both beginners dan professionals.",
    category: "Design",
    tags: ["UI/UX", "Prototyping", "Collaboration", "Design System"],
    url: "https://figma.com",
    github: null,
    stars: null,
    license: "Freemium",
    featured: true,
    addedDate: "2025-01-01",
    review: {
      rating: 5,
      kuratorNotes: "Figma adalah game-changer untuk collaborative design. Plugin ecosystem yang luar biasa dan ability untuk create design systems yang scalable makes it my top recommendation.",
      pros: ["Real-time collaboration", "Powerful plugin ecosystem", "Free tier yang generous", "Cross-platform support", "Design systems support"],
      cons: ["Can be slow with large files", "Limited offline functionality", "Learning curve untuk advanced features"],
      useCases: ["Team collaboration on design projects", "Creating and maintaining design systems", "Rapid prototyping", "Client presentations and feedback"],
      difficulty: "Intermediate",
      timeToLearn: "1-2 weeks"
    },
    popularity: {
      views: 1250,
      clicks: 340,
      trendScore: 95
    }
  },
  {
    id: "framer",
    name: "Framer",
    shortDescription: "Design and publish responsive websites without code",
    description: "Framer adalah bridge yang perfect antara design dan development. Yang saya suka dari Framer adalah ability untuk create fully functional websites langsung dari design mockups tanpa perlu menulis code. Perfect untuk rapid prototyping dan showcase projects.",
    category: "Design",
    tags: ["Website Builder", "No-Code", "Interactive", "Responsive"],
    url: "https://framer.com",
    github: null,
    stars: null,
    license: "Freemium",
    featured: true,
    addedDate: "2025-01-15",
    review: {
      rating: 4,
      kuratorNotes: "Framer excels untuk creating interactive prototypes dan landing pages. However, untuk complex applications might need more customization yang hanya bisa didapat dari coding.",
      pros: ["No-code website building", "Interactive prototyping", "Responsive by default", "Good performance", "Easy publishing"],
      cons: ["Limited for complex applications", "Expensive for teams", "Learning curve untuk animations"],
      useCases: ["Landing pages and marketing sites", "Interactive prototypes", "Portfolio websites", "A/B testing variations"],
      difficulty: "Beginner",
      timeToLearn: "3-5 days"
    },
    popularity: {
      views: 890,
      clicks: 210,
      trendScore: 78
    }
  },

  // Featured Development Tools
  {
    id: "vscode",
    name: "Visual Studio Code",
    shortDescription: "Free, open-source code editor with extensive extensions",
    description: "VS Code telah menjadi industry standard untuk web development. Yang membuat VS Code special adalah extensibility - dengan thousands of extensions available, you can customize it untuk fit any workflow. Git integration yang seamless dan built-in terminal makes development workflow incredibly smooth.",
    category: "Development",
    tags: ["Editor", "Extensions", "Git", "Debugging", "IntelliSense"],
    url: "https://code.visualstudio.com",
    github: "microsoft/vscode",
    stars: 160000,
    license: "MIT",
    featured: true,
    addedDate: "2025-01-01",
    review: {
      rating: 5,
      kuratorNotes: "VS Code is my daily driver dan I can't imagine working without it. Extensions like GitLens, Prettier, dan ESLint make it incredibly powerful. The TypeScript integration is phenomenal.",
      pros: ["Massive extension ecosystem", "Excellent Git integration", "Great TypeScript support", "Cross-platform", "Free and open source"],
      cons: ["Can be resource heavy with many extensions", "Some features require extensions", "Occasional performance issues with large projects"],
      useCases: ["Web development (HTML, CSS, JS, TS)", "Backend development", "Data science", "Documentation writing"],
      difficulty: "Beginner",
      timeToLearn: "1-2 weeks"
    },
    popularity: {
      views: 2100,
      clicks: 580,
      trendScore: 98
    }
  },
  {
    id: "tailwindcss",
    name: "Tailwind CSS",
    shortDescription: "Utility-first CSS framework for rapid UI development",
    description: "Tailwind CSS telah mengubah cara saya approach CSS development. Utility-first approach mungkin terasa foreign initially, tapi once you get used to it, development speed increase dramatically. Ability untuk create custom design systems dan maintain consistency across projects adalah game-changer.",
    category: "Development",
    tags: ["CSS", "Framework", "Utility-first", "Responsive", "Custom Design"],
    url: "https://tailwindcss.com",
    github: "tailwindlabs/tailwindcss",
    stars: 77000,
    license: "MIT",
    featured: true,
    addedDate: "2025-01-01",
    review: {
      rating: 5,
      kuratorNotes: "Tailwind CSS revolutionized my development workflow. The utility-first approach might seem counterintuitive initially, but the speed and maintainability gains are incredible.",
      pros: ["Rapid development", "Consistent design system", "Small production bundles", "Highly customizable", "Great documentation"],
      cons: ["Learning curve for utility classes", "HTML can become verbose", "Requires understanding of CSS concepts"],
      useCases: ["Rapid UI development", "Design systems", "Prototyping", "Landing pages", "Component libraries"],
      difficulty: "Intermediate",
      timeToLearn: "2-3 weeks"
    },
    popularity: {
      views: 1800,
      clicks: 420,
      trendScore: 92
    }
  },
  {
    id: "docker",
    name: "Docker",
    shortDescription: "Platform for developing, shipping, and running applications",
    description: "Docker adalah essential tool untuk modern development workflows. Environment consistency yang Docker provides between development dan production adalah invaluable. Learning curve-nya steep initially, tapi once you master it, deployment dan scaling becomes much more manageable.",
    category: "Development",
    tags: ["Containerization", "DevOps", "Deployment", "Microservices"],
    url: "https://docker.com",
    github: "moby/moby",
    stars: 69000,
    license: "Apache 2.0",
    featured: true,
    addedDate: "2025-01-10",
    review: {
      rating: 4,
      kuratorNotes: "Docker is powerful tapi requires significant learning investment. For small projects might be overkill, but for team development dan production deployment, it's indispensable.",
      pros: ["Environment consistency", "Easy scaling", "Resource efficiency", "Great ecosystem", "Industry standard"],
      cons: ["Steep learning curve", "Resource intensive for local development", "Complex debugging sometimes"],
      useCases: ["Microservices architecture", "Development environment consistency", "CI/CD pipelines", "Cloud deployment"],
      difficulty: "Advanced",
      timeToLearn: "2-4 weeks"
    },
    popularity: {
      views: 1500,
      clicks: 290,
      trendScore: 85
    }
  },

  // Productivity Tools
  {
    id: "notion",
    name: "Notion",
    shortDescription: "All-in-one workspace for notes, docs, and project management",
    description: "Notion adalah digital workspace yang incredibly flexible. Yang saya appreciate adalah ability untuk create databases, documentation, dan project management dalam satu platform. Template ecosystem yang extensive makes it easy untuk get started dengan structured approach.",
    category: "Productivity",
    tags: ["Notes", "Documentation", "Project Management", "Database", "Collaboration"],
    url: "https://notion.so",
    github: null,
    stars: null,
    license: "Freemium",
    featured: true,
    addedDate: "2025-01-05",
    review: {
      rating: 4,
      kuratorNotes: "Notion excels sebagai all-in-one workspace, tapi bisa overwhelming initially. Once you find your workflow, it becomes incredibly powerful untuk knowledge management.",
      pros: ["Incredibly flexible", "Great templates", "Good collaboration", "Database functionality", "Cross-platform sync"],
      cons: ["Can be slow with large databases", "Steep learning curve", "Occasional sync issues"],
      useCases: ["Personal knowledge management", "Team documentation", "Project planning", "Content creation workflows"],
      difficulty: "Intermediate",
      timeToLearn: "2-3 weeks"
    },
    popularity: {
      views: 1100,
      clicks: 320,
      trendScore: 88
    }
  },
  {
    id: "obsidian",
    name: "Obsidian",
    shortDescription: "Knowledge base that works on local Markdown files",
    description: "Obsidian berbeda dari note-taking apps lainnya karena local-first approach. Data kamu tetap owned by you dan stored locally. Graph view dan bidirectional linking features membuat it perfect untuk building knowledge networks dan connecting ideas.",
    category: "Productivity",
    tags: ["Markdown", "Knowledge Base", "Local-first", "PKM", "Graph View"],
    url: "https://obsidian.md",
    github: "obsidianmd/obsidian-releases",
    stars: 34000,
    license: "Proprietary",
    featured: true,
    addedDate: "2025-01-12",
    review: {
      rating: 5,
      kuratorNotes: "Obsidian is my go-to untuk personal knowledge management. The plugin ecosystem dan graph view features membuat building connections between ideas incredibly natural.",
      pros: ["Local-first privacy", "Powerful graph view", "Extensive plugin ecosystem", "Markdown support", "Bidirectional linking"],
      cons: ["Can be intimidating initially", "Plugin management complexity", "Mobile apps need improvement"],
      useCases: ["Personal knowledge management", "Research projects", "Content planning", "Learning and note-taking"],
      difficulty: "Intermediate",
      timeToLearn: "1-2 weeks"
    },
    popularity: {
      views: 950,
      clicks: 280,
      trendScore: 82
    }
  },

  // Additional Development Tools
  {
    id: "postman",
    name: "Postman",
    shortDescription: "API platform for building and using APIs",
    description: "Postman is essential untuk API development dan testing. Interface yang intuitive dan powerful features untuk creating collections, automating tests, dan collaboration makes it invaluable untuk modern API development workflows.",
    category: "Development",
    tags: ["API", "Testing", "Documentation", "Mock Servers", "Automation"],
    url: "https://postman.com",
    github: null,
    stars: null,
    license: "Freemium",
    featured: false,
    addedDate: "2025-01-20",
    review: {
      rating: 4,
      kuratorNotes: "Postman is the de facto standard untuk API testing. The ability untuk create automated tests dan document APIs dalam satu platform is incredibly valuable.",
      pros: ["Intuitive interface", "Powerful testing features", "Great documentation", "Team collaboration", "Mock servers"],
      cons: ["Can be resource heavy", "Occasional sync issues", "Advanced features require paid plan"],
      useCases: ["API development and testing", "Documentation", "Team collaboration", "Automated testing"],
      difficulty: "Beginner",
      timeToLearn: "3-5 days"
    },
    popularity: {
      views: 750,
      clicks: 180,
      trendScore: 75
    }
  },
  {
    id: "git",
    name: "Git",
    shortDescription: "Distributed version control system",
    description: "Git adalah foundation of modern software development. While CLI interface bisa intimidating initially, understanding Git concepts adalah crucial untuk any developer. Benefits untuk collaboration, backup, dan code history management cannot be overstated.",
    category: "Development",
    tags: ["Version Control", "CLI", "Collaboration", "Branching", "Merging"],
    url: "https://git-scm.com",
    github: "git/git",
    stars: 52000,
    license: "GPL v2",
    featured: false,
    addedDate: "2025-01-01",
    review: {
      rating: 5,
      kuratorNotes: "Git is fundamental untuk any software development. While the learning curve is steep, the benefits untuk version control dan collaboration are indispensable.",
      pros: ["Powerful version control", "Excellent branching and merging", "Distributed architecture", "Industry standard", "Great ecosystem"],
      cons: ["Steep learning curve", "CLI can be intimidating", "Can be complex for beginners"],
      useCases: ["Version control for any project", "Team collaboration", "Code backup and history", "Open source contributions"],
      difficulty: "Advanced",
      timeToLearn: "2-4 weeks"
    },
    popularity: {
      views: 1650,
      clicks: 380,
      trendScore: 90
    }
  },
  {
    id: "github",
    name: "GitHub",
    shortDescription: "Platform for hosting and reviewing code",
    description: "GitHub telah menjadi social platform untuk developers. More than just code hosting, it offers collaboration tools, project management, dan vibrant community yang make open source development possible dan enjoyable.",
    category: "Development",
    tags: ["Version Control", "Git", "Collaboration", "CI/CD", "Open Source"],
    url: "https://github.com",
    github: null,
    stars: null,
    license: "Freemium",
    featured: false,
    addedDate: "2025-01-01",
    review: {
      rating: 5,
      kuratorNotes: "GitHub is more than just code hosting - it's the social platform for developers. The CI/CD integration dan project management features make it comprehensive solution.",
      pros: ["Vast open source ecosystem", "Excellent collaboration tools", "Great CI/CD integration", "Active community", "Reliable infrastructure"],
      cons: ["Owned by Microsoft", "Can be overwhelming for beginners", "Some features require paid plans"],
      useCases: ["Open source projects", "Team collaboration", "Portfolio showcasing", "CI/CD workflows"],
      difficulty: "Beginner",
      timeToLearn: "1 week"
    },
    popularity: {
      views: 1900,
      clicks: 520,
      trendScore: 95
    }
  },
  {
    id: "vercel",
    name: "Vercel",
    shortDescription: "Platform for frontend frameworks with optimized deployments",
    description: "Vercel makes deployment incredibly simple untuk frontend applications. Automatic deployments dari Git repositories, edge functions, dan excellent performance optimizations make it ideal untuk modern web applications.",
    category: "Development",
    tags: ["Deployment", "Frontend", "Serverless", "CDN", "Performance"],
    url: "https://vercel.com",
    github: "vercel/vercel",
    stars: 24000,
    license: "Apache 2.0",
    featured: false,
    addedDate: "2025-01-08",
    review: {
      rating: 4,
      kuratorNotes: "Vercel excels at frontend deployment dengan minimal configuration. Perfect untuk Next.js applications dan static sites dengan serverless functions.",
      pros: ["Simple deployment process", "Excellent performance", "Great Next.js integration", "Automatic scaling", "Preview deployments"],
      cons: ["Can be expensive for high traffic", "Limited backend capabilities", "Vendor lock-in concerns"],
      useCases: ["Frontend deployments", "Next.js applications", "Static sites", "Serverless functions"],
      difficulty: "Beginner",
      timeToLearn: "2-3 days"
    },
    popularity: {
      views: 980,
      clicks: 240,
      trendScore: 80
    }
  },
  {
    id: "netlify",
    name: "Netlify",
    shortDescription: "Platform for modern web projects with continuous deployment",
    description: "Netlify offers comprehensive solution untuk JAMstack applications. Form handling, serverless functions, dan seamless Git integration make it powerful untuk full-stack development tanpa kompleksitas traditional hosting.",
    category: "Development",
    tags: ["Deployment", "JAMstack", "Serverless", "Forms", "Edge"],
    url: "https://netlify.com",
    github: "netlify/cli",
    stars: 8000,
    license: "MIT",
    featured: false,
    addedDate: "2025-01-12",
    review: {
      rating: 4,
      kuratorNotes: "Netlify is excellent untuk JAMstack applications dengan built-in features like form handling dan serverless functions. Great developer experience overall.",
      pros: ["Comprehensive JAMstack solution", "Built-in form handling", "Serverless functions", "Great developer experience", "Generous free tier"],
      cons: ["Limited backend capabilities", "Can be slow for large sites", "Some features require paid plans"],
      useCases: ["JAMstack websites", "Static sites with dynamic features", "Form-heavy applications", "Serverless functions"],
      difficulty: "Beginner",
      timeToLearn: "3-5 days"
    },
    popularity: {
      views: 820,
      clicks: 190,
      trendScore: 72
    }
  },

  // Additional Design Tools
  {
    id: "penpot",
    name: "Penpot",
    shortDescription: "Open-source design and prototyping platform",
    description: "Penpot adalah game-changer dalam design tools karena completely open source dan free. Yang saya appreciate adalah commitment untuk open design tools yang accessible untuk everyone, regardless of budget atau company size.",
    category: "Design",
    tags: ["Design", "Prototyping", "Open Source", "Collaboration", "Design System"],
    url: "https://penpot.app",
    github: "penpot/penpot",
    stars: 15000,
    license: "MPL 2.0",
    featured: false,
    addedDate: "2025-01-18",
    review: {
      rating: 4,
      kuratorNotes: "Penpot is impressive sebagai open source alternative to commercial design tools. While still developing, it shows great potential untuk democratizing design tools.",
      pros: ["Completely free and open source", "Good collaboration features", "SVG-based design", "No vendor lock-in", "Active development"],
      cons: ["Still developing features", "Performance can be slow", "Smaller plugin ecosystem"],
      useCases: ["Open source projects", "Budget-conscious teams", "Educational purposes", "Corporate design systems"],
      difficulty: "Intermediate",
      timeToLearn: "2-3 weeks"
    },
    popularity: {
      views: 650,
      clicks: 120,
      trendScore: 65
    }
  },
  {
    id: "sketch",
    name: "Sketch",
    shortDescription: "Digital design toolkit for UI/UX designers",
    description: "Sketch has been the gold standard untuk UI/UX design untuk years. Powerful vector editing, symbol libraries, dan excellent plugin ecosystem make it powerful untuk design systems dan complex UI projects.",
    category: "Design",
    tags: ["UI/UX", "Vector", "Prototyping", "Symbols", "Libraries"],
    url: "https://sketch.com",
    github: null,
    stars: null,
    license: "Proprietary",
    featured: false,
    addedDate: "2025-01-01",
    review: {
      rating: 4,
      kuratorNotes: "Sketch is still powerful untuk UI/UX design despite growing competition. The symbol system dan plugin ecosystem are unmatched untuk complex design systems.",
      pros: ["Powerful vector editing", "Excellent symbol system", "Great plugin ecosystem", "Design systems support", "Mac-only optimization"],
      cons: ["Mac only", "Expensive subscription model", "Cloud sync can be problematic", "Collaborative features lag behind competitors"],
      useCases: ["UI/UX design", "Design systems", "Mobile app design", "Symbol libraries"],
      difficulty: "Intermediate",
      timeToLearn: "2-3 weeks"
    },
    popularity: {
      views: 720,
      clicks: 150,
      trendScore: 68
    }
  },

  // Additional Productivity Tools
  {
    id: "linear",
    name: "Linear",
    shortDescription: "Modern issue tracking tool for high-performance teams",
    description: "Linear represents modern approach to project management dengan focus pada speed dan user experience. Interface yang beautiful dan performance yang excellent make it joy untuk use daily.",
    category: "Productivity",
    tags: ["Project Management", "Issue Tracking", "Workflows", "API", "Integrations"],
    url: "https://linear.app",
    github: null,
    stars: null,
    license: "Freemium",
    featured: false,
    addedDate: "2025-01-22",
    review: {
      rating: 4,
      kuratorNotes: "Linear is beautiful dan fast, making project management actually enjoyable. Perfect untuk teams yang value aesthetics dan performance dalam their tools.",
      pros: ["Beautiful interface", "Excellent performance", "Great keyboard shortcuts", "Good API", "Seamless integrations"],
      cons: ["Can be expensive for large teams", "Learning curve untuk advanced features", "Limited customization options"],
      useCases: ["Team project management", "Issue tracking", "Sprint planning", "Product development"],
      difficulty: "Intermediate",
      timeToLearn: "1-2 weeks"
    },
    popularity: {
      views: 580,
      clicks: 140,
      trendScore: 70
    }
  },
  {
    id: "slack",
    name: "Slack",
    shortDescription: "Business communication platform with integrations",
    description: "Slack has become the standard untuk team communication dengan powerful integrations dan workflow automation. While can be overwhelming dengan notifications, proper setup makes it incredibly effective untuk team coordination.",
    category: "Productivity",
    tags: ["Communication", "Team Chat", "Integrations", "Workflows", "Channels"],
    url: "https://slack.com",
    github: null,
    stars: null,
    license: "Freemium",
    featured: false,
    addedDate: "2025-01-01",
    review: {
      rating: 4,
      kuratorNotes: "Slack is powerful untuk team communication once properly configured. The key is setting up proper channels dan integrating dengan other tools effectively.",
      pros: ["Extensive integrations", "Powerful search", "Good mobile apps", "Workflow automation", "File sharing"],
      cons: ["Can be noisy dengan notifications", "Expensive untuk large teams", "Information overload potential"],
      useCases: ["Team communication", "Project coordination", "Customer support", "Developer workflows"],
      difficulty: "Beginner",
      timeToLearn: "3-5 days"
    },
    popularity: {
      views: 1100,
      clicks: 300,
      trendScore: 85
    }
  }
];

// Helper functions
export const getAllCategories = (): string[] => {
  return [...new Set(toolsData.map(tool => tool.category))].sort();
};

export const getFeaturedTools = (): Tool[] => {
  return toolsData.filter(tool => tool.featured);
};

export const getToolsByCategory = (category: string): Tool[] => {
  if (category === 'all') return toolsData;
  return toolsData.filter(tool => tool.category.toLowerCase() === category.toLowerCase());
};

export const getToolsByFilter = (filter: string, category?: string): Tool[] => {
  let results = toolsData;
  
  // Apply category filter first
  if (category && category !== 'all') {
    results = getToolsByCategory(category);
  }
  
  // Apply sorting filter
  switch (filter) {
    case 'latest':
      return results.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
    case 'trending':
      return results.sort((a, b) => b.popularity.trendScore - a.popularity.trendScore);
    case 'must-have':
      return results.sort((a, b) => b.review.rating - a.review.rating);
    default:
      return results;
  }
};

export const searchTools = (query: string, category?: string, filter?: string): Tool[] => {
  let results = getToolsByFilter(filter || 'latest', category);
  
  if (!query.trim()) return results;
  
  const searchTerm = query.toLowerCase();
  return results.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm) ||
    tool.shortDescription.toLowerCase().includes(searchTerm) ||
    tool.description.toLowerCase().includes(searchTerm) ||
    tool.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

export const getToolStats = () => {
  const categories = getAllCategories();
  const totalTools = toolsData.length;
  const featuredTools = getFeaturedTools().length;
  const avgRating = (toolsData.reduce((sum, tool) => sum + tool.review.rating, 0) / toolsData.length).toFixed(1);
  
  return {
    total: totalTools,
    categories: categories.length,
    featured: featuredTools,
    avgRating: parseFloat(avgRating)
  };
};