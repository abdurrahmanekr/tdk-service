const NE = require('node-exceptions');

const ErrorService = {
    badRequest: (res, message) => {
        const err = new NE.HttpException(message, 400);

        res.send({
            error: true,
            message: err.message,
        });
    },
};

module.exports = ErrorService;
