const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  project: String,
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: String,
  status_text: String,
  open: { type: Boolean, default: true },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now }
});

const Issue = mongoose.model('Issue', IssueSchema);

module.exports = function (app) {
  app.route('/api/issues/:project')
    .get(async function (req, res) {
      const project = req.params.project;
      try {
        const filter = { project, ...req.query };
        if (filter.hasOwnProperty('open')) {
          filter.open = filter.open === 'true';
        }
        const issues = await Issue.find(filter);
        res.json(issues);
      } catch (err) {
        res.status(500).json({ error: 'An error occurred while fetching issues' });
      }
    })
    
    .post(async function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      
      const newIssue = new Issue({
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || ''
      });
      
      try {
        const savedIssue = await newIssue.save();
        res.json(savedIssue);
      } catch (err) {
        res.status(500).json({ error: 'An error occurred while saving the issue' });
      }
    })
    
    .put(async function (req, res) {
      const { _id, ...updateFields } = req.body;
      
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      
      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }
      
      try {
        const updatedIssue = await Issue.findByIdAndUpdate(_id, { ...updateFields, updated_on: new Date() }, { new: true });
        if (!updatedIssue) {
          return res.json({ error: 'could not update', '_id': _id });
        }
        res.json({ result: 'successfully updated', '_id': _id });
      } catch (err) {
        res.json({ error: 'could not update', '_id': _id });
      }
    })
    
    .delete(async function (req, res) {
      const { _id } = req.body;
      
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      
      try {
        const deletedIssue = await Issue.findByIdAndDelete(_id);
        if (!deletedIssue) {
          return res.json({ error: 'could not delete', '_id': _id });
        }
        res.json({ result: 'successfully deleted', '_id': _id });
      } catch (err) {
        res.json({ error: 'could not delete', '_id': _id });
      }
    });
};
