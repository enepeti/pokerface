var config = {
    debug: process.env.NODE_ENV == "production" ? false : true,
    listen: "0.0.0.0",
    port: 8000,
    console_date_format: "YYYY-MM-DD HH:mm:ss",
    logrequests: true,
    mongo: {
        path: "mongodb://localhost/pokerarc",
    },
    timeout: 4000,
    weights: [10,20,30,40,50],
    questionCounts: [2, 5, 5, 5, 5]
};
module.exports = config;
