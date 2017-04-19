import algoliasearch from 'algoliasearch';

const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_ADMIN_KEY, { protocol: 'https:' });
const courseIndex = client.initIndex('courses');
const userIndex = client.initIndex('users');

function addObjects(index, objects) {
  return index.addObjects(objects);
}

export {
  courseIndex,
  userIndex,
  addObjects
}
