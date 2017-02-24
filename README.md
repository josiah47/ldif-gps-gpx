# ldif-gps-gpx

## Synopsis

Geocode ldif Address book, and create gpx files per mailinglist

## Code Example

Export a top level address book out of thunderbird into project's directory.

3rd argument can be what ever field you want, but it will overwrite what ever data is currently in it.

This command treats input file as readonly, and outputs outputfile.ldif

```
node backfill_ldif.js address.ldif mozillaCustom4 GOOGLEMAPSAPIKEY
```

Now you can run create_gpx_files.js to create a gpx file per mailing list that will be populated with addresses that have been found.

```
node create_gpx_files.js outputfile.ldif mozillaCustom4
```

Now you can use this gpx files in what ever map viewing program you use. I prefer to use Viking GPS, since its fast.

https://sourceforge.net/projects/viking/

## Motivation

Had a client that needed to visualize all their contacts on a map.

## Installation

```
git clone https://github.com/josiah47/ldif-gps-gpx.git
cd ldif-gps-gpx
npm install
```

## Contributors

Feel free to use and submit issues or pull requests

## License

Using MIT license.
