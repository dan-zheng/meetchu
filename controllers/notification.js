const models = require('../models');

exports.createNotification = (req, res) => {
  req.user.addNotification(
    models.Notification.createNotification({
      where: {
        text: req.body.text,
      },
      defaults: {
        seen: false,
      }
    })
  );
};


/**
 * GET /notifications
 * Notifications page.
 */
exports.getNotifications = (req, res) => {
  models.Notification.findAll({
    include: [{
      model: models.User,
      where: {
        id: req.user.dataValues.id
      }
    }]
  }).then((notifications) => {
    if (notifications) {
      notifications = notifications.map((notification) => {
        return notifications.dataValues;
      });
      return res.render('notifications/index', {
        title: 'Notifications',
        notifications
      });
    }
    return res.render('notifications/index', {
      title: 'Notifications'
    });
  });
};
