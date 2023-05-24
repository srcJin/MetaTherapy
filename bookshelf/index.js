// setup bookshelf
// note: require('knex') will return a function

// const configureKnex = require('knex')
// configureKnex({....})

// create knex first because bookshelf needs it
const knex = require('knex')({
    'client':process.env.DB_DRIVER,
    'connection':{
        'user': process.env.DB_USER,
        'password':process.env.DB_PASSWORD,
        'database':process.env.DB_DATABASE,
        'host': process.env.DB_HOST,
        // added for using render
        "ssl":"true"
    }
})

// create bookshelf
const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;