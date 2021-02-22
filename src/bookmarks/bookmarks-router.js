const express = require('express')
const store = require('../store')
const { v4: uuid } = require('uuid')
const logger = require('../logger')
const {validURL} = require('valid-url')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
    .route('/bookmarks')
    .get((req,res) => {
        res.json(store.bookmarks)
    })
    .post(bodyParser, (req,res) => {
        const { title, url, description, rating } = req.body
        if(!title){
            logger.error(`Title is required`);
            return res
                .status(400)
                .send('Invalid data');
        }
        if(!url){
            logger.error(`URL is required`);
            return res
                .status(400)
                .send('Invalid data');
        }
        if(!rating){
            logger.error(`Rating is required`);
            return res
                .status(400)
                .send('Invalid data');
        }
        if(!Number.isInteger(rating) || rating <0 || rating >5){
            logger.error(`The rating ${rating} is invalid`);
            return res
                .status(400)
                .send(`The rating should be a number between 0 and 5`);
        }
        if(!validURL(url)){
            logger.error(`Invalid url ${url}`)
            return res
                .status(400)    
                .send(`The url ${url} is invalid. Please provide a valid one.`)
        }
        const id = uuid();
        const newBookmark={
            id,
            title,
            url,
            description,
            rating
        }
        store.bookmarks.push(bookmark);
        logger.info(`Bookmark with id ${id} created`);
        res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(newBookmark);
    })

    bookmarksRouter
        .route('/bookmarks/:bookmarkId')
        .get((req,res) => {
            const {bookmarkID} = req.params
            const bookmark = store.bookmarks.find(bookmark => bookmark.id === bookmarkID)

            if(!bookmark){
                logger.error(`Bookmark with id &{bookmarkID} is not found`)
                return res  
                    .status(404)
                    .send('Bookmark Not Found')
            }

            res.json(bookmark);
        })
        .delete((req,res) => {
            const { bookmark_id } = req.params

            const bookmarkIndex = store.bookmarks.findIndex(b => b.id === bookmark_id)

            if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${bookmark_id} not found.`)
            return res
                .status(404)
                .send('Bookmark Not Found')
            }

            store.bookmarks.splice(bookmarkIndex, 1)

            logger.info(`Bookmark with id ${bookmark_id} deleted.`)
            res
            .status(204)
            .end()
        })

    module.exports = bookmarksRouter

    
