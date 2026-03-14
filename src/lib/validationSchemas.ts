import * as Yup from 'yup';

export const AddProduceSchema = Yup.object({
  name: Yup.string().required(),
  type: Yup.string().required(),
  location: Yup.string().required(),
  storage: Yup.string().required(),
  quantity: Yup.number().positive().required(),
  unit: Yup.string().required(),
  expiration: Yup.date()
    .nullable()
    .transform((curr: Date | null, orig: string) => (orig === '' ? null : curr))
    .notRequired(),
  owner: Yup.string().required(),
  image: Yup.string().nullable().notRequired(),
  restockThreshold: Yup.number()
    .nullable()
    .transform((curr, orig) => (orig === '' ? null : curr))
    .min(0, 'Threshold cannot be negative')
    .notRequired(),
});

export const EditProduceSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string().required(),
  type: Yup.string().required(),
  location: Yup.string().required(),
  storage: Yup.string().required(),
  quantity: Yup.number().positive().required(),
  unit: Yup.string().required(),
  expiration: Yup.date()
    .nullable()
    .transform((curr: Date | null, orig: string) => (orig === '' ? null : curr))
    .notRequired(),
  owner: Yup.string().required(),
  image: Yup.string().nullable().notRequired(),

  restockThreshold: Yup.number()
    .nullable()
    .transform((curr, orig) => (orig === '' ? null : curr))
    .min(0, 'Threshold cannot be negative')
    .notRequired(),
});

export const AddLocationSchema = Yup.object({
  name: Yup.string().required('Location name is required'),
  owner: Yup.string().required('Owner is required'),
});

export const AddShoppingListSchema = Yup.object({
  name: Yup.string().required('List name is required'),
  owner: Yup.string()
    .required('You must be signed in to create a list')
    .min(1),
});

export const EditShoppingListSchema = Yup.object({
  id: Yup.number().required('ID is required'),
  name: Yup.string().required('List name is required'),
  owner: Yup.string().required('Owner is required'),
});

export const AddShoppingListItemSchema = Yup.object({
  name: Yup.string().required(),
  quantity: Yup.number().required(),
  unit: Yup.string().optional(),
  type: Yup.string().optional(),
  price: Yup.number().nullable().optional(),
  shoppingListId: Yup.number().required(),
});

export const EditShoppingListItemSchema = Yup.object({
  id: Yup.number().required('ID is required'),
  name: Yup.string().required('Item name is required'),
  quantity: Yup.number().positive('Quantity must be positive').required('Quantity is required'),
  unit: Yup.string().nullable().notRequired(),
  price: Yup.number()
    .nullable()
    .transform((curr, orig) => (orig === '' ? null : curr))
    .min(0, 'Price cannot be negative')
    .notRequired(),
  restockTrigger: Yup.string().nullable().notRequired(),
  customThreshold: Yup.number()
    .nullable()
    .transform((curr, orig) => (orig === '' ? null : curr))
    .min(0, 'Threshold cannot be negative')
    .notRequired(),
});
