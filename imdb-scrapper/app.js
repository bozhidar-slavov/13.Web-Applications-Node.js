/* globals console require Promise */
'use strict';

const listMoviesUrl =  'http://www.imdb.com/search/title?genres=fantasy&title_type=feature&sort=moviemeter,asc&page=1&view=simple&ref_=adv_nxt';

const httpRequester = require('./utils/http-requester');
const htmlParser = require('./utils/html-parser');
const queuesFactory = require('./data-structures/queue');
const modelsFactory = require('./models');
const constants = require('./config/constants');

require('./config/mongoose')(constants.connectionString);

let urlsQueue = queuesFactory.getQueue();

function wait(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

constants.genres.forEach(genre => {
    for (let i = 0; i < constants.pagesCount; i += 1) {
        let url = `http://www.imdb.com/search/title?genres=${genre}&title_type=feature&sort=moviemeter,asc&page=${i+1}&view=simple&ref_=adv_nxt`;
        urlsQueue.push(url);
    }
});

function getMoviesFromUrl(url) {
    console.log(url);
    httpRequester.get(url)
        .then((result) => {
            const selector = '.col-title span [title] a';
            const html = result.body;
            return htmlParser.parseSimpleMovie(selector, html);
        })
        .then(movies => {
            let dbMovies = movies.map(movie => {
                return modelsFactory.getSimpleMovie(movie.title, movie.url);
            });

            modelsFactory.insertManySimpleMovies(dbMovies);
            return wait(500);
        })
        .then(() => {
            if (urlsQueue.isEmpty()) {
                return;
            }

            getMoviesFromUrl(urlsQueue.pop());
        })
        .catch((err) => {
            console.dir(err);
        });
}

const asyncPagesCount = 5;

Array.from({ length: asyncPagesCount })
    .forEach(_ => getMoviesFromUrl(urlsQueue.pop()));


