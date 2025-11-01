import * as yup from "yup";

export const restaurantCreateSchema = yup.object({
  name: yup.string().trim().required(),
  region: yup.string().oneOf(["north", "central", "south"]).required(),
  address: yup.string().trim().required(),
});

export const restaurantUpdateSchema = yup.object({
  name: yup.string().trim().optional(),
  region: yup.string().oneOf(["north", "central", "south"]).optional(),
  address: yup.string().trim().optional(),
});

export const tableCreateSchema = yup.object({
  restaurantId: yup.string().trim().required(),
  tableNumber: yup.number().integer().min(1).required(),
  capacity: yup.number().integer().min(1).required(),
  type: yup.string().oneOf(["vip", "normal"]).optional(),
});

export const tableUpdateSchema = yup.object({
  tableNumber: yup.number().integer().min(1).optional(),
  capacity: yup.number().integer().min(1).optional(),
  type: yup.string().oneOf(["vip", "normal"]).optional(),
});

export const tableStatusUpdateSchema = yup.object({
  status: yup
    .string()
    .oneOf(["available", "reserved", "occupied", "blocked"])
    .required(),
});

export const bookingCreateSchema = yup.object({
  restaurantId: yup.string().trim().required(),
  tableId: yup.string().trim().optional(), // Không bắt buộc
  date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  time: yup
    .string()
    .matches(/^\d{2}:\d{2}$/)
    .required(),
  adults: yup.number().integer().min(0).default(0).required(),
  children: yup.number().integer().min(0).default(0).required(),
  note: yup.string().trim().optional(),
  customerName: yup.string().trim().required(),
  customerPhone: yup.string().trim().required(),
  customerEmail: yup.string().trim().email().required(),
});

export const bookingStatusUpdateSchema = yup.object({
  status: yup
    .string()
    .oneOf([
      "pending",
      "confirmed",
      "seated",
      "completed",
      "cancelled",
      "no_show",
    ])
    .required(),
  tableId: yup.string().trim().optional(),
});

export const tableBlockCreateSchema = yup.object({
  restaurantId: yup.string().trim().required(),
  tableId: yup.string().trim().required(),
  date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  time: yup
    .string()
    .matches(/^\d{2}:\d{2}$/)
    .required(),
  reason: yup.string().trim().required(),
});

export const availableQuerySchema = yup.object({
  region: yup.string().oneOf(["north", "central", "south"]).required(),
  restaurantId: yup.string().trim().optional(),
  date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  time: yup
    .string()
    .matches(/^\d{2}:\d{2}$/)
    .required(),
  adults: yup
    .number()
    .transform((v, o) => (o === "" || o === undefined ? undefined : Number(o)))
    .integer()
    .min(0)
    .default(0),
  children: yup
    .number()
    .transform((v, o) => (o === "" || o === undefined ? undefined : Number(o)))
    .integer()
    .min(0)
    .default(0),
});

// Global menu validators
export const menuPublicListQuerySchema = yup.object({
  category: yup.string().trim().optional(),
  q: yup.string().trim().optional(),
  page: yup
    .number()
    .transform((v, o) => (o === "" || o === undefined ? undefined : Number(o)))
    .integer()
    .min(1)
    .default(1),
  limit: yup
    .number()
    .transform((v, o) => (o === "" || o === undefined ? undefined : Number(o)))
    .integer()
    .min(1)
    .max(100)
    .default(20),
});

export const menuDetailParamSchema = yup.object({
  id: yup.string().trim().required(),
});

export const menuCreateSchema = yup.object({
  name: yup.string().trim().required(),
  description: yup.string().trim().optional(),
  price: yup.number().min(0).required(),
  category: yup.string().trim().required(),
  imageUrl: yup.array().of(yup.string().trim().url()).optional(),
  isAvailable: yup.boolean().optional(),
});

export const menuUpdateSchema = yup.object({
  name: yup.string().optional(),
  description: yup.string().optional(),
  price: yup.number().min(0).optional(),
  category: yup.string().optional(),
  imageUrl: yup.array().of(yup.string().url()).optional(),
  isAvailable: yup.boolean().optional(),
});

export const menuFullListQuerySchema = yup.object({
  page: yup
    .number()
    .transform((v, o) => (o === "" || o === undefined ? undefined : Number(o)))
    .integer()
    .min(1)
    .default(1),
  limit: yup
    .number()
    .transform((v, o) => (o === "" || o === undefined ? undefined : Number(o)))
    .integer()
    .min(1)
    .max(9)
    .default(9),
});

// Cart & Order validators
export const cartAddItemSchema = yup.object({
  menuItemId: yup.string().trim().required(),
  quantity: yup
    .number()
    .transform((v, o) => (o === "" || o === undefined ? undefined : Number(o)))
    .integer()
    .min(1)
    .default(1),
  notes: yup.string().trim().optional(),
});

export const cartUpdateItemSchema = yup.object({
  quantity: yup
    .number()
    .transform((v, o) => (o === "" || o === undefined ? undefined : Number(o)))
    .integer()
    .min(1)
    .required(),
  notes: yup.string().trim().optional(),
});

export const orderCreateFromCartSchema = yup.object({
  restaurantId: yup.string().trim().required(),
  restaurantName: yup.string().trim().optional(),
  customerName: yup.string().trim().optional(),
  tableNumber: yup.string().trim().optional(),
  region: yup.string().oneOf(["north", "central", "south"]).optional(),
  applyDiscount: yup
    .number()
    .transform((v, o) => (o === "" || o === undefined ? undefined : Number(o)))
    .min(0)
    .default(0),
});

// Staff orders
export const staffOrderListQuerySchema = yup.object({
  status: yup
    .string()
    .oneOf([
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ])
    .optional(),
  q: yup.string().trim().optional(),
  page: yup
    .number()
    .transform((v, o) => (o === "" || o === undefined ? undefined : Number(o)))
    .integer()
    .min(1)
    .default(1),
  limit: yup
    .number()
    .transform((v, o) => (o === "" || o === undefined ? undefined : Number(o)))
    .integer()
    .min(1)
    .max(100)
    .default(20),
});

export const staffOrderStatusUpdateSchema = yup.object({
  status: yup
    .string()
    .oneOf([
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ])
    .required(),
});
