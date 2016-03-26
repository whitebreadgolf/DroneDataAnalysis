/**
@module safetyReport
*/

/**
@requires mongoose
*/

var mongoose = require('mongoose');

// initalize scheme object
var Schema = mongoose.Schema;

// describe user in schema
var safetyReportSchema = new Schema({
	pilot: { type: Schema.Types.ObjectId, ref: 'User' },
	flight_id: { type: Schema.Types.ObjectId, ref: 'Preflight' },
	type: { type: String, required: true},
	value: { type: Number, required: true},
	created_at: Date
});

// declare exported module
var SafetyReport = mongoose.model('SafetyReport', safetyReportSchema);

// export module 
module.exports = SafetyReport;