const async = require('async');
const request = require('superagent');

const monet = require('monet');
const Either = monet.Either;
const bluebird = require('bluebird');
require('../../lib/database-helper.js')(bluebird, monet);

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
      courses => res.status(200).json(courses.toArray())
    )
  );
};

/**
 * POST /course/users
 * Get a course's users.
 */
exports.postCourseUsers = (req, res) => {
  const course = req.body.course;
  courseDao.getPeopleByCourse(course).tap(result =>
    result.cata(
      err => res.status(401).json(err),
      people => res.status(200).json(people.toArray())
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

function getSchedule(username, password) {
  return request.get('https://api-dev.purdue.io/Student/Schedule')
    .auth(username, password)
    .then(
      res => Either.Right(res.body),
      err => Either.Left('Your Purdue credentials are invalid. Please try again.')
    );
}

function getCourseIds(sectionIds) {
  const filterBySectionId = sectionIds.map(id => `SectionId eq ${id}`).join(' or ');
  return request.get('https://api.purdue.io/odata/Sections')
    .query({
      $filter: filterBySectionId,
      $expand: 'Class($expand=Course)'
    })
    .then(
      res => Either.Right(res.body.value.map(found => found.Class.Course.CourseId)),
      err => Either.Left('Error finding course id from section id.')
    );
}

/**
 * POST /courses/sync
 * Sync a user's courses using their Purdue credentials.
 */
exports.postCoursesSyncUser = async (req, res) => {
  const person = req.body.user;
  const username = req.body.username.replace('@purdue.edu', '');
  const password = req.body.password;

  const schedule = await getSchedule(username, password);
  const currentTerm = schedule.flatMap(enrollment =>
    Object.keys(enrollment).list().headMaybe().toEither('Current term was not found.')
  );
  const sectionIds = currentTerm.flatMap(term =>
    Either.Right(schedule.right()[term])
  );
  const courseIds = await sectionIds.flatMap(
    ids => getCourseIds(ids)
  );
  const nonEmptyCourseIds = courseIds.flatMap(ids =>
    ids.length > 0 ?
      Either.Right(ids) :
      Either.Left('No courses found.')
  );
  const bulkInsertion = await nonEmptyCourseIds.flatMap(
    ids => courseDao.addPersonBulk(ids, person)
  );
  const courseList = await bulkInsertion.flatMap(
    ids => courseDao.findByPerson(person)
  );
  courseList.cata(
    err => res.status(401).json(err),
    list => res.status(200).json(list.toArray())
  );
};
