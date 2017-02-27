/**
 * Module dependencies.
 */
const async = require('async');
const dotenv = require('dotenv');
const request = require('superagent');
const algoliasearch = require('algoliasearch');
const readlineSync = require('readline-sync');
const chalk = require('chalk');
const models = require('../models');

/**
 * Load environment variables from .env file.
 */
dotenv.load({ path: '.env' });

// const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_ADMIN_KEY);
const client = algoliasearch(process.env.ALGOLIA_ID_OLD, process.env.ALGOLIA_ADMIN_KEY_OLD);

const subjectIndex = client.initIndex('subjects');
const courseIndex = client.initIndex('courses');

let failCount = 0;
let doUpdateDb = true;
let doUpdateAlgolia = true;

const prompt = (() => {
  const prompt1 = chalk.dim('Do you want to update the database with courses from Purdue.io? [y/n]: ');
  if (!readlineSync.keyInYNStrict(prompt1, { guide: false })) {
    doUpdateDb = false;
  }
  const prompt2 = chalk.dim('Do you want to update Algolia with courses from the database? [y/n]: ');
  if (!readlineSync.keyInYNStrict(prompt2, { guide: false })) {
    doUpdateAlgolia = false;
  }
});

const errorHandler = ((err) => {
  // By default, do nothing.
  // console.log(err);
});

const dbQueue = async.queue((subject, callback1) => {
  const subjectAbbr = subject.Abbreviation;
  request
    .get('https://api.purdue.io/odata/Courses')
    .query({ $filter: `Subject/Abbreviation eq '${subjectAbbr}' and (Classes/any(c: c/Term/Name eq 'Spring 2017'))` })
    .then((res2) => {
      const courses = res2.body.value;
      async.each(courses, ((course, callback2) => {
        course.subject = subjectAbbr;
        models.Course.create({
          title: course.Title,
          subject: course.subject,
          number: course.Number,
          description: course.Description,
          creditHours: course.CreditHours
        }).then(() => {
          callback2();
        }).catch((err) => {
          errorHandler(err);
          failCount += 1;
          callback2(err);
        });
      }), ((err) => {
        if (err) {
          errorHandler(err);
          callback1(err);
        } else {
          callback1();
        }
      }));
    });
}, 5);

const updateDb = (() => {
  console.log();
  console.log(chalk.cyan.bold('Updating the database.'));
  console.log(chalk.cyan('Collecting course subjects...'));
  request
    .get('http://api.purdue.io/odata/Subjects')
    .query({ $select: 'Name,Abbreviation' })
    .then((res1) => {
      const subjects = res1.body.value;
      console.log(chalk.green(`Subjects collected. (${subjects.length} total)`));
      console.log(chalk.cyan('Collecting courses...'));
      for (let i = 0; i < subjects.length; i += 1) {
        const subject = subjects[i];
        dbQueue.push(subject);
      }
    });
});

const updateAlgolia = (() => {
  console.log();
  console.log(chalk.cyan.bold('Updating Algolia.'));
  models.Course.findAll().then((res) => {
    let courses = res;
    courses = courses.map((course) => {
      course = course.dataValues;
      course.objectID = course.id;
      delete course.id;
      return course;
    });
    async.series([
      ((callback) => {
        console.log(chalk.cyan('Clearing Algolia course index...'));
        courseIndex.clearIndex((err, content) => {
          if (err) {
            callback(err);
          } else {
            console.log(chalk.green('Algolia course index cleared.'));
            callback(null);
          }
        });
      }),
      ((callback) => {
        console.log(chalk.cyan('Importing courses into Algolia...'));
        courseIndex.addObjects(courses, (err, content) => {
          if (err) {
            callback(err);
          } else {
            callback(null);
          }
        });
      })
    ], ((err) => {
      if (err) {
        console.log(chalk.red('Error: failed to add all courses into Algolia. Please try again.'));
        errorHandler(err);
      } else {
        console.log(chalk.green(`Success! All ${courses.length} courses from database added into Algolia.`));
      }
    }));
  }).catch((err) => {
    errorHandler(err);
  });
});

dbQueue.drain = (() => {
  if (dbQueue.length() === 0) {
    console.log(chalk.green('Courses collected.'));
    if (failCount > 0) {
      console.log(chalk.yellow(`Warning: failed to import ${failCount} courses into database.`));
    } else {
      console.log(chalk.green(`Success! All courses imported into database.`));
    }
    if (doUpdateAlgolia) {
      updateAlgolia();
    }
  } else {
    console.log(chalk.red('Error: the async task queue is not empty.'));
  }
});

models.sequelize.sync().then(() => {
  prompt();
  if (doUpdateDb) {
    updateDb();
  } else if (doUpdateAlgolia) {
    updateAlgolia();
  } else {
    process.exit(0);
  }
});
