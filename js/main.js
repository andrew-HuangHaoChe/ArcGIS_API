const data = {
	isActive: false,
}
require(
	[
		"esri/widgets/Sketch/SketchViewModel",
		"esri/config",
		"esri/layers/WebTileLayer",
		"esri/Map",
		"esri/Graphic",
		"esri/layers/GraphicsLayer",
		"esri/views/MapView",
		"esri/views/SceneView",
		"esri/widgets/Locate",
		"esri/widgets/Track",
		"esri/views/ui/UI",
		// "esri/widgets/BasemapToggle",
		"esri/widgets/Zoom",
		"esri/widgets/Home",
		"esri/layers/TileLayer",
		"esri/layers/MapImageLayer",
		"esri/layers/FeatureLayer",
		"esri/layers/WMSLayer",
		"esri/widgets/LayerList",
		"esri/widgets/CoordinateConversion",
		"esri/widgets/ScaleBar",
		"esri/geometry/Extent",
		"esri/core/watchUtils",
		"esri/widgets/Expand",
		"esri/rest/query",
		"esri/rest/support/Query",
		"esri/rest/identify",
		"esri/rest/support/IdentifyParameters",
		"esri/views/layers/LayerView",
		"esri/WebScene",
		"esri/WebMap",
		"esri/layers/GeoJSONLayer",
		"esri/renderers/SimpleRenderer",
		"esri/identity/IdentityManager",
	],
	function (
		SketchViewModel,
		esriConfig,
		WebTileLayer,
		Map,
		Graphic,
		GraphicsLayer,
		MapView,
		SceneView,
		Locate,
		Track,
		UI,
		// BasemapToggle,
		Zoom,
		Home,
		TileLayer,
		MapImageLayer,
		FeatureLayer,
		WMSLayer,
		LayerList,
		CoordinateConversion,
		ScaleBar,
		Extent,
		watchUtils,
		Expand,
		query,
		Query,
		identify,
		IdentifyParameters,
		LayerView,
		WebScene,
		WebMap,
		GeoJSONLayer,
		SimpleRenderer,
		esriId,
	) {
		// https://wmts.nlsc.gov.tw/wmts/EMAP2/default/GoogleMapsCompatible/{level}/{row}/{col}
		const countyUrl = "https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{level}/{row}/{col}";
		const districtUrl = "https://richimap1.richitech.com.tw/arcgis/rest/services/NCDR/MOI_district/MapServer/";
		esriConfig.apiKey = "AAPK55baa15465db4dd8996a0910ba4a8ae2gg1flWiBmMpL9BDIdZgIgQuaibnyaEtjiIBqw7vs-ZjnUKiPXCz_sA1lyYOlrgB5";
		var params;
		const tempGraphicsLayer = new GraphicsLayer({
			title: "sketch圖層"
		});
		const map = new Map({
			basemap: "satellite", // Basemap layer service
		});
		// const view = new MapView({
		// 	container: "viewDiv",
		// 	map: map,
		// 	center: [121, 23.5],
		// 	zoom: 7,
		// 	highlightOptions: {
		// 		color: [255, 241, 58],
		// 		fillOpacity: 0.4
		// 	},
		// });
		const appConfig = {
			mapView: new MapView({
				zoom: 7,
				center: [121, 23.5],
				highlightOptions: {
					color: [255, 241, 58],
					fillOpacity: 0.4
				},
				container: "viewDiv",
				map: map,
			}),
			sceneView: null,
			activeView: null,
			// container: "viewDiv" // use same container for views
		};
		const initialViewParams = {
			zoom: 7,
			center: [121, 23.5],
			highlightOptions: {
				color: [255, 241, 58],
				fillOpacity: 0.4
			},
			container: appConfig.container,
			map: map,
		};
		// const switchButton = document.getElementById("switch-btn");


		// create 2D view and and set active
		// appConfig.mapView = createView(initialViewParams, "2d");
		// appConfig.mapView.map = webmap;
		// appConfig.activeView = appConfig.mapView;

		// create 3D view, won't initialize until container is set
		initialViewParams.container = null;
		// initialViewParams.map = scene;
		// appConfig.sceneView = createView(initialViewParams, "3d");

		// switch the view between 2D and 3D each time the button is clicked
		// switchButton.addEventListener("click", () => {
		// 	switchView();
		// });
		// Switches the view from 2D to 3D and vice versa
		function switchView() {
			const is3D = appConfig.activeView.type === "3d";
			const activeViewpoint = appConfig.activeView.viewpoint.clone();

			// remove the reference to the container for the previous view
			appConfig.activeView.container = null;

			if (is3D) {
				// if the input view is a SceneView, set the viewpoint on the
				// mapView instance. Set the container on the mapView and flag
				// it as the active view
				appConfig.mapView.viewpoint = activeViewpoint;
				appConfig.mapView.container = appConfig.container;
				appConfig.activeView = appConfig.mapView;
				switchButton.value = "3D";
			} else {
				appConfig.sceneView.viewpoint = activeViewpoint;
				appConfig.sceneView.container = appConfig.container;
				appConfig.activeView = appConfig.sceneView;
				switchButton.value = "2D";
			}
		}

		function createView(params, type) {
			let view;
			if (type === "2d") {
				view = new MapView(params);
				return view;
			} else {
				view = new SceneView(params);
			}
			return view;
		}
		// view視角變化取得x y 最大&&最小值
		watchUtils.whenTrue(appConfig.mapView, "stationary", () => {
			// Get the new center of the view only when view is stationary.
			if (appConfig.mapView.center) {
				const info = `
					<span> the view center changed. </span>
					x: ${appConfig.mapView.center.x.toFixed(2)}
					y: ${appConfig.mapView.center.y.toFixed(2)}
				`;
				displayMessage(info);
			}
			// Get the new extent of the view only when view is stationary.
			if (appConfig.mapView.extent) {
				const info = `
					<span> the view extent changed: </span>
					<br> xmin: ${appConfig.mapView.extent.xmin.toFixed(2)}
					xmax: ${appConfig.mapView.extent.xmax.toFixed(2)}
					<br> ymin: ${appConfig.mapView.extent.ymin.toFixed(2)}
					ymax: ${appConfig.mapView.extent.ymax.toFixed(2)}
				`;
				displayMessage(info);
			}
		});

		function displayMessage(info) {
			const outputMessages = document.getElementById("outputMessages");
			outputMessages.innerHTML = info;
			outputMessages.scrollTop = outputMessages.scrollHeight;
		}

		// custom pointer-move(滑鼠移動)取得經緯度[手刻板本]
		// var coordsWidget = document.createElement("div");
		// coordsWidget.id = "coordsWidget";
		// coordsWidget.className = "esri-widget esri-component";
		// coordsWidget.style.padding = "7px 15px 5px";
		// view.ui.add(coordsWidget, "bottom-right");
		// view.on("pointer-move", function (evt) {
		// 	showCoordinates(view.toMap({
		// 		x: evt.x,
		// 		y: evt.y
		// 	}));
		// });

		// function showCoordinates(event) {
		// 	var coords =
		// 		"Lat/Lon " +
		// 		event.latitude.toFixed(6) +
		// 		" " +
		// 		event.longitude.toFixed(6) +
		// 		" | Scale 1:" +
		// 		Math.round(view.scale * 1) / 1 +
		// 		" | Zoom " +
		// 		view.zoom;
		// 	coordsWidget.innerHTML = coords;
		// }
		// view.when(function () {
		// 	document.getElementById("footer").append(coordsWidget);
		// })

		// appConfig.mapView.when(function () {

		// });
		// 元件-------------------------------
		const layerList = new LayerList({ // 圖層切換list
			view: appConfig.mapView
		});
		const layerListExpand = new Expand({
			view: appConfig.mapView,
			content: layerList,
		});
		const locateWidget = new Locate({
			view: appConfig.mapView,
			useHeadingEnabled: false,
			graphic: new Graphic({
				symbol: {
					type: "simple-marker",
					size: "12px",
					color: "green",
					outline: {
						color: "#efefef",
						width: "1.5px"
					}
				}
			}),
			goToOverride: function (view, options) {
				options.target.scale = 2000;
				return view.goTo(options.target);
			}
		});
		const zoomWidget = new Zoom({
			view: appConfig.mapView,
			container: "zoom-widget"
		});
		const homeWidget = new Home({
			view: appConfig.mapView
		});
		const ccWidget = new CoordinateConversion({
			view: appConfig.mapView,
			container: "footer"
		});
		const scaleBar = new ScaleBar({
			view: appConfig.mapView,
			container: "footer",
		});
		// 圖層-------------------------------
		const countyLayer = new WebTileLayer({
			urlTemplate: countyUrl,
			title: "縣市圖層",
		});
		esriConfig.request.interceptors.push({
			urls: "https://richimap1.richitech.com.tw/arcgis/rest/services/NCDR",
			before: function (params) {
				params.requestOptions.query.token = "WA76UyIk01XyBnYp0z4RracYBU5Q0PnmrC6MZUKrBeEYFM7UbNDLoGJ89qon-nS3wisM7V37yUliFoKpMsQ3Rw..";
			},
		});
		const district = new MapImageLayer({
			url: districtUrl,
			sublayers: [{
				id: 1,
				popupTemplate: {
					outFields: ["*"],
					content: getDistrictInfo
				}
			}],
			title: "行政區圖層",
		});
		const policeLayer = new MapImageLayer({
			url: "https://richimap1.richitech.com.tw/arcgis/rest/services/NCDR/NCDR_SDE_Point/MapServer/",
			sublayers: [{
				id: 12,
			}],
			title: "警局圖層",
		});
		const countyFeatureLayer = new FeatureLayer({
			url: "https://richimap1.richitech.com.tw/arcgis/rest/services/NCDR/MOI_district/MapServer/0",
			// outFields: ["NAME", "GEOID"],
			title: "縣市分界圖層",
		});
		const fireBrigadeLayer = new FeatureLayer({
			url: "https://richimap1.richitech.com.tw/arcgis/rest/services/NCDR/NCDR_SDE_Point/MapServer/11",
			title: "消防隊圖層"
		});
		const hospitalLayer = new FeatureLayer({
			url: "https://richimap1.richitech.com.tw/arcgis/rest/services/NCDR/NCDR_SDE_Point/MapServer/2",
			title: "醫院圖層"
		});
		// 地震point樣式物件start
		const secondSymbolLayer = {
			type: "simple-marker",
			size: "10px",
			color: "#F6F50C",
			style: "circle",
			outline: {
				width: 0.5,
				color: "white"
			}
		}
		const thirdSymbolLayer = {
			type: "simple-marker",
			size: "40px",
			color: "#FF0000",
			style: "circle",
			outline: {
				width: 0.5,
				color: "white"
			}
		}
		// 地震point樣式物件end
		const renderer = {
			type: "class-breaks", // autocasts as new ClassBreaksRenderer()
			field: "mag",
			defaultLabel: "No data",
			defaultSymbol: {
				type: "simple-marker", // autocasts as new SimpleFillSymbol()
				color: "#F6F50C",
				style: "circle",
				outline: {
					width: 0.5,
					color: "white"
				}
			},
			classBreakInfos: [
				{
					minValue: 3,
					maxValue: 6,
					symbol: secondSymbolLayer,
				},
				{
					minValue: 7,
					maxValue: 20,
					symbol: thirdSymbolLayer,
				},
			]
		}
		// const renderer = {
		// 	type: "simple",
		// 	symbol: {
		// 		type: "simple-marker",
		// 		outline: {
		// 			color: [255, 255, 255, 0.7],
		// 			width: 0.5
		// 		}
		// 	},
		// 	visualVariables: [
		// 		{
		// 			type: "size",
		// 			field: "mag",
		// 			stops: [
		// 				{
		// 					value: 3,
		// 					size: 4
		// 				},
		// 				{
		// 					value: 7,
		// 					size: 40
		// 				}
		// 			]
		// 		},
		// 		{
		// 			type: "color",
		// 			field: "mag",
		// 			stops: [
		// 				{
		// 					value: 3,
		// 					color: "#F6F50C",
		// 				},
		// 				{
		// 					value: 7,
		// 					color: "#DC131A",
		// 				}
		// 			]
		// 		}
		// 	]
		// }
		const earthquakeLayer = new GeoJSONLayer({
			url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson",
			title: "地震圖層",
			id: "6", // client 做識別用
			renderer: renderer,
			definitionExpression: "mag >= 3",
			outFields: ["*"],
			popupTemplate: {
				title: "地震資訊",
				content: queryChargingStations
			}
		});
		function queryChargingStations (target) {
			let text = ``;
			let date = new Date(target.graphic.attributes.time);
			if (date.getHours() >= 0 && date.getHours() <= 12) {
				text = `上午`;
			} else if (date.getHours() > 12 && date.getHours() <= 24) {
				text = `下午`;
			}
			let content = `地震規模: ${target.graphic.attributes.mag}<br>
			地震時間: ${date.getFullYear()}/${date.getMonth() + 1}/${date.getDay()} ${text} ${date.getHours()}:${date.getMinutes()}`;
			return content;
		}

		// let earthquakeQuery = earthquakeLayer.createQuery();
		// earthquakeQuery.where = "mag >= 3";
		// earthquakeQuery.id="6";
		// earthquakeQuery.outFields = ["*"];
		//earthquakeLayer.queryFeatures(earthquakeQuery).then(function (result) {
		//console.log(result.features);
		//const renderer = {
		//type: "class-breaks",
		//field: "mag",
		// defaultSymbol: {
		// 	type: "simple-fill", // autocasts as new SimpleFillSymbol()
		// 	color: "red",
		// 	style: "backward-diagonal",
		// 	outline: {
		// 	  width: 0.5,
		// 	  color: [50, 50, 50, 0.6]
		// 	}
		// },
		// classBreakInfos: [
		// 	{
		// 		minValue: 1,
		// 		maxValue: 3,
		// 		symbol: {
		// 			type: "simple-marker",
		// 			symbolLayers: [baseSymbolLayer]
		// 		},
		// 	},
		// 	{
		// 		minValue: 3,
		// 		maxValue: 6,
		// 		symbol: {
		// 			type: "simple-marker",
		// 			symbolLayers: [baseSymbolLayer, secondSymbolLayer]
		// 		},
		// 	},
		// 	{
		// 		minValue: 7,
		// 		maxValue: 12,
		// 		symbol: {
		// 			type: "simple-marker",
		// 			symbolLayers: [baseSymbolLayer, secondSymbolLayer, thirdSymbolLayer]
		// 		},
		// 	},
		// ]
		//};
		// earthquakeLayer.renderer = renderer;
		// console.log(earthquakeLayer.renderer);
		//});
		const nuclearLayer = new WMSLayer({
			url: "https://dwgis.ncdr.nat.gov.tw/arcgis/services/ncdr/PowerPlant/MapServer/WmsServer",
			title: "核電廠圖層"
		});
		// 元件.add-view.ui.add---------------------------
		(scaleBar, "bottom-right");
		appConfig.mapView.ui.add(ccWidget, "bottom-right");
		// view.ui.add(layerList, "top-right");
		appConfig.mapView.ui.add(layerListExpand, "top-right");
		appConfig.mapView.ui.add(homeWidget, "top-right");
		appConfig.mapView.ui.add(locateWidget, "top-right");
		// view.ui.add(bmToggleWidget, "bottom-right");
		appConfig.mapView.ui.add(zoomWidget, "top-right"); // 加入自定義的zoom
		appConfig.mapView.ui.remove("zoom"); // 地圖預設的zoom刪除
		// 圖層.add----------------------------
		map.add(countyLayer);
		map.add(district);
		map.add(countyFeatureLayer);
		map.add(policeLayer);
		map.add(nuclearLayer);
		map.add(fireBrigadeLayer);
		map.add(hospitalLayer);
		map.add(tempGraphicsLayer);
		map.add(earthquakeLayer);
		//-------------------------------------
		checkLocate(); // 地圖生成後check switch狀態
		let layerArray = [district, countyFeatureLayer, policeLayer, nuclearLayer, fireBrigadeLayer, hospitalLayer, tempGraphicsLayer]; // 預設圖層關閉，減少雜亂顯示
		layerArray.forEach(item => {
			item.visible = false;
		})
		appConfig.mapView.ui.add({
			component: "optionsDiv",
			position: "bottom-right",
		});
		appConfig.mapView.ui.add({
			component: "switchIdentify",
			position: "bottom-right",
		});
		document.querySelector(".custom-widget-container ").append(document.getElementById("switchIdentify"));
		document.querySelector(".custom-widget-container ").append(document.getElementById("optionsDiv"));
		const sketchViewModel = new SketchViewModel({
			view: appConfig.mapView,
			layer: tempGraphicsLayer,
			pointSymbol: { // 點圖形樣式
				type: "simple-marker",
				style: "square",
				color: "rgb(255, 165, 0)",
				size: "16px",
				outline: {
					color: [255, 255, 255],
					width: 3,
				}
			},
			polylineSymbol: { // 線樣式
				type: "simple-line",
				color: "rgb(255, 165, 0)",
				width: "1",
				style: "dash"
			},
			polygonSymbol: { // 面樣式
				type: "simple-fill",
				color: "rgba(255, 165, 0, 0.8)",
				style: "solid",
				outline: {
					color: "white",
					width: 1
				}
			}
		});
		sketchViewModel.on("draw-complete", function (evt) {
			console.log(evt);
			if (evt.geometry.type === "multipoint") {
				evt.graphic.symbol = {
					type: "simple-marker",
					style: "square",
					color: "green",
					size: "16px",
					outline: {
						color: [255, 255, 255],
						width: 3
					}
				};
			}
			// 添加圖形到圖層
			tempGraphicsLayer.add(evt.graphic);
			setActiveButton();
		});

		sketchViewModel.on("create", event => {
			if (event.state === "complete") {
				const lat = event.graphic.geometry.latitude;
				const lng = event.graphic.geometry.longitude;
			}
		});
		var drawPointButton = document.getElementById("pointButton");
		drawPointButton.onclick = function () {
			sketchViewModel.create("point");
			setActiveButton(this);
		};

		/*********************************
		 * 啟動繪製多點功能
		 * ****************************/
		var drawMultipointButton = document.getElementById(
			"multipointButton");
		drawMultipointButton.onclick = function () {
			sketchViewModel.create("multipoint");
			setActiveButton(this);
		};

		/*********************************
		 * 啟動繪製線功能
		 * ****************************/
		var drawLineButton = document.getElementById("polylineButton");
		drawLineButton.onclick = function () {
			sketchViewModel.create("polyline");
			setActiveButton(this);
		};

		/*********************************
		 * 啟動繪製面功能
		 * ****************************/
		var drawPolygonButton = document.getElementById("polygonButton");
		drawPolygonButton.onclick = function () {
			sketchViewModel.create("polygon");
			setActiveButton(this);
		};

		/*********************************
		 * 重置 删除
		 * ****************************/
		document.getElementById("resetBtn").onclick = function () {
			tempGraphicsLayer.removeAll();
			sketchViewModel.delete();
			setActiveButton();
		};

		function setActiveButton(selectedButton) {
			appConfig.mapView.focus();
			var elements = document.getElementsByClassName("active");
			for (var i = 0; i < elements.length; i++) {
				elements[i].classList.remove("active");
			}
			if (selectedButton) {
				selectedButton.classList.add("active");
			}
		}

		const popupTemplate = {
			title: "Graphics information in {NAME}",
			content: graphicChange
		};
		tempGraphicsLayer.popupTemplate = popupTemplate;

		function graphicChange(graphicId, graphicType, graphicMappoint) {
			let date = Date.now();
			let graphicContent = document.createElement("div");
			graphicContent.innerHTML = `
				<p>GraphicID:${date}</p>
				<p>GraphType:${graphicType}</p>
			`;
			appConfig.mapView.popup.content = graphicContent;
			appConfig.mapView.popup.open({
				title: `圖層${graphicId}`,
				content: graphicContent,
				location: graphicMappoint,
			})
		}
		var mapClickHandler;
		document.getElementById("switch-shadow").onclick = function () {
			data.isActive = !data.isActive;
			checkLocate();
			if (data.isActive) {
				mapClickHandler = appConfig.mapView.on("click", mapClick);
			} else {
				mapClickHandler.remove();
			}
		}
		function mapClick(event) {
			console.log(event);
			checkLocate(); // view每click一次check switch btn active狀態
			let xSpot = document.querySelector('.coordinate-transform__x input'); // 側邊選單XY input座標值
			let ySpot = document.querySelector('.coordinate-transform__y input');
			let lng = document.querySelector('.coordinate-transform__lng input'); // 經緯度欄位
			let lat = document.querySelector('.coordinate-transform__lat input');
			lng.value = event.mapPoint.longitude;
			lat.value = event.mapPoint.latitude;
			const screenPoint = {
				x: event.x,
				y: event.y
			};
			xSpot.value = event.x;
			ySpot.value = event.y;
			appConfig.mapView.hitTest(screenPoint).then(function (res) {
				const graphic = res.results[0];
				if (res.results.length && graphic.graphic) {
					console.log(graphic);
					let graphicId = graphic.graphic.uid;
					let graphicType = graphic.graphic.geometry.type;
					let graphicMappoint = graphic.mapPoint;
					graphicChange(graphicId, graphicType, graphicMappoint);
				}
			})
			// 觸發executeIdentify函式處理Identify
			executeIdentify(event);
		}

		params = new IdentifyParameters(); // 全域的params賦值
		params.tolerance = 3;
		params.layerIds = [0, 1, 2, 3, 4];
		params.layerOption = "top";
		params.width = appConfig.mapView.width;
		params.height = appConfig.mapView.height;

		let highlight;
		appConfig.mapView.whenLayerView(countyFeatureLayer)
			.then(function (layerView) {
				let countySelectChange = document.getElementById("countySelect");
				let query = layerView.createQuery();
				countySelectChange.addEventListener("change", function () {
					let changeValue = countySelectChange.value
					query.where = "COUNTYCODE ='" + changeValue + "'";
					query.outFields = ["*"];
					query.returnGeometry = true;
					query.outSpatialReference = {
						wkid: 3857
					}; //view.spatialReference;
					query.returnQueryGeometry = true;
					countyFeatureLayer.queryFeatures(query).then(function (result) {
						console.log(result);
						appConfig.mapView.goTo(result.features[0].geometry);
						if (highlight) {
							highlight.remove();
						}
						highlight = layerView.highlight(result.features);
					});
				});

				// let countySelectChange = document.getElementById("countySelect");
				// countySelectChange.addEventListener("change", function () {
				// 	let query = countyFeatureLayer.createQuery();
				// 	let changeValue = countySelectChange.value
				// 	query.where = "COUNTYCODE ='" + changeValue + "'";
				// 	query.outFields = ["*"];
				// 	query.returnGeometry = true;
				// 	query.outSpatialReference = view.spatialReference; //{ wkid: 3857 };
				// 	query.returnQueryGeometry = true;
				// 	countyFeatureLayer.queryFeatures(query)
				// 		.then(function (response) {
				// 			console.log(response);
				// 			if (!response.features) {
				// 				return;
				// 			}
				// 			view.goTo(response.features[0].geometry);
				// 		})
				// })
			})
			.catch(function (error) {
				console.log(error);
			})

		function getDistrictInfo(feature) {
			let graphic, attributes;
			let content = document.createElement("div");
			graphic = feature.graphic;
			attributes = feature.graphic.attributes;
			for (let propertyName in attributes) {
				var attrPropValue = `<p>${propertyName}:${attributes[propertyName]}</p>`;
				content.innerHTML += attrPropValue;
			}
			return content;
		}

		function executeIdentify(event) {
			let attributes;
			// Set the geometry to the location of the view click
			params.geometry = event.mapPoint;
			params.mapExtent = appConfig.mapView.extent;
			params.layerIds = 1;
			identify.identify(districtUrl, params).then(function (response) {
				if (response.results.length && data.isActive) {
					attributes = response.results[0].feature.attributes;
					document.querySelector(".locate__content").innerHTML = "";
					var locateInfo = document.createElement("p");
					Object.entries(attributes).forEach(([key, value]) => {
						locateInfo.innerHTML += `
							${key}: ${value} <br>
						`;
					});
					document.querySelector(".locate__content").append(locateInfo);
				}
			})
		}

		function xmlConvertToJson(xmlData) {
			let x2js = new X2JS();
			let json = x2js.xml_str2json(xmlData);
			return json;
		}

		function getCountyData() { // 縣市資料
			axios.get("https://api.nlsc.gov.tw/other/ListCounty")
				.then((res) => {
					let responseData = xmlConvertToJson(res.data);
					responseData.countyItems.countyItem.forEach(item => {
						let opt = document.createElement('option');
						opt.textContent += item.countyname;
						opt.value = item.countycode01;
						document.getElementById("countySelect").appendChild(opt);
					});
				})
				.catch((err) => {
					alert("錯誤訊息:" + err);
				})
		};
		getCountyData();
	});
let transformSelect = '';
function transformWGS() {
	let option = document.querySelector(".transform-option");
	let lng = document.querySelector(".coordinate-transform__lng .input-container input");
	let lat = document.querySelector(".coordinate-transform__lat .input-container input");
	if (lng.value !== '' || lat.value !== '' || option.value !== '') {
		switch (transformSelect) {
			case "epsg4326to3826":
				console.log(transformSelect);
				let TWD97121 = helper.epsg4326to3826([lng.value, lat.value]);
				document.querySelector(".transform-result").textContent = TWD97121[0] + " , " + TWD97121[1];
				break;
			case "epsg4326to3825":
				console.log(transformSelect);
				let TWD97119 = helper.epsg4326to3825([lng.value, lat.value]);
				document.querySelector(".transform-result").textContent = TWD97119[0] + " , " + TWD97119[1];
				break;
			case "epsg4326to3857":
				console.log(transformSelect);
				let TWD3857 = helper.epsg4326to3857([lng.value, lat.value]);
				document.querySelector(".transform-result").textContent = TWD3857[0] + " , " + TWD3857[1];
				break;
			case "epsg4326to3824":
				console.log(transformSelect);
				let TWD3824 = helper.epsg4326to3824([lng.value, lat.value]);
				document.querySelector(".transform-result").textContent = TWD3824[0] + " , " + TWD3824[1];
				break;
			default:
				break;
		}
	} else {
		alert("請填寫座標值或是轉換座標格式尚未選擇；亦可點選地圖上任意位置以取得座標!!");
	}
}
function checkLocate() {
	if (data.isActive === false) {
		document.querySelector(".locate__content").innerHTML = `<p class="locate__content--onactive">請啟用地區資訊</p>`;
	}
}
function transformCoordinate(value) {
	transformSelect = value;
}