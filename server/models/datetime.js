module.exports = {
    create: [
     `CREATE TABLE IF NOT EXISTS meeting_time (
       id INT AUTO_INCREMENT,
       date_time DATETIME NOT NULL,
       PRIMARY KEY(id)
     )`, 
     `CREATE TABLE IF NOT EXISTS person_meeting_time (
       meeting_time_id INT NOT NULL, 
       person_id INT NOT NULL, 
       PRIMARY KEY (person_id),
       FOREIGN KEY (meeting_time_id)
        REFERENCES meeting_time(id)
        ON DELETE CASCADE, 
       FOREIGN KEY (person_id) 
        REFERENCES person(id)
        ON DELETE CASCADE 
     )`
    ]
};



/*module.exports = (sequelize, Sequelize) => {
  const DateTime = sequelize.define('DateTime', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    dateTime: {
      type: Sequelize.DATE,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: (models) => {
        // DateTime.belongsTo(models.Meeting, { as: 'meeting' });
        DateTime.belongsTo(models.Meeting);
        DateTime.belongsToMany(models.User, { through: 'UserDateTime', timestamps: false });
      }
    },
    timestamps: false
  });
  return DateTime;
};*/

