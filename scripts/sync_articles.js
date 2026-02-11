
import { createClient } from '@supabase/supabase-js';
import { articles } from '../src/data/articles.js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function syncArticles() {
    console.log(`Starting sync of ${articles.length} articles...`);

    for (const article of articles) {
        console.log(`Syncing: ${article.title}`);

        const payload = {
            id: article.id,
            category: article.category,
            author: article.author,
            title: article.title,
            excerpt: article.excerpt,
            image: article.image,
            is_premium: article.isPremium || false,
            has_dual_version: article.hasDualVersion || false,
            free_content: article.freeContent || null,
            premium_content: article.premiumContent || null,
            content: article.content || null
        };

        const { error } = await supabase
            .from('articles')
            .upsert(payload, { onConflict: 'id' });

        if (error) {
            console.error(`Error syncing ${article.id}:`, error.message);
        }
    }

    console.log("Sync completed.");
}

syncArticles();
