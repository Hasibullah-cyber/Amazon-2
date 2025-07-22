// app/api/categories/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// Simple slugify helper (lowercase, spaces to dashes, remove non-alphanum except dash)
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars except dash
    .replace(/\-\-+/g, '-')     // Replace multiple - with single -
}

// GET all categories with nested subcategories including slug
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'slug', s.slug,
              'description', s.description,
              'category_id', s.category_id
            ) ORDER BY s.name
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS subcategories
      FROM categories c
      LEFT JOIN subcategories s ON s.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST add new category, auto-generating slug
export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 })
    }

    const slug = slugify(name)

    // Insert category with slug
    const insertResult = await pool.query(
      `INSERT INTO categories (name, description, slug) VALUES ($1, $2, $3) RETURNING *`,
      [name, description, slug]
    )

    return NextResponse.json(insertResult.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error adding category:', error)
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 })
  }
}
