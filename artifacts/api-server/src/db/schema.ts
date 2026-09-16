import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(), // Using UUID or text for ID
  name: text('name').notNull(),
  category: text('category').notNull(),
  price: integer('price').notNull(),
  image: text('image').notNull(),
  alt: text('alt').notNull(),
  badge: text('badge'),
  description: text('description').notNull(),
  sizes: jsonb('sizes').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const wishlist = pgTable('wishlist', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  productId: text('product_id').references(() => products.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  productId: text('product_id').references(() => products.id).notNull(),
  size: text('size').notNull(),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  wishlist: many(wishlist),
  cartItems: many(cartItems),
}));

export const productsRelations = relations(products, ({ many }) => ({
  wishlistedBy: many(wishlist),
  inCarts: many(cartItems),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, {
    fields: [wishlist.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlist.productId],
    references: [products.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));
