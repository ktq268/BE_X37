import { ValidationError } from "yup";

export const validate =
  (schema, source = "body") =>
  async (req, res, next) => {
    try {
      const data = source === "query" ? req.query : req.body;
      const validated = await schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (source === "query") {
        // Avoid reassigning req.query (read-only getter in Express 5); mutate instead
        Object.keys(req.query || {}).forEach((k) => {
          // delete existing keys to not keep stale values
          delete req.query[k];
        });
        Object.assign(req.query, validated);
      } else {
        req.body = validated;
      }
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: err.inner?.length
            ? err.inner.map((e) => ({ path: e.path, message: e.message }))
            : [{ message: err.message }],
        });
      }
      next(err);
    }
  };
