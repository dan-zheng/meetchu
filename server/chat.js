module.exports = models => ({
   /*
    * 
    */
    findById(id) {
        return models.pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id])
            .then(rows => rows.list().headMaybe()
            .map(user => new models.User(user)));
    }
