import APIError from "../utilities/APIError.js";

const errorHandler = (err, req, res, next) => {
    console.log(err)
    if (err instanceof APIError) {

        return res
            .status(err.status)
            .json({
                status: err.status,
                message: err.message,
                code: err.code,
                serverData: err.serverData,
                success: err.success,
                timestamp: err.timestamp
            })
    }

    return res.status(500).json({
        success: false,
        status: 500,
        message: "Something went wrong, please try again later",
        code: "SERVER_ERROR",
        timestamp: new Date().toISOString()
    });
}

export default errorHandler;
