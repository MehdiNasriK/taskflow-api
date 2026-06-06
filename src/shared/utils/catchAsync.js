export default function async(cb) {
  return (req, res, next) => {
    cb(req, res, next).catch(next);
  };
}
