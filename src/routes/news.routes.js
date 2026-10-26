const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticate, authorize, optionalAuth, logAudit } = require('../auth');

// Public: Get all published news & activity articles
router.get('/', optionalAuth, (req, res) => {
  const { category, search, all } = req.query;
  const isAdmin = req.user && ['super_admin', 'ngo_admin'].includes(req.user.role);

  let query = 'SELECT * FROM news_articles';
  const conditions = [];
  const params = [];

  if (!isAdmin || all !== '1') {
    conditions.push('is_published = 1');
  }

  if (category && category !== 'All') {
    conditions.push('category = ?');
    params.push(category);
  }

  if (search && search.trim()) {
    conditions.push('(title LIKE ? OR summary LIKE ? OR content LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY id DESC';

  const articles = db.prepare(query).all(...params);
  return res.json({ success: true, articles });
});

// Public: Get single news article by slug or ID
router.get('/:identifier', (req, res) => {
  const { identifier } = req.params;

  let article = db.prepare('SELECT * FROM news_articles WHERE slug = ?').get(identifier);
  if (!article && !isNaN(identifier)) {
    article = db.prepare('SELECT * FROM news_articles WHERE id = ?').get(Number(identifier));
  }

  if (!article) {
    return res.status(404).json({ success: false, message: 'Article not found.' });
  }

  // Increment view counter
  try {
    db.prepare('UPDATE news_articles SET views_count = views_count + 1 WHERE id = ?').run(article.id);
    article.views_count += 1;
  } catch (e) {}

  return res.json({ success: true, article });
});

// Admin: Create new news article / activity publication
router.post('/', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  try {
    const {
      title,
      slug,
      category = 'Ground Activity Report',
      summary = '',
      content,
      featured_image = '',
      author = 'Editorial Board, RI8WIN Foundation',
      published_date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      is_published = 1
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Article title is required.' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Article content is required.' });
    }

    // Generate slug from title if not provided
    let cleanSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Ensure unique slug
    const existing = db.prepare('SELECT id FROM news_articles WHERE slug = ?').get(cleanSlug);
    if (existing) {
      cleanSlug += '-' + Math.floor(100 + Math.random() * 900);
    }

    const insert = db.prepare(`
      INSERT INTO news_articles (
        title, slug, category, summary, content, featured_image, author, published_date, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      title.trim(),
      cleanSlug,
      category.trim(),
      summary.trim(),
      content.trim(),
      featured_image.trim(),
      author.trim(),
      published_date.trim(),
      Number(is_published) ? 1 : 0
    );

    logAudit(
      'NEWS_CREATED',
      req.user.full_name,
      req.user.role,
      'News',
      String(result.lastInsertRowid),
      `Published news article: "${title.trim()}" (slug: ${cleanSlug})`
    );

    const created = db.prepare('SELECT * FROM news_articles WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, message: 'Article created successfully!', article: created });
  } catch (error) {
    console.error('Error creating news article:', error);
    return res.status(500).json({ success: false, message: 'Failed to create article: ' + error.message });
  }
});

// Admin: Update news article
router.put('/:id', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM news_articles WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    const {
      title = existing.title,
      slug = existing.slug,
      category = existing.category,
      summary = existing.summary,
      content = existing.content,
      featured_image = existing.featured_image,
      author = existing.author,
      published_date = existing.published_date,
      is_published = existing.is_published
    } = req.body;

    const update = db.prepare(`
      UPDATE news_articles SET
        title = ?,
        slug = ?,
        category = ?,
        summary = ?,
        content = ?,
        featured_image = ?,
        author = ?,
        published_date = ?,
        is_published = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    update.run(
      title.trim(),
      slug.trim(),
      category.trim(),
      summary.trim(),
      content.trim(),
      featured_image.trim(),
      author.trim(),
      published_date.trim(),
      Number(is_published) ? 1 : 0,
      id
    );

    logAudit(
      'NEWS_UPDATED',
      req.user.full_name,
      req.user.role,
      'News',
      String(id),
      `Updated news article: "${title.trim()}"`
    );

    const updated = db.prepare('SELECT * FROM news_articles WHERE id = ?').get(id);
    return res.json({ success: true, message: 'Article updated successfully!', article: updated });
  } catch (error) {
    console.error('Error updating news article:', error);
    return res.status(500).json({ success: false, message: 'Failed to update article: ' + error.message });
  }
});

// Admin: Delete news article
router.delete('/:id', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM news_articles WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    db.prepare('DELETE FROM news_articles WHERE id = ?').run(id);

    logAudit(
      'NEWS_DELETED',
      req.user.full_name,
      req.user.role,
      'News',
      String(id),
      `Deleted news article: "${existing.title}"`
    );

    return res.json({ success: true, message: 'Article deleted successfully.' });
  } catch (error) {
    console.error('Error deleting news article:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete article: ' + error.message });
  }
});

module.exports = router;
