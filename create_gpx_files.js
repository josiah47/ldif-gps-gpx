#!/usr/bin/node
// node create_gpx_files.js outputfile.ldif mozillaCustom4

var infile = process.argv[2];
var fieldForGPSInfo = process.argv[3];

var ldif = require('ldif');
var togpx = require('togpx');
var fs = require('fs');

var parsed = ldif.parseFile(infile);
var gpxpoints = [];
var gpxlayers = [];
parsed.entries.forEach( function (record) {
	let contact = record.toObject({});
	let attr = contact.attributes;
	if (attr.hasOwnProperty('objectclass')
		&& attr.objectclass.includes('organizationalPerson')
	) {
		if ( attr.hasOwnProperty(fieldForGPSInfo)) {
			let location = JSON.parse(attr[fieldForGPSInfo]);
			let geojson_feature = {
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [location.lng, location.lat]
				},
				"properties": {
					"name": attr.cn,
					"cmt": contact.dn,
					"desc": attr.mozillaHomeStreet +', '+ attr.mozillaHomeLocalityName +', '+ attr.mozillaHomeState +', '+ attr.mozillaHomePostalCode
						+', '+ attr.mozillaHomeCountryName
				}
			};
			gpxpoints.push(geojson_feature);
		}
	} else if (attr.hasOwnProperty('objectclass')
		&& attr.objectclass.includes('groupOfNames')
	) {
		gpxlayers.push(contact);
	}
});

var findMemberInGPXPoints = function (member,features) {
	let index = gpxpoints.findIndex( function (point) {
		if (point.properties.cmt === member) {
			return true;
		}
	});

	if (index !== -1) {
		features.push(gpxpoints[index]);
	}
};

gpxlayers.forEach( function (layer) {
	// ~console.log(layer.dn);
	let members = layer.attributes.member;
	// ~console.log(members);
	let geojson = { "type": "FeatureCollection","features": []};

	if (Object.prototype.toString.call( members ) === '[object Array]') {
		members.forEach( function (member) {
			findMemberInGPXPoints(member,geojson.features);
		});
	} else if (typeof members === 'string') {
		findMemberInGPXPoints(members,geojson.features);
	}

	if (geojson.features.length > 0) {
		let outputfilename = layer.dn.split('cn=')[1].replace('/','')+'.gpx';
		console.log(outputfilename,geojson.features.length);
		fs.writeFileSync(outputfilename, '', function(){ console.log('done');});
		fs.writeFileSync(outputfilename, togpx(geojson), function(){ console.log('done');});
	}
});
