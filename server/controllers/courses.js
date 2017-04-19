const async = require('async');
const request = require('superagent');

const models = require('../models');
const courseDao = require('../dao/course')(models);

/**
 * POST /courses
 * Get a user's courses.
 */
exports.postCourses = (req, res) => {
  const person = new models.Person(req.body.user);
  courseDao.findByPerson(person).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      courses => res.status(200).json(courses)
    )
  );
};

/**
 * POST /course/add
 * Add a user to a course.
 */
exports.postCourseAddUser = (req, res) => {
  const course = req.body.course;
  const person = new models.Person(req.body.user);
  courseDao.addPerson(course, person).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      () => res.status(200).json(true)
    )
  );
};

/**
 * POST /course/remove
 * Remove a user from a course.
 */
exports.postCourseRemoveUser = (req, res) => {
  const course = req.body.course;
  const person = new models.Person(req.body.user);
  courseDao.removePerson(course, person).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      () => res.status(200).json(true)
    )
  );
};

/**
 * POST /course/sync
 * Sync a user's courses using their Purdue credentials.
 */
exports.postCourseSyncUser = (req, res) => {
  const course = req.body.course;
  const username = req.body.username;
  const password = req.body.password;
};
