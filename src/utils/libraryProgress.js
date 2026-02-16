// Library Progress Tracking Utilities
// Handles reading progress, bookmarks, and reading history for the Knowledge Library

const STORAGE_KEY = 'boxing24_library_progress';

/**
 * Get progress data structure from localStorage
 */
const getProgressData = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {
        articles: {},
        lessons: {},
        reviews: {},
        bookmarks: [],
        history: []
    };
};

/**
 * Save progress data to localStorage
 */
const saveProgressData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/**
 * Get progress for a specific article/lesson
 * @param {string} id - The content ID
 * @param {string} type - 'article', 'lesson', or 'review'
 * @returns {Object} Progress object
 */
export const getProgress = (id, type = 'article') => {
    const data = getProgressData();
    const key = `${type}s`; // articles, lessons, reviews
    return data[key][id] || {
        progress: 0,
        completed: false,
        lastAccessed: null
    };
};

/**
 * Update progress for content
 * @param {string} id - The content ID
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} type - Content type
 */
export const setProgress = (id, progress, type = 'article') => {
    const data = getProgressData();
    const key = `${type}s`;

    data[key][id] = {
        ...data[key][id],
        progress: Math.min(100, Math.max(0, progress)),
        completed: progress >= 100,
        lastAccessed: new Date().toISOString()
    };

    saveProgressData(data);

    // Add to history if significant progress
    if (progress > 10) {
        addToHistory(id, type);
    }
};

/**
 * Mark content as completed
 * @param {string} id - The content ID
 * @param {string} type - Content type
 */
export const markAsCompleted = (id, type = 'article') => {
    setProgress(id, 100, type);
};

/**
 * Toggle bookmark status
 * @param {string} id - The content ID
 * @param {string} type - Content type
 * @returns {boolean} New bookmark status
 */
export const toggleBookmark = (id, type = 'article') => {
    const data = getProgressData();
    const bookmarkId = `${type}:${id}`;
    const index = data.bookmarks.indexOf(bookmarkId);

    if (index > -1) {
        data.bookmarks.splice(index, 1);
        saveProgressData(data);
        return false;
    } else {
        data.bookmarks.push(bookmarkId);
        saveProgressData(data);
        return true;
    }
};

/**
 * Check if content is bookmarked
 * @param {string} id - The content ID
 * @param {string} type - Content type
 * @returns {boolean}
 */
export const isBookmarked = (id, type = 'article') => {
    const data = getProgressData();
    return data.bookmarks.includes(`${type}:${id}`);
};

/**
 * Get all bookmarked content
 * @returns {Array} Array of bookmark objects
 */
export const getBookmarks = () => {
    const data = getProgressData();
    return data.bookmarks.map(bookmark => {
        const [type, id] = bookmark.split(':');
        return { id, type };
    });
};

/**
 * Add item to reading history
 * @param {string} id - The content ID
 * @param {string} type - Content type
 */
const addToHistory = (id, type) => {
    const data = getProgressData();
    const historyItem = {
        id,
        type,
        accessedAt: new Date().toISOString()
    };

    // Remove existing entry if present
    data.history = data.history.filter(h => !(h.id === id && h.type === type));

    // Add to front of history
    data.history.unshift(historyItem);

    // Keep only last 50 items
    data.history = data.history.slice(0, 50);

    saveProgressData(data);
};

/**
 * Get reading history
 * @param {number} limit - Maximum number of items to return
 * @returns {Array}
 */
export const getReadingHistory = (limit = 10) => {
    const data = getProgressData();
    return data.history.slice(0, limit);
};

/**
 * Get statistics
 * @returns {Object} Stats object
 */
export const getStats = () => {
    const data = getProgressData();

    const articlesCompleted = Object.values(data.articles).filter(a => a.completed).length;
    const lessonsCompleted = Object.values(data.lessons).filter(l => l.completed).length;
    const reviewsCompleted = Object.values(data.reviews).filter(r => r.completed).length;

    return {
        articlesCompleted,
        lessonsCompleted,
        reviewsCompleted,
        totalCompleted: articlesCompleted + lessonsCompleted + reviewsCompleted,
        bookmarksCount: data.bookmarks.length,
        historyCount: data.history.length
    };
};

/**
 * Get "Continue Where You Left Off" items
 * @param {number} limit - Maximum number of items
 * @returns {Array}
 */
export const getContinueReading = (limit = 3) => {
    const data = getProgressData();
    const allProgress = [];

    // Collect all in-progress items (0 < progress < 100)
    Object.entries(data.articles).forEach(([id, prog]) => {
        if (prog.progress > 0 && prog.progress < 100 && prog.lastAccessed) {
            allProgress.push({ id, type: 'article', ...prog });
        }
    });

    Object.entries(data.lessons).forEach(([id, prog]) => {
        if (prog.progress > 0 && prog.progress < 100 && prog.lastAccessed) {
            allProgress.push({ id, type: 'lesson', ...prog });
        }
    });

    Object.entries(data.reviews).forEach(([id, prog]) => {
        if (prog.progress > 0 && prog.progress < 100 && prog.lastAccessed) {
            allProgress.push({ id, type: 'review', ...prog });
        }
    });

    // Sort by most recently accessed
    allProgress.sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed));

    return allProgress.slice(0, limit);
};

/**
 * Calculate compendium level completion
 * @param {string} levelId - The level ID (e.g., 'lvl_1')
 * @param {Object} levelData - The level data from compendium
 * @returns {Object} Completion stats
 */
export const getLevelCompletion = (levelId, levelData) => {
    const data = getProgressData();
    let totalLessons = 0;
    let completedLessons = 0;

    levelData.modules.forEach(module => {
        module.lessons.forEach(lesson => {
            totalLessons++;
            const progress = data.lessons[lesson.id];
            if (progress && progress.completed) {
                completedLessons++;
            }
        });
    });

    return {
        totalLessons,
        completedLessons,
        percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    };
};

/**
 * Clear all progress data (use with caution!)
 */
export const clearAllProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
};
