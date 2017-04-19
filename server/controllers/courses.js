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
  courseDao.findPeopleByCourse(course).tap(result =>
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

/**
 * POST /courses/sync
 * Sync a user's courses using their Purdue credentials.
 */
exports.postCoursesSyncUser = (req, res) => {
  const person = new models.Person(req.body.user);
  const username = req.body.username.replace('@purdue.edu', '');
  const password = req.body.password;
  const encodedString = Buffer.from(`${username}:${password}`).toString('base64');

  request
  .get('https://api-dev.purdue.io/Student/Schedule')
  .auth(username, password)
  .then((res1) => {
    const term = 'spring 2017';
    const courses = res1.body[term];
    async.each(courses, ((sectionId, callback) => {
      request
      .get('https://api.purdue.io/odata/Sections')
      .query({
        $filter: `SectionId eq ${sectionId}`,
        $expand: 'Class($expand=Course)'
      })
      .then((res2) => {
        const course = {
          id: res2.body.value[0].Class.Course.CourseId
        };
        courseDao.addPerson(course, person).tap(result =>
          result.cata(
            err => callback(err),
            () => callback(null)
          )
        );
      })
      .catch((err) => {
        callback(err);
      });
    }), ((err) => {
      // If error
      if (err) {
        req.flash('error', 'A database error occured. Please try again.');
        return res.status(401).json('A database error occured. Please try again.');
      }
      // If success
      req.flash('success', 'Your Purdue courses have been added successfully.');
      courseDao.findByPerson(person).tap(result =>
        result.cata(
          err1 => res.status(401).json(err1),
          courses1 => res.status(200).json(courses1.toArray())
        )
      );
    }));
  })
  .catch(err => res.status(401).json('Your Purdue credentials are invalid. Please try again.'));
};
