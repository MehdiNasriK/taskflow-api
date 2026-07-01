export default function async(cb) {
  return (req, res, next) => {
    return cb(req, res, next).catch(next);
  };
}
