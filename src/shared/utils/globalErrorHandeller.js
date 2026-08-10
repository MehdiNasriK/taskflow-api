export default function async(err, req, res, next) {
  let statusCode = err.statusCode || 500
  let message = err.message || "Internal server Error"
  let status = err.status || "fail"

  if(err.code === "P2002"){
    statusCode = 409
    message = "username already exist."
  }
  if(err.code === "P2025") {
    statusCode = 404,
    message = "not found"
  }
  if(err.message === "jwt expired"){
    statusCode = 401
    message = "Your session has expired. Please login again."
  }
  if(err.message === "invalid token"){
    statusCode = 401
    message = "Your session is invalid. Please login again."
  }
  if(process.env.NODE_ENV === "production"){
    return res.status(statusCode).json({
      status,
      message
    })
  }

  return res.status(statusCode).json({
      message,
      status,
      stack: err.stack,
      error: err
    })
}
