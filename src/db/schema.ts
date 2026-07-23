import { pgTable, serial, text, timestamp, boolean, json, date } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: text('role').default('Admin'),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const news = pgTable('news', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  datePublished: date('date_published').notNull(),
  author: text('author').notNull(),
  featured: boolean('featured').default(false),
  featuredImage: text('featured_image'),
  images: json('images').default([]), // array of strings
  createdAt: timestamp('created_at').defaultNow(),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  iconImage: text('icon_image'),
  displayOrder: serial('display_order'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const hajj_umrah_packages = pgTable('hajj_umrah_packages', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  departureDate: date('departure_date'),
  featuredImage: text('featured_image'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const scholarships = pgTable('scholarships', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  deadline: date('deadline'),
  featuredImage: text('featured_image'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const subscribers = pgTable('subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  status: text('status').default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  subject: text('subject'),
  message: text('message').notNull(),
  status: text('status').default('Unread'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  author: text('author').notNull(),
  role: text('role'),
  content: text('content').notNull(),
  rating: text('rating').default('5'),
  avatarUrl: text('avatar_url'),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
