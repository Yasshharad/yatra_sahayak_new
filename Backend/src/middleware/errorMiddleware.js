const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);

    // Custom error handling based on the error status or message
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error'
        }
    });
};

module.exports = errorMiddleware;
