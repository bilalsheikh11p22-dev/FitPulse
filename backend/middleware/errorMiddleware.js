const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  if (err.type === 'entity.parse.failed') statusCode = 400; // malformed JSON body
  if (err.type === 'entity.too.large') statusCode = 413; // upload over the size limit
  if (err.name === 'ValidationError' || err.name === 'CastError') statusCode = 400;
  res.status(statusCode);
  res.json({
    message: statusCode === 413 ? 'File is too large. The maximum size is 4 MB.' : statusCode === 500 && process.env.NODE_ENV === 'production' ? 'Server error' : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
