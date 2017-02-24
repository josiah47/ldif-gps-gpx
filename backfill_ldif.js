#!/usr/bin/node
// node backfill_ldif.js address.ldif mozillaCustom4 apikey

var infile = process.argv[2];
var fieldForGPSInfo = process.argv[3];
var googleapikey = process.argv[4];

var ldif = require('ldif');

var googleMapsClient = require('@google/maps').createClient({
  key: googleapikey
});

var fs = require('fs');

var outputfilename = 'outputfile.ldif';
if (fs.existsSync(outputfilename)) {
	console.log('Output file exists already');
	process.exit();
}

fs.writeFile(outputfilename, '', function(){console.log('done');});

var parsed = ldif.parseFile(infile);

var updateLDIF = function (record,attributes) {
	if ( record instanceof ldif.Record) {
		try {
			// ~console.log(record,attributes);
			attributes.forEach( function (attribute) {
				let index = record.attributes.findIndex( function (element, index, array) {
					if (element.attribute.attribute === attribute.attribute) {
						return true;
					}
				});

				if (index !== -1) {
					if (record.attributes[index].attribute.attribute === attribute.attribute) {
						record.attributes[index].value.value = attribute.value;
					}
				} else {
					record.populate([{
						'attribute': attribute.attribute,
						'value': attribute.value
					}]);
				}
			});

			let LDIFSTRING = record.toLDIF();
			fs.appendFileSync(outputfilename, LDIFSTRING+ "\n\n", (err) => {
			  if (err) throw err;
			});
		} catch (err) {
			console.log(err);
		}
	}
};

parsed.entries.forEach( function (record) {
	let contact = record.toObject({});
	let attr = contact.attributes;
	let updateAttributes = [];
	if (attr.hasOwnProperty('objectclass')
		&& attr.objectclass.includes('organizationalPerson')
	) {
		updateAttributes.push({attribute:'c',value:''});
		updateAttributes.push({attribute:'mozillaHomeCountryName',value:'Canada'});

		attr.mozillaHomeCountryName = 'Canada';

		if (attr.mozillaHomeStreet
			&& attr.mozillaHomeStreet.length > 5
			&& !attr.hasOwnProperty(fieldForGPSInfo)
		) {
			googleMapsClient.geocode({
				region: 'ca',
				address: attr.mozillaHomeStreet +', '+ attr.mozillaHomeLocalityName +', '+ attr.mozillaHomeState +', '+ attr.mozillaHomePostalCode
					+', '+ attr.mozillaHomeCountryName
			}, function(err, response) {
				if (!err) {
					console.log(JSON.stringify(response.json.results[0].geometry.location));
					updateAttributes.push({
						attribute: fieldForGPSInfo,
						value: JSON.stringify(response.json.results[0].geometry.location)
					});
				} else {
					console.log(err);
					console.log('GPS Coords not found for:'+contact.dn);
				}

				updateLDIF(record,updateAttributes);
			});
		} else {
			updateLDIF(record,[]);
		}
	} else {
		updateLDIF(record,[]);
	}
});
