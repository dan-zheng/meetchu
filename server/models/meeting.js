
module.exports = {
  query: [
    `CREATE TABLE IF NOT EXISTS meeting (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      description VARCHAR(255),
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      final_time_id INT,
      PRIMARY KEY (id),
      FOREIGN KEY (final_time_id)
        REFERENCES meeting_time(id)
        ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS meeting_time (
      id INT NOT NULL AUTO_INCREMENT,
      time DATETIME NON NULL,
      meeting_id INT NON NULL,
      PRIMARY KEY (id)
      FOREIGN KEY (meeting_id)
        REFERENCES meeting(id)
    )`,
  ]
};

/*module.exports = (sequelize, Sequelize) => {
  const Meeting = sequelize.define('Meeting', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    location: {
      type: Sequelize.STRING,
      allowNull: true
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true
    }
  }, {
    classMethods: {
      associate: (models) => {
        Meeting.belongsToMany(models.User, { through: 'UserMeeting', timestamps: true, updatedAt: false });
        Meeting.hasMany(models.DateTime);
        Meeting.belongsTo(models.DateTime, { as: 'finalTime', foreignKey: 'finalTimeId', constraints: false });
      }
    }
  });
  return Meeting;
};*/
