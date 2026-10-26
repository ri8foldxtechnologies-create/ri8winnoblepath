const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticate, authorize, optionalAuth, logAudit } = require('../auth');

// Public: Get all published custom pages (for navigation & links)
router.get('/', (req, res) => {
  const pages = db.prepare(`
    SELECT id, title, slug, meta_description, banner_image, show_in_navbar, navbar_order, status, created_at, updated_at
    FROM custom_pages
    WHERE status = 'Published'
    ORDER BY navbar_order ASC, id ASC
  `).all();

  return res.json({ success: true, pages });
});

// Admin: Get all custom pages (including drafts)
router.get('/admin/all', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  const pages = db.prepare('SELECT * FROM custom_pages ORDER BY id DESC').all();
  return res.json({ success: true, pages });
});

// Public: Get single custom page by slug
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const page = db.prepare('SELECT * FROM custom_pages WHERE slug = ?').get(slug);

  if (!page) {
    return res.status(404).json({ success: false, message: 'Webpage not found.' });
  }

  return res.json({ success: true, page });
});

// Admin: Create new webpage
router.post('/', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  try {
    const {
      title,
      slug,
      meta_description = '',
      content,
      banner_image = '',
      show_in_navbar = 1,
      navbar_order = 1,
      status = 'Published'
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Page title is required.' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Page content is required.' });
    }

    let cleanSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = db.prepare('SELECT id FROM custom_pages WHERE slug = ?').get(cleanSlug);
    if (existing) {
      cleanSlug += '-' + Math.floor(100 + Math.random() * 900);
    }

    const insert = db.prepare(`
      INSERT INTO custom_pages (
        title, slug, meta_description, content, banner_image, show_in_navbar, navbar_order, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      title.trim(),
      cleanSlug,
      meta_description.trim(),
      content.trim(),
      banner_image.trim(),
      Number(show_in_navbar) ? 1 : 0,
      Number(navbar_order) || 1,
      status || 'Published'
    );

    logAudit(
      'PAGE_CREATED',
      req.user.full_name,
      req.user.role,
      'Pages',
      String(result.lastInsertRowid),
      `Created custom webpage: "${title.trim()}" (slug: ${cleanSlug})`
    );

    const created = db.prepare('SELECT * FROM custom_pages WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, message: 'Webpage created successfully!', page: created });
  } catch (error) {
    console.error('Error creating custom webpage:', error);
    return res.status(500).json({ success: false, message: 'Failed to create page: ' + error.message });
  }
});

// Admin: Update custom webpage
router.put('/:id', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM custom_pages WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Page not found.' });
    }

    const {
      title = existing.title,
      slug = existing.slug,
      meta_description = existing.meta_description,
      content = existing.content,
      banner_image = existing.banner_image,
      show_in_navbar = existing.show_in_navbar,
      navbar_order = existing.navbar_order,
      status = existing.status
    } = req.body;

    const update = db.prepare(`
      UPDATE custom_pages SET
        title = ?,
        slug = ?,
        meta_description = ?,
        content = ?,
        banner_image = ?,
        show_in_navbar = ?,
        navbar_order = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    update.run(
      title.trim(),
      slug.trim(),
      meta_description.trim(),
      content.trim(),
      banner_image.trim(),
      Number(show_in_navbar) ? 1 : 0,
      Number(navbar_order) || 1,
      status || 'Published',
      id
    );

    logAudit(
      'PAGE_UPDATED',
      req.user.full_name,
      req.user.role,
      'Pages',
      String(id),
      `Updated custom webpage: "${title.trim()}"`
    );

    const updated = db.prepare('SELECT * FROM custom_pages WHERE id = ?').get(id);
    return res.json({ success: true, message: 'Webpage updated successfully!', page: updated });
  } catch (error) {
    console.error('Error updating webpage:', error);
    return res.status(500).json({ success: false, message: 'Failed to update page: ' + error.message });
  }
});

// Admin: Delete custom webpage
router.delete('/:id', authenticate, authorize('super_admin', 'ngo_admin'), (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM custom_pages WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Page not found.' });
    }

    db.prepare('DELETE FROM custom_pages WHERE id = ?').run(id);

    logAudit(
      'PAGE_DELETED',
      req.user.full_name,
      req.user.role,
      'Pages',
      String(id),
      `Deleted custom webpage: "${existing.title}"`
    );

    return res.json({ success: true, message: 'Webpage deleted successfully.' });
  } catch (error) {
    console.error('Error deleting webpage:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete page: ' + error.message });
  }
});

module.exports = router;
