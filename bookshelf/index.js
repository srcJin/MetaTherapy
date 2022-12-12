// setup bookshelf
// note: require('knex') will return a function

// const configureKnex = require('knex')
// configureKnex({....})

// create knex first because bookshelf needs it
const knex = require('knex')({
    'client':'mysql',
    'connection':{
        'user':'foo',
        'password':'bar',
        'database':'organic'
    }
})

// create bookshelf
const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;