// Set any item to undefined to remove it from the site or to use the default value

export const GLOBAL = {
  // Site metadata
  username: "ibedes",
  rootUrl: "https://ibedes.xyz",
  shortDescription: "Retro-Inspired Theme &<br /> Built for Astro",
  longDescription: "Zaggonaut is a retro-inspired theme for Astro, built using TypeScript, TailwindCSS, and Astro.",
  
  // Social media links
  githubProfile: "https://github.com/ibedestudio",
  threadsProfile: "https://www.threads.com/@bellamujiaa",
  
  // Common text names used throughout the site
  articlesName: "Articles",
  projectsName: "Projects",
  viewAll: "View All",
  
  // Common descriptions used throughout the site
  noArticles: "No featured articles yet.",
  noProjects: "No featured projects yet.",

  // Blog metadata
  blogTitle: "My Thoughts & Takes",
  blogShortDescription: "Practical wisdom, unfiltered thoughts, and hot takes.",
  blogLongDescription: "Web development, tech trends, and the occasional programming mishap.",

  // Project metadata
  projectTitle: "Projects and Code",
  projectShortDescription: "A list of my web development projects and developer tools.",
  projectLongDescription: "All of my projects, including both frontend and full-stack applications.",

  // Profile image
  profileImage: "ibedes.jpg",

  // Menu items
  menu: {
    home: "/",
    projects: "/projects",
    blog: "/blog",
  },

  // Newsletter / subscribe card copy
  newsletter: {
    title: "Gabung Newsletter",
    description: "Dapatkan tulisan terbaru, catatan projek, dan eksperimen langsung di inbox tanpa spam.",
    buttonText: "Berlangganan",
    successMessage: "Tipis aja, cuma 1-2 email per bulan.",
    placeholder: "nama@emailkamu.com",
    formAction: "https://buttondown.com/api/emails/embed-subscribe/muji", // Ganti dengan endpoint newsletter kamu
  },
};
