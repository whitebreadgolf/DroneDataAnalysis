/**
@module regulationConfig
*/

module.exports = {
	faa_reg: {
		max_velocity:{
			hazard:'44.704', 
			warning:'40.2336'
		},
		max_altitude:{
			hazard:'121.92', 
			warning:'109.728'
		}
	},
	cur_flight:[
		{
			start_time:null, 
			user:null,
			simulation: {
				status: true,
				file_read: null
			},
			warning: {
				altitude: {
					hazard: null,
					warning: null
				},
				max_velocity:{
					x: {
						hazard: null,
						warning: null
					},
					y: {
						hazard: null,
						warning: null
					},
					z: {
						hazard: null,
						warning: null
					}
				}
			}
		}
	]
};