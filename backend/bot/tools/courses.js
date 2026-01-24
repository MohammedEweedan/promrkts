const { getPrisma } = require('../config/prisma');

/**
 * Fetch course/tier listings from the database
 * Returns real data so the bot can answer questions about offerings
 */
async function get_courses({ filter, limit = 10 }) {
  try {
    const prisma = getPrisma();
    const where = {};
    
    // Optional filters
    if (filter?.level) {
      where.level = filter.level; // e.g., 'beginner', 'intermediate', 'advanced'
    }
    if (filter?.tier) {
      where.tier = filter.tier; // e.g., 'Free', 'Standard', 'Premium', 'VIP'
    }

    const courses = await prisma.tier.findMany({
      where,
      take: Math.min(limit, 20),
      select: {
        id: true,
        title: true,
        description: true,
        tier: true,
        level: true,
        price: true,
        currency: true,
        duration: true,
        features: true,
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      ok: true,
      count: courses.length,
      courses: courses.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        tier: c.tier,
        level: c.level,
        price: c.price,
        currency: c.currency || 'USD',
        duration: c.duration,
        features: c.features || [],
        enrollments: c._count.enrollments
      }))
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get details of a specific course by ID
 */
async function get_course_detail({ courseId }) {
  try {
    const prisma = getPrisma();
    const course = await prisma.tier.findUnique({
      where: { id: parseInt(courseId) },
      include: {
        resources: {
          select: {
            id: true,
            title: true,
            type: true,
            order: true
          },
          orderBy: { order: 'asc' }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: { name: true }
            }
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { enrollments: true }
        }
      }
    });

    if (!course) {
      return { ok: false, error: 'Course not found' };
    }

    return {
      ok: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        tier: course.tier,
        level: course.level,
        price: course.price,
        currency: course.currency || 'USD',
        duration: course.duration,
        features: course.features || [],
        resources: course.resources.map(r => ({
          id: r.id,
          title: r.title,
          type: r.type
        })),
        reviews: course.reviews.map(r => ({
          rating: r.rating,
          comment: r.comment,
          author: r.user?.name || 'Anonymous',
          date: r.createdAt
        })),
        enrollments: course._count.enrollments
      }
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { get_courses, get_course_detail };
