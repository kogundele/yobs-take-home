const { body, validationResult } = require('express-validator');
const defaultAuthValue = 'yobian'

exports.validate = function () {
    // validation rules
    return [ 
        body('name').not().isEmpty().trim().escape(),
        body('trait.fulfilment').exists().isObject(),
        body('trait.fulfilment.operation').isIn(['inverse', 'avg']),
        body('trait.fulfilment.operands').exists().isObject(),
        body('trait.fulfilment.operands.debt').isNumeric(),
        body('trait.fulfilment.operands.mortgage').isNumeric()
    ];  
  }

exports.compute = function (req, res, next) {
    try {
        // validate authorization header
        if (!req.headers.authorization) {
            return res.status(404).json({ error: 'No authorization sent!' });
        } 
        else if (req.headers.authorization !== defaultAuthValue) {
            return res.status(404).json({ error: 'Invalid authorization!' });
        }

        // validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        // return success
        res.json({
                  name: req.body.name,
                  trait: {
                    fulfilment: computeAggregateByOperator(req.body.trait.fulfilment.operation, req.body.trait.fulfilment.operands),
                    unit: 'percent'
                  } 
              });
    } catch (error) {
        return next(err)
    }
};

function computeAggregateByOperator(operator, operands) {
    if (operator == 'inverse') {
        return 100 - (parseFloat(operands.debt) + parseFloat(operands.mortgage))
    }
    else if (operator == 'avg') {
        return 100 - (parseFloat(operands.mortgage) / parseFloat(operands.debt))
    } else {
        return 0;
    }
}