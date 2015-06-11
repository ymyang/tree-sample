var express = require('express');
var NodeService = require('../service/NodeService.js');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', NodeService.insertNode);
router.delete('/', NodeService.deleteNode);
router.get('/children', NodeService.getChildren);
router.get('/parents', NodeService.getParents);

module.exports = router;
