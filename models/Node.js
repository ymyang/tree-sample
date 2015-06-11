/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Node', { 
    nodeId: {
      field: 'node_id',
      primaryKey: true,
      type: DataTypes.BIGINT,
      allowNull: false
    },
    nodeName: {
      field: 'node_name',
      type: DataTypes.STRING,
      allowNull: false
    },
    leftValue: {
      field: 'left_value',
      type: DataTypes.BIGINT,
      allowNull: false
    },
    rightValue: {
      field: 'right_value',
      type: DataTypes.BIGINT,
      allowNull: false
    },
    parentId: {
      field: 'parent_id',
      type: DataTypes.BIGINT,
      allowNull: true
    }
  } , {
    tableName: 'node',
    timestamps: false,
    freezeTableName: true
 });
};
