/**
 * Module dependencies.
 */
const dotenv = require('dotenv');
const algoliasearch = require('algoliasearch');
const request = require('superagent');

/**
 * Load environment variables from .env file.
 */
dotenv.load({ path: '.env' });

const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_ADMIN_KEY);

const subjectIndex = client.initIndex('subjects');
const coursesIndex = client.initIndex('courses');

request
  .get('http://api.purdue.io/odata/Subjects')
  .query({ $select: 'Name,Abbreviation' })
  .then((res1) => {
    const subjects = res1.body.value;
    for (let i = 0; i < subjects.length; i += 1) {
      const subject = subjects[i].Abbreviation;
      request
        .get('https://api.purdue.io/odata/Courses')
        .query({ $filter: `Subject/Abbreviation eq '${subject}'` })
        .then((res2) => {
          console.log(res2.body.value);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    /*
    subjectIndex.addObjects(subjects, (err, content) => {
      if (err) {
        console.error(err);
      }
    });
    */
  })
  .catch((err) => {
    console.log(err);
  });
