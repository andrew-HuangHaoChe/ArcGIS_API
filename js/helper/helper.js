var helper = function () {
	proj4.defs("EPSG:3826", "+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
	proj4.defs("EPSG:3825", "+proj=tmerc +lat_0=0 +lon_0=119 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
	proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
	proj4.defs("EPSG:3824", "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs");
	proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
	return {
		epsg4326to3857: function (arr) {
            return proj4("EPSG:4326", "EPSG:3857", arr);
        },
        epsg4326to3826: function (arr) {
            return proj4("EPSG:4326", "EPSG:3826", arr);
        },
		epsg4326to3824: function (arr) {
			return proj4("EPSG:4326", "EPSG:3824", arr);
		},
		epsg4326to3825: function (arr) {
            return proj4("EPSG:4326", "EPSG:3825", arr);
        },
        epsg3826to3857: function (arr) {
            return proj4("EPSG:3826", "EPSG:3857", arr);
        },
        epsg3826to4326: function (arr) {
            return proj4("EPSG:3826", "EPSG:4326", arr);
        },
        epsg3857to3826: function (arr) {
            return proj4("EPSG:3857", "EPSG:3826", arr);
        },
        epsg3857to4326: function (arr) {
            return proj4("EPSG:3857", "EPSG:4326", arr);
        },
	}
}();