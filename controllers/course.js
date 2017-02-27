const async = require('async');
const request = require('superagent');
const models = require('../models');

/**
 * GET /courses
 * Course page.
 */
exports.getCourses = (req, res) => {
  models.Course.findAll({
    include: [{
      model: models.User,
      where: {
        id: req.user.dataValues.id
      }
    }]
  }).then((courses) => {
    courses = courses.map((course) => {
      return course.dataValues;
    });
    return res.render('courses/index', {
      title: 'Courses',
      courses
    });
  });
};

/**
 * POST /courses/
 * Add a course.
 */
exports.postAddCourse = (req, res) => {
  const courseId = req.body.courseId;
  models.Course.findOne({
    where: {
      id: courseId
    }
  }).then((course) => {
    req.user.addCourse(course);
    return res.redirect('/courses');
  });
};

/**
 * POST /courses/remove/:course
 * Remove a course.
 */
exports.postRemoveCourse = (req, res) => {
  const courseId = req.params.id;
  models.Course.findById(courseId).then((course) => {
    if (!course) {
      return res.redirect('/courses');
    }
    req.user.removeCourse(course);
    return res.redirect('/courses');
  });
};

/**
 * POST /courses/auth
 * Authenticate with Purdue and add courses.
 */
exports.postAuthCourses = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const encodedString = Buffer.from(`${username}:${password}`).toString('base64');

  request
    .get('https://api-dev.purdue.io/Student/Schedule')
    .auth(username, password)
    .then((res2) => {
      const term = 'spring 2017';
      const courses = res2.body[term];
      console.log(courses);
      async.each(courses, ((courseID, callback2) => {
        request
          .get('https://api.purdue.io/odata/Sections')
          .query({
            $filter: `SectionId eq ${courseID}`,
            $expand: 'Class($expand=Course)'
          })
          .then((res3) => {
            const section = res3.body.value[0];
            const _class = section.Class;
            const course = _class.Course;
            models.Course.findOne({
              where: {
                id: course.CourseId
              }
            }).then((_course) => {
              req.user.addCourse(_course);
              callback2(null);
            }).catch((err) => {
              callback2(err);
            });
          })
          .catch((err) => {
            callback2(err);
          });
      }), ((err) => {
        // If error
        if (err) {
          return next(err);
        }
        // If success
        req.session.save(() => {
          return res.redirect('/courses');
        });
      }));
    });
};
