'use strict';
module.exports = (sequelize, DataTypes) => {
  const followers = sequelize.define('followers', {
    userId: DataTypes.INTEGER,
    followerId: DataTypes.INTEGER,
    request: DataTypes.INTEGER,
    unread: DataTypes.INTEGER
  }, {});
  followers.associate = function(models) {
    // associations can be defined here
  };
  return followers;
};