/**
 * Module dependencies.
 */
import algoliasearch from 'algoliasearch';

const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_ADMIN_KEY);
const courseIndex = client.initIndex('courses');

export {
  courseIndex
}
