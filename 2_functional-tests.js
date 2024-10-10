const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testId;

  test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue',
        created_by: 'Functional Test',
        assigned_to: 'Chai',
        status_text: 'In QA'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'issue_title');
        assert.property(res.body, 'issue_text');
        assert.property(res.body, 'created_by');
        assert.property(res.body, 'assigned_to');
        assert.property(res.body, 'status_text');
        assert.property(res.body, '_id');
        testId = res.body._id;
        done();
      });
  });
  
  test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Title',
        issue_text: 'text',
        created_by: 'Functional Test - Required fields filled in'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.property(res.body, 'issue_title');
        assert.property(res.body, 'issue_text');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.property(res.body, 'created_by');
        assert.property(res.body, 'assigned_to');
        assert.property(res.body, 'open');
        assert.property(res.body, 'status_text');
        assert.property(res.body, '_id');
        done();
      });
  });
  
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Title'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });
  
  test('View issues on a project: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/apitest')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'updated_on');
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], 'assigned_to');
        assert.property(res.body[0], 'open');
        assert.property(res.body[0], 'status_text');
        assert.property(res.body[0], '_id');
        done();
      });
  });
  
  test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/apitest')
      .query({open: true})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'updated_on');
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], 'assigned_to');
        assert.property(res.body[0], 'open');
        assert.equal(res.body[0].open, true);
        assert.property(res.body[0], 'status_text');
        assert.property(res.body[0], '_id');
        done();
      });
  });
  
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/apitest')
      .query({open: true, created_by: 'Functional Test'})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        if (res.body.length > 0) {
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.equal(res.body[0].created_by, 'Functional Test');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.equal(res.body[0].open, true);
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
        }
        done();
      });
  });
  
  test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: testId,
        issue_title: 'New Title'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
  });
  
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: testId,
        issue_title: 'New Title',
        issue_text: 'New Text'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
  });
  
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        issue_title: 'New Title'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
  
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: '5fe0c500ec2f6f4c1815a770'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });
  
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: 'invalid_id',
        issue_title: 'New Title'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });
  
  test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: testId
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, testId);
        done();
      });
  });
  
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: 'invalid_id'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });
  
  test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Title',
        issue_text: 'text',
        created_by: 'Functional Test - Delete',
      })
      .end(function(err, res){
        const deleteId = res.body._id;
        chai.request(server)
          .delete('/api/issues/apitest')
          .send({ _id: deleteId })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body.result, 'successfully deleted');
            assert.equal(res.body._id, deleteId);
            done();
          });
      });
  });

});
