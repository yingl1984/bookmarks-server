const express = require('express')
const store = require('../store')
const { v4: uuid } = require('uuid')
const logger = require('../logger')
const {isWebUri} = require('valid-url')
const BookmarksService = require('./BookmarksService')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description,
    rating: Number(bookmark.rating),
  })

bookmarksRouter
    .route('/bookmarks')
    .get((req,res,next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    .post(bodyParser, (req,res) => {
        const { title, url, description, rating } = req.body
        if(!title){
            logger.error(`Title is required`);
            return res
                .status(400)
                .send('Title is required');
        }
        if(!url){
            logger.error(`URL is required`);
            return res
                .status(400)
                .send('URL is required');
        }
        if(!rating){
            logger.error(`Rating is required`);
            return res
                .status(400)
                .send('Rating is required');
        }
        if(!Number.isInteger(rating) || rating <0 || rating >5){
            logger.error(`The rating ${rating} is invalid`);
            return res
                .status(400)
                .send(`The rating should be a number between 0 and 5`);
        }
        if(!isWebUri(url)){
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
        store.bookmarks.push(newBookmark);
        logger.info(`Bookmark with id ${id} created`);
        res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(newBookmark);
    })

    bookmarksRouter
        .route('/bookmarks/:bookmark_id')
        .get((req,res,next) => {
            const { bookmark_id } = req.params
            const knexInstance = req.app.get('db')
            BookmarksService.getById(knexInstance, bookmark_id)
            .then(bookmark => {
                if (!bookmark) {
                  logger.error(`Bookmark with id ${bookmark_id} not found.`)
                  return res.status(404).json({
                    error: { message: `Bookmark Not Found` }
                  })
                }
                res.json(serializeBookmark(bookmark))
              })
              .catch(next)
        })
        .delete((req,res) => {
            const { id } = req.params

            const bookmarkIndex = store.bookmarks.findIndex(b => b.id === id)

            if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`)
            return res
                .status(404)
                .send('Bookmark Not Found')
            }

            store.bookmarks.splice(bookmarkIndex, 1)

            logger.info(`Bookmark with id ${id} deleted.`)
            res
            .status(204)
            .end()
        })

    module.exports = bookmarksRouter

    
