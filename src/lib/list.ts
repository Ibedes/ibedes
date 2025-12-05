import type { ArticleFrontmatter, ProjectFrontmatter } from "./types";
import { getShortDescription, processContentInDir } from "./utils";
import { getArticlesFromDatabase } from "./database-helpers";
import { getCollection } from "astro:content";

// Check if we're in production (read-only filesystem)
const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';

async function getArticles() {
  if (isProduction) {
    return await getArticlesFromDatabase();
  } else {
    // In development, use Astro Content Collections
    const blogEntries = await getCollection('blog');

    return blogEntries.map(entry => {
      const data = entry.data as any; // Type assertion since schema might differ slightly from ArticleFrontmatter
      const shortDescription = getShortDescription(data.description);

      return {
        title: data.title,
        description: shortDescription,
        tags: data.tags,
        time: data.time,
        featured: data.featured,
        timestamp: data.pubDate || data.timestamp || new Date().toISOString(),
        filename: `/blog/${entry.slug}`, // Keep this for compatibility, though it's technically a route now
      };
    }).sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
  }
}

export const articles = await getArticles();

export const projects = (
  await processContentInDir<ProjectFrontmatter, ProjectFrontmatter>(
    "projects",
    (data) => {
      const shortDescription = getShortDescription(
        data.frontmatter.description,
      );
      return {
        title: data.frontmatter.title,
        description: shortDescription,
        tags: data.frontmatter.tags,
        githubUrl: data.frontmatter.githubUrl,
        liveUrl: data.frontmatter.liveUrl,
        featured: data.frontmatter.featured,
        timestamp: data.frontmatter.timestamp,
        filename: `/projects/${data.frontmatter.filename}`,
      };
    },
  )
).sort((a, b) => {
  const dateA = new Date(a.timestamp);
  const dateB = new Date(b.timestamp);
  return dateB.getTime() - dateA.getTime();
});