import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const seo = {
  title: z.string(),
  description: z.string(),
  ogImage: z.string().optional(),
};

const attractions = defineCollection({
  loader: glob({ base: './src/content/attractions', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...seo,
    name: z.string(),
    h1: z.string(),
    oneLiner: z.string(),
    heroImage: z.string(),
    heroAlt: z.string(),
    address: z.string().optional(),
    admission: z.string().optional(),
    stay: z.string().optional(),
    bestTime: z.string().optional(),
    audience: z.string().optional(),
    accessibility: z.string().optional(),
    pets: z.string().optional(),
    night: z.string().optional(),
    order: z.number().default(50),
    lastVerifiedAt: z.string(),
    editor: z.string().default('南寮魚鱗天梯編輯部'),
    schemaType: z.enum(['TouristAttraction', 'TouristDestination']).default('TouristAttraction'),
  }),
});

const itineraries = defineCollection({
  loader: glob({ base: './src/content/itineraries', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...seo,
    name: z.string(),
    h1: z.string(),
    oneLiner: z.string(),
    heroImage: z.string(),
    heroAlt: z.string(),
    duration: z.string(),
    audience: z.string(),
    stops: z.array(z.string()),
    order: z.number().default(50),
    lastVerifiedAt: z.string(),
    editor: z.string().default('南寮魚鱗天梯編輯部'),
  }),
});

const food = defineCollection({
  loader: glob({ base: './src/content/food', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...seo,
    name: z.string(),
    h1: z.string(),
    oneLiner: z.string(),
    heroImage: z.string(),
    heroAlt: z.string(),
    category: z.string(),
    order: z.number().default(50),
    lastVerifiedAt: z.string(),
    editor: z.string().default('南寮魚鱗天梯編輯部'),
  }),
});

const guides = defineCollection({
  loader: glob({ base: './src/content/guides', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...seo,
    name: z.string(),
    h1: z.string(),
    oneLiner: z.string(),
    heroImage: z.string(),
    heroAlt: z.string(),
    order: z.number().default(50),
    lastVerifiedAt: z.string(),
    editor: z.string().default('南寮魚鱗天梯編輯部'),
  }),
});

export const collections = { attractions, itineraries, food, guides };
