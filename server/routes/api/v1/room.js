const router = require('express').Router()

const authenticate = require('../../../middlewares/authenticate')
const Room = require('../../../models/Room.js')
const User = require('../../../models/User')

router.use(authenticate)

router.get('/:roomId/', (req, res, next) => {
  const roomId = req.params.roomId
  Room.findById(roomId, (err, room) => {
    if (err) {
      return next(err)
    }
    if (!room) {
      res.status(404).json({ error: 'room not found' })
    } else {
      User.find(
        { username: { $in: room.members } },
        'username lastPosition',
        (err, users) => {
          if (err) {
            return next(err)
          }
          const cleanerRoom = {
            id: room._id,
            title: room.title,
            createBy: room.createBy,
            createAt: room.createAt,
            members: users,
            messages: room.messages,
          }
          res.json(cleanerRoom)
        }
      )
    }
  })
})

router.post('/:roomId/members', (req, res, next) => {
  const roomId = req.params.roomId
  const newMember = req.body.username

  Room.findById(roomId, (err, room) => {
    if (err) {
      return next(err)
    }
    if (!room) {
      res.status(404).json({ error: 'room not found' })
    } else {
      room.members.push(newMember)
      room
        .save()
        .then(() => res.json({ success: true }))
        .catch(err => {
          next(err)
        })
    }
  })
})

module.exports = router
