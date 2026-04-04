import { mixed, number, object, string, type InferType } from 'yup';

export const AddBookSchema = object({
  restorePreviousCurriculum: string().oneOf(['yes', 'no']).default('no'),
  lkSchoolStageId: string()
    .required('books.validation.gradeRequired')
    .typeError('books.validation.gradeRequired'),
  materialId: string()
    .required('books.validation.subjectRequired')
    .typeError('books.validation.subjectRequired'),
  name: string()
    .required('books.validation.bookNameRequired')
    .typeError('books.validation.bookNameRequired')
    .matches(/^[\u0600-\u06FF\s\d\p{P}]+$/u, 'books.validation.bookNameArInvalid'),
  nameEn: string()
    .required('books.validation.bookNameEnRequired')
    .typeError('books.validation.bookNameEnRequired')
    .matches(/^[a-zA-Z\s\d\p{P}]+$/u, 'books.validation.bookNameEnInvalid'),
  code: string()
    .required('books.validation.bookCodeRequired')
    .typeError('books.validation.bookCodeRequired'),
  packageType: string()
    .oneOf(['1', '2'], 'books.validation.packageTypeRequired')
    .required('books.validation.packageTypeRequired'),
  setQuantity: number().when('packageType', {
    is: '2',
    then: (schema) =>
      schema
        .required('books.validation.setQuantityRequired')
        .positive('books.validation.setQuantityMustBePositive')
        .integer('books.validation.setQuantityMustBeInteger'),
    otherwise: (schema) => schema.optional(),
  }),
  priceView: string()
    .oneOf(['1', '2'])
    .when('packageType', {
      is: '2',
      then: (schema) => schema.required('books.validation.priceViewRequired'),
      otherwise: (schema) => schema.optional(),
    }),
  quantity: number()
    .required('books.validation.quantityRequired')
    .positive('books.validation.quantityMustBePositive')
    .integer('books.validation.quantityMustBeInteger')
    .typeError('books.validation.quantityRequired'),
  price: number()
    .required('books.validation.priceRequired')
    .positive('books.validation.priceMustBePositive')
    .typeError('books.validation.priceRequired'),
  image: mixed().optional(),
});

export const EditBookSchema = object({
  lkSchoolStageId: string()
    .required('books.validation.gradeRequired')
    .typeError('books.validation.gradeRequired'),
  materialId: string()
    .required('books.validation.subjectRequired')
    .typeError('books.validation.subjectRequired'),
  name: string()
    .required('books.validation.bookNameRequired')
    .typeError('books.validation.bookNameRequired')
    .matches(/^[\u0600-\u06FF\s\d\p{P}]+$/u, 'books.validation.bookNameArInvalid'),
  nameEn: string()
    .required('books.validation.bookNameEnRequired')
    .typeError('books.validation.bookNameEnRequired')
    .matches(/^[a-zA-Z\s\d\p{P}]+$/u, 'books.validation.bookNameEnInvalid'),
  code: string()
    .required('books.validation.bookCodeRequired')
    .typeError('books.validation.bookCodeRequired'),
  packageType: string()
    .oneOf(['1', '2'], 'books.validation.packageTypeRequired')
    .required('books.validation.packageTypeRequired'),
  setQuantity: number().when('packageType', {
    is: '2',
    then: (schema) =>
      schema
        .required('books.validation.setQuantityRequired')
        .positive('books.validation.setQuantityMustBePositive')
        .integer('books.validation.setQuantityMustBeInteger'),
    otherwise: (schema) => schema.optional(),
  }),
  priceView: string()
    .oneOf(['1', '2'])
    .when('packageType', {
      is: '2',
      then: (schema) => schema.required('books.validation.priceViewRequired'),
      otherwise: (schema) => schema.optional(),
    }),
  quantity: number()
    .required('books.validation.quantityRequired')
    .positive('books.validation.quantityMustBePositive')
    .integer('books.validation.quantityMustBeInteger')
    .typeError('books.validation.quantityRequired'),
  price: number()
    .required('books.validation.priceRequired')
    .positive('books.validation.priceMustBePositive')
    .typeError('books.validation.priceRequired'),
  image: mixed().optional(),
});

export type AddBookProps = InferType<typeof AddBookSchema>;
export type EditBookProps = InferType<typeof EditBookSchema>;
