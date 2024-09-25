import  yup from 'yup';

export const defaultErrorResponse = yup.object().shape({
  error: yup.string(),
  statusCode: yup.number(),
  message: yup.string(),
});
