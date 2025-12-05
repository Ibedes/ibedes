import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
    type: 'content', // v2.5.0+ content collections
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        pubDate: z.date().or(z.string()).optional(),
        updatedDate: z.date().or(z.string()).optional(),
        featuredImage: z.string().optional(),
        tags: z.array(z.string()).optional(),
        featured: z.boolean().optional(),
        time: z.number().optional(),
        affiliateProducts: z.array(z.string()).optional(),
    }).passthrough(), // Allow other fields without validation error
});

export const collections = {
    'blog': blogCollection,
};
