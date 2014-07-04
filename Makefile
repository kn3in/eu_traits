open:
	open "http://localhost:8080"
serve:
	http-server &
edit:
	subl index.html
bind2geo:
	topojson \
	-o final_tj.json \
	-e real_data.csv \
	--id-property=NAME,ccode \
	-p mean_bmi_obs=+mean_bmi_obs \
	-p mean_height_obs=+mean_height_obs \
	-p mean_height_est=+mean_height_est \
	-p mean_bmi_est=+mean_bmi_est \
	-- subunits.json
sh2geojson:
	ogr2ogr -f GeoJSON subunits.json ne_10m_admin_0_map_subunits.shp -clipsrc -25.6 34.11 34.97 71.69
select_box:
	open "http://boundingbox.klokantech.com/"
get_shape:
	wget "http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_0_map_subunits.zip"
set_up:
	brew install gdal
	brew install node
	npm install -g topojson
	npm install -g http-server
help:
	open "http://chimera.labs.oreilly.com/books/1230000000345/index.html"
