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
  models.Course.findOne({
    where: {
      title: req.body.title
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
