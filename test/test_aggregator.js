let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

chai.use(chaiHttp);

const API = 'http://localhost:3000/v1/aggregator'

describe('Aggregator', () => {
  describe('/GET aggregator', () => {
      it('it should not allow a POST request', (done) => {
        chai.request(API)
            .post('/')
            .end((err, res) => {
                  res.should.have.status(404);
                done();
            });
      });
      it('it should fail for missing authorization', (done) => {
        chai.request(API)
            .get('/')
            .set('content-type', 'application/json')
            .end((err, res) => {
                  res.should.have.status(404);
                  res.body.should.have.property('error');
                  res.body.should.have.property('error').eql('No authorization sent!');
                done();
            });
      });
      it('it should fail for invalid authorization', (done) => {
        chai.request(API)
            .get('/')
            .set('content-type', 'application/json')
            .set('authorization', 'yobianfake')
            .end((err, res) => {
                  res.should.have.status(404);
                  res.body.should.have.property('error');
                  res.body.should.have.property('error').eql('Invalid authorization!');
                done();
            });
      });
      it('it should fail for no request parameter', (done) => {
        chai.request(API)
            .get('/')
            .set('content-type', 'application/json')
            .set('authorization', 'yobian')
            .send()
            .end((err, res) => {
                  res.should.have.status(400);
                  res.body.should.have.property('errors');
                done();
            });
      });
      it('it should fail for missing or malformed body request', (done) => {
        chai.request(API)
            .get('/')
            .set('content-type', 'application/json')
            .set('authorization', 'yobian')
            .send({
                name: "john doe",
                trait:
                {
                    fulfilment: {
                        operation: "max",
                        operands: {
                            mortgage: "6"
                        }
                    }
                }
            })
            .end((err, res) => {
                  res.should.have.status(400);
                  res.body.should.have.property('errors');
                done();
            });
      });
      it('it should fail for invalid fulfilment operation', (done) => {
        chai.request(API)
            .get('/')
            .set('content-type', 'application/json')
            .set('authorization', 'yobian')
            .send({
                name: "john doe",
                trait:
                {
                    fulfilment: {
                        operation: "max",
                        operands: {
                            debt: "5",
                            mortgage: "6"
                        }
                    }
                }
            })
            .end((err, res) => {
                  res.should.have.status(400);
                  res.body.should.have.property('errors');
                done();
            });
      });
      it('it should pass for inverse operation with validated request body', (done) => {
        chai.request(API)
            .get('/')
            .set('content-type', 'application/json')
            .set('authorization', 'yobian')
            .send({
                name: "john doe",
                trait:
                {
                    fulfilment: {
                        operation: "inverse",
                        operands: {
                            debt: "5",
                            mortgage: "6"
                        }
                    }
                }
            })
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.property('name');
                  res.body.should.have.nested.property('trait.unit');
                  res.body.should.have.nested.property('trait.fulfilment');
                  res.body.should.have.nested.property('trait.fulfilment').eql(89);
                  res.body.should.have.nested.property('trait.unit').eql('percent');
                done();
            });
      });
      it('it should pass for avg operation with validated request body', (done) => {
        chai.request(API)
            .get('/')
            .set('content-type', 'application/json')
            .set('authorization', 'yobian')
            .send({
                name: "john doe",
                trait:
                {
                    fulfilment: {
                        operation: "avg",
                        operands: {
                            debt: "5",
                            mortgage: "6"
                        }
                    }
                }
            })
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.property('name');
                  res.body.should.have.nested.property('trait.unit');
                  res.body.should.have.nested.property('trait.fulfilment');
                  res.body.should.have.nested.property('trait.fulfilment').eql(98.8);
                  res.body.should.have.nested.property('trait.unit').eql('percent');
                done();
            });
      });
  });
});