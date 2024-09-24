import { FastifySchema, FastifySchemaCompiler } from 'fastify';
import { Schema, ValidateOptions } from 'yup';
import { FastifySerializerCompiler } from 'fastify/types/schema.js';

const yupOptions: ValidateOptions = {
  strict: false,
  abortEarly: false,
  stripUnknown: true,
  recursive: true,
};
/**
 * Validator compiler for schama done with yup
 *
 * Usage:
 * ```typescript
 *   fastify = Fastify();
 *   fastify.setValidatorCompiler(validatorCompiler);
 *   fastify.setSerializerCompiler(serializerCompiler);
 * ```
 */
export const validatorCompiler: FastifySchemaCompiler<
  NoInfer<FastifySchema>
> = ({ schema }) => {
  return function (data) {
    try {
      const value = (schema as Schema).validateSync(data, yupOptions);
      return { value };
    } catch (e) {
      return { error: e as Error };
    }
  };
};

export const serializerCompiler: FastifySerializerCompiler<Schema> = ({
  schema,
}) => {
  return (data: unknown) => {
    try {
      const result = schema.validateSync(data, yupOptions);
      return JSON.stringify(result);
    } catch (e) {
      return JSON.stringify({ error: e as Error });
    }
  };
};
