/**
 * Created by yang on 2015/6/11.
 */
var sequelize = require('../models').sequelize;
var Node = require('../models').Node;

var NodeService = module.exports = {};

NodeService.insertNode = function(param) {
    return new Promise(function(resolve, reject) {
        if (param.parentId) {
            Node.findById(param.parentId).then(function(node) {
                console.log('node:', node.toJSON());
                resolve(node.rightValue);
            }).catch(reject);
        } else {
            Node.max('right_value').then(function(maxRight) {
                console.log('maxRight:', maxRight);
                resolve(maxRight);
            }).catch(reject);
        }
    }).then(function(right) {
            console.log('right:', right);
            if (!right || right <= 0) {
                right = 1;
            }
            param.leftValue = right;
            param.rightValue = right + 1;
            return sequelize.transaction(function(t) {
                return Promise.all([
                    sequelize.query('UPDATE node SET right_value = right_value + 2 WHERE right_value >= ?', {type: sequelize.QueryTypes.UPDATE, transaction: t, replacements: [right]}),
                    sequelize.query('UPDATE node SET left_value = left_value + 2 WHERE left_value >= ?', {type: sequelize.QueryTypes.UPDATE, transaction: t, replacements: [right]}),
                    Node.create(param, {transaction: t})
                ]);
            });
        }).then(function(result) {
            return result[2].dataValues;
        });
};

NodeService.deleteNode = function(nodeid) {
    return Node.findById(nodeid).then(function(node) {
        console.log('node:', node.toJSON());
        return sequelize.transaction(function(t) {
            return Promise.all([
                Node.destroy({where: {leftValue: {$gte: node.leftValue}, rightValue: {$lte: node.rightValue}}, transaction: t}),
                sequelize.query('UPDATE node SET left_value = left_value - (:right - :left + 1) WHERE left_value > :left', {type: sequelize.QueryTypes.UPDATE, transaction: t, replacements: {left: node.leftValue, right: node.rightValue}}),
                sequelize.query('UPDATE node SET right_value = right_value - (:right - :left + 1) WHERE right_value > :right', {type: sequelize.QueryTypes.UPDATE, transaction: t, replacements: {left: node.leftValue, right: node.rightValue}})
            ]);
        });
    }).then(function() {
        return;
    });
};

NodeService.getChildren = function(nodeid) {
    return Node.findById(nodeid).then(function(node) {
        console.log('node:', node.toJSON());
        return Node.findAndCountAll({
            where: {leftValue: {$gt: node.leftValue, $lt: node.rightValue}},
            order: ['nodeName']
        });
    }).then(function(result) {
        return {
            count: result.count,
            children: result.rows
        };
    });
};

NodeService.getParents = function(nodeid) {
    return Node.findById(nodeid).then(function(node) {
        console.log('node:', node.toJSON());
        return Node.findAndCountAll({
            where: {leftValue: {$lt: node.leftValue}, rightValue: {$gt: node.rightValue}},
            order: ['leftValue']
        });
    }).then(function(result) {
        return {
            count: result.count,
            parents: result.rows
        };
    });
};