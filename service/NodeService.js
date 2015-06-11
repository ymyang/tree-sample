/**
 * Created by yang on 2015/6/11.
 */
var sequelize = require('../models').sequelize;
var Node = require('../models').Node;

var NodeParam = require('../params/nodes').NodeParam;

exports.insertNode = function(req, res) {
    var param = new NodeParam(req.body);
    new Promise(function(resolve, reject) {
        if (param.parentId) {
            Node.findById(param.parentId).then(function(node) {
                console.log('node:', node.toJSON());
                resolve(node.rightValue);
            });
        } else {
            Node.max('right_value').then(function(maxRight) {
                console.log('maxRight:', maxRight);
                resolve(maxRight);
            });
            //resolve(1);
        }
    }).then(function(right) {
            console.log('right:', right);
            if (!right || right <= 0) {
                right = 1;
            }
            param.leftValue = right;
            param.rightValue = right + 1;
            sequelize.transaction(function(t) {
                return Promise.all([
                    sequelize.query('UPDATE node SET right_value = right_value + 2 WHERE right_value >= ?', {type: sequelize.QueryTypes.UPDATE, transaction: t, replacements: [right]}),
                    sequelize.query('UPDATE node SET left_value = left_value + 2 WHERE left_value >= ?', {type: sequelize.QueryTypes.UPDATE, transaction: t, replacements: [right]}),
                    Node.create(param, {transaction: t})
                ]);
            }).then(function(result) {
                res.json(result[2]);
            }).catch(function(err) {
                throw err;
            });
        }).catch(function(err) {
            throw err;
        });
};

exports.deleteNode = function(req, res) {
    Node.findById(req.query.nodeid).then(function(node) {
        console.log('node:', node.toJSON());
        sequelize.transaction(function(t) {
            return Promise.all([
                Node.destroy({where:{nodeId: req.query.nodeid}, transaction: t}),
                sequelize.query('UPDATE node SET left_value = left_value - (:right - :left + 1) WHERE left_value > :left', {type: sequelize.QueryTypes.UPDATE, transaction: t, replacements: {left: node.leftValue, right: node.rightValue}}),
                sequelize.query('UPDATE node SET right_value = right_value - (:right - :left + 1) WHERE right_value > :right', {type: sequelize.QueryTypes.UPDATE, transaction: t, replacements: {left: node.leftValue, right: node.rightValue}})
            ]);
        }).then(function(result) {
            res.send('ok');
        });
    });
};

exports.getChildren = function(req, res) {
    Node.findById(req.query.nodeid).then(function(node) {
        console.log('node:', node.toJSON());
        Node.findAndCountAll({where: {leftValue: {$gt: node.leftValue, $lt: node.rightValue}}, order: ['nodeName']}).then(function(result) {
            var r = {};
            r.count = result.count;
            r.children = result.rows;

            res.json(result);
        });
    });
};

exports.getParents = function(req, res) {
    Node.findById(req.query.nodeid).then(function(node) {
        console.log('node:', node.toJSON());
        Node.findAndCountAll({where: {leftValue: {$lt: node.leftValue}, rightValue: {$gt: node.rightValue}}, order: ['leftValue']}).then(function(result) {
            var r = {};
            r.count = result.count;
            r.parents = result.rows;

            res.json(result);
        });
    });
};