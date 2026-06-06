export default function async(err, req, res, next) {
  res.json({
    message: err.message,
    stack: err.stack,
    err,
  });
}
