var config = {
    debug: process.env.NODE_ENV == "production" ? false : true,
    listen: "0.0.0.0",
    port: 8000,
    console_date_format: "YYYY-MM-DD HH:mm:ss",
    logrequests: true,
    mongo: {
        path: "mongodb://localhost/pokerarc",
    },
    timeout: 5000,
    weights: [10,10,10,10,10],
    questionCounts: [8, 5, 5, 5, 5]
};
module.exports = config;
