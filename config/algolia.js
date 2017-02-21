/**
 * Module dependencies.
 */
const algoliasearch = require('algoliasearch');
const client = algoliasearch('8NC5DAIBAS', '90e970160f1e67e1ee19fe02af4ea530');
const request = require('superagent');

const subjectIndex = client.initIndex('subjects');
const coursesIndex = client.initIndex('courses');

request
  .get('http://api.purdue.io/odata/Subjects')
  .query({ $select: 'Name,Abbreviation' })
  .then((res) => {
    const subjects = res.body.value;
    subjectIndex.addObjects(subjects, (err, content) => {
      if (err) {
        console.error(err);
      }
    });
  })
  .catch((err) => {
    console.log(err);
  });
