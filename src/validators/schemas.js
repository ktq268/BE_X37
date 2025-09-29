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

export const bookingCreateSchema = yup.object({
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
  adults: yup.number().integer().min(0).default(0).required(),
  children: yup.number().integer().min(0).default(0).required(),
  note: yup.string().trim().optional(),
  customerName: yup.string().trim().required(),
  customerPhone: yup.string().trim().required(),
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
