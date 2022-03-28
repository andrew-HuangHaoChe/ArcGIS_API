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
	) {
		// https://wmts.nlsc.gov.tw/wmts/EMAP2/default/GoogleMapsCompatible/{level}/{row}/{col}
		const countyUrl = "https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{level}/{row}/{col}";
		const districtUrl = "https://richimap1.richitech.com.tw/arcgis/rest/services/NCDR/MOI_district/MapServer/";
		esriConfig.apiKey = "AAPK55baa15465db4dd8996a0910ba4a8ae2gg1flWiBmMpL9BDIdZgIgQuaibnyaEtjiIBqw7vs-ZjnUKiPXCz_sA1lyYOlrgB5";
		var params;
		const appConfig = {
			mapView: null,
			sceneView: null,
			activeView: null,
			container: "viewDiv" // use same container for views
		};
		const initialViewParams = {
			zoom: 7,
			center: [121, 23.5],
			container: appConfig.container,
			highlightOptions: {
				color: [255, 241, 58],
				fillOpacity: 0.4
			},
			map: map,
		};
		const tempGraphicsLayer = new GraphicsLayer({
			title: "sketch圖層"
		});
		const map = new Map({
			basemap: "satellite", // Basemap layer service
			// layers: [tempGraphicsLayer]
		});
		const view = new MapView({
			container: "viewDiv",
			map: map,
			center: [121, 23.5],
			zoom: 7,
			highlightOptions: {
				color: [255, 241, 58],
				fillOpacity: 0.4
			},
		});
		// create 2D view and and set active
		appConfig.mapView = createView(initialViewParams, "2d");
		appConfig.mapView.map = webmap;
		appConfig.activeView = appConfig.mapView;

		// create 3D view, won't initialize until container is set
		initialViewParams.container = null;
		initialViewParams.map = scene;
		appConfig.sceneView = createView(initialViewParams, "3d");

		// switch the view between 2D and 3D each time the button is clicked
		switchButton.addEventListener("click", () => {
			switchView();
		});
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
		watchUtils.whenTrue(view, "stationary", () => {
			// Get the new center of the view only when view is stationary.
			if (view.center) {
				const info = `
					<span> the view center changed. </span>
					x: ${view.center.x.toFixed(2)}
					y: ${view.center.y.toFixed(2)}
				`;
				displayMessage(info);
			}
			// Get the new extent of the view only when view is stationary.
			if (view.extent) {
				const info = `
					<span> the view extent changed: </span>
					<br> xmin: ${view.extent.xmin.toFixed(2)}
					xmax: ${view.extent.xmax.toFixed(2)}
					<br> ymin: ${view.extent.ymin.toFixed(2)}
					ymax: ${view.extent.ymax.toFixed(2)}
				`;
				displayMessage(info);
			}
		});

		function displayMessage(info) {
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

		// 元件-------------------------------

		const layerList = new LayerList({ // 圖層切換list
			view: view
		});
		const layerListExpand = new Expand({
			view: view,
			content: layerList,
		});
		// const bmToggleWidget = new BasemapToggle({
		// 	view: view,
		// 	nextBasemap: "hybrid"
		// });
		const locateWidget = new Locate({
			view: view,
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
			view: view,
			container: "zoom-widget"
		});
		const homeWidget = new Home({
			view: view
		});
		const ccWidget = new CoordinateConversion({
			view: view,
			container: "footer"
		});
		const scaleBar = new ScaleBar({
			view: view,
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
				params.requestOptions.query.token = "1jEODLnMEyMKmcJR-uO_sbCZMHnP0uMD7OxDrOZi0OtgZzais3KwQ6z9AVjjQbCv";
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
		const nuclearLayer = new WMSLayer({
			url: "https://dwgis.ncdr.nat.gov.tw/arcgis/services/ncdr/PowerPlant/MapServer/WmsServer",
			title: "核電廠圖層"
		});
		// 元件.add----------------------------
		view.ui.add(scaleBar, "bottom-right");
		view.ui.add(ccWidget, "bottom-right");
		// view.ui.add(layerList, "top-right");
		view.ui.add(layerListExpand, "top-right");
		view.ui.add(homeWidget, "top-right");
		view.ui.add(locateWidget, "top-right");
		// view.ui.add(bmToggleWidget, "bottom-right");
		view.ui.add(zoomWidget, "top-right"); // 加入自定義的zoom
		view.ui.remove("zoom"); // 地圖預設的zoom刪除
		// 圖層.add----------------------------
		map.add(countyLayer);
		map.add(district);
		map.add(countyFeatureLayer);
		map.add(policeLayer);
		map.add(nuclearLayer);
		map.add(fireBrigadeLayer);
		map.add(hospitalLayer);
		map.add(tempGraphicsLayer);
		//-------------------------------------


		view.when(function () {
			let layerArray = [district, countyFeatureLayer, policeLayer, nuclearLayer, fireBrigadeLayer, hospitalLayer, tempGraphicsLayer]; // 預設圖層關閉，減少雜亂顯示
			layerArray.forEach(item => {
				item.visible = false;
			})
			// view.ui.add("optionsDiv", "bottom-right");
			view.ui.add({
				component: "optionsDiv",
				position: "bottom-right",
				container: "footer"
			});
			const sketchViewModel = new SketchViewModel({
				view: view,
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
				view.focus();
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
				view.popup.content = graphicContent;
				view.popup.open({
					title: `圖層${graphicId}`,
					content: graphicContent,
					location: graphicMappoint,
				})
			}

			view.on("click", function (event) {
				console.log(event);
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
				view.hitTest(screenPoint).then(function (res) {
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
			});


			params = new IdentifyParameters(); // 全域的params賦值
			params.tolerance = 3;
			params.layerIds = [0, 1, 2, 3, 4];
			params.layerOption = "top";
			params.width = view.width;
			params.height = view.height;
		});

		let highlight;
		view.whenLayerView(countyFeatureLayer)
			.then(function (layerView) {
				console.log(countyFeatureLayer.spatialReference.wkid);
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
						view.goTo(result.features[0].geometry);
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
			params.mapExtent = view.extent;
			identify.identify(districtUrl, params).then(function (response) {
				if (response.results.length) {
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

function toggleLocateInfo() {
	let x = document.querySelector(".side-menu__content");
	console.log(x.style.display);
	console.log(123);
	if (x.style.display === "none") {
		x.style.display = "block";
	} else {
		x.style.display = "none";
	}
}

function checkInfo() {
	let locateContent = document.querySelector(".locate__content");
	if (locateContent && locateContent.childNodes.length !== 0) {
		document.getElementById("switch-shadow").checked = true;
	} else {
		document.querySelector('.switch--shadow').checked = false;
	}
}

function transformWGS() {
	let lng = document.querySelector(".coordinate-transform__lng input");
	let lat = document.querySelector(".coordinate-transform__lat input");
	console.log(lng.value, lat.value);
	if (lng.value !== '' || lat.value !== '') {
		let TWD97121 = helper.epsg4326to3826([lng.value, lat.value]);
		let TWD97119 = helper.epsg4326to3825([lng.value, lat.value]);
		let TWD3857 = helper.epsg4326to3857([lng.value, lat.value]);
		let TWD3824 = helper.epsg4326to3824([lng.value, lat.value]);
		document.querySelector(".transform-result__121").textContent = TWD97121[0] + " , " + TWD97121[1];
		document.querySelector(".transform-result__119").textContent = TWD97119[0] + " , " + TWD97119[1];
		document.querySelector(".transform-result__3857").textContent = TWD3857[0] + " , " + TWD3857[1];
		document.querySelector(".transform-result__3824").textContent = TWD3824[0] + " , " + TWD3824[1];
	} else {
		alert("請填寫座標值，或點選地圖上任意位置以取得座標!!");
	}
}