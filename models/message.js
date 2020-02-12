'use strict';
module.exports = (sequelize, DataTypes) => {
  const message = sequelize.define('message', {
    sendersId: DataTypes.INTEGER,
    recieversId: DataTypes.INTEGER,
    message: DataTypes.STRING
  }, {});
  message.associate = function(models) {
    // associations can be defined here
    message.belongsTo(models.user,{
      foreignKey:"sendersId",
      
    })
    message.belongsTo(models.user,{
      foreignKey:"recieversId",
     
    })
  };
  return message;
};