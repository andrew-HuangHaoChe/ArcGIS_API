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
		"esri/widgets/BasemapToggle",
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
		BasemapToggle,
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
	) {
		const countyUrl = "https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{level}/{row}/{col}"
		esriConfig.apiKey = "AAPK55baa15465db4dd8996a0910ba4a8ae2gg1flWiBmMpL9BDIdZgIgQuaibnyaEtjiIBqw7vs-ZjnUKiPXCz_sA1lyYOlrgB5";
		const tempGraphicsLayer = new GraphicsLayer();
		const map = new Map({
			basemap: "satellite", // Basemap layer service
			// layers: [tempGraphicsLayer]
		});
		const view = new MapView({
			container: "viewDiv",
			map: map,
			center: [121, 23.5],
			zoom: 7
		});
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
		const bmToggleWidget = new BasemapToggle({
			view: view,
			nextBasemap: "hybrid"
		});
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
		});
		esriConfig.request.interceptors.push({
			urls: "https://richimap1.richitech.com.tw/arcgis/rest/services/NCDR",
			before: function (params) {
				params.requestOptions.query.token = "1jEODLnMEyMKmcJR-uO_sbCZMHnP0uMD7OxDrOZi0OtgZzais3KwQ6z9AVjjQbCv";
			},
		});
		const townLayer = new MapImageLayer({
			url: "https://richimap1.richitech.com.tw/arcgis/rest/services/NCDR/MOI_district/MapServer/",
			sublayers: [{
				id: 1,
			}]
		});
		const policeLayer = new MapImageLayer({
			url: "https://richimap1.richitech.com.tw/arcgis/rest/services/NCDR/NCDR_SDE_Point/MapServer/",
			sublayers: [{
				id: 12,
			}]
		})
		const fireBrigadeLayer = new FeatureLayer({
			url: "https://richimap1.richitech.com.tw/arcgis/rest/services/NCDR/NCDR_SDE_Point/MapServer/11"
		});
		const hospitalLayer = new FeatureLayer({
			url: "https://richimap1.richitech.com.tw/arcgis/rest/services/NCDR/NCDR_SDE_Point/MapServer/2"
		});
		const nuclearLayer = new WMSLayer({
			url: "https://dwgis.ncdr.nat.gov.tw/arcgis/services/ncdr/PowerPlant/MapServer/WmsServer"
		});
		// 元件.add----------------------------
		view.ui.add(scaleBar, "bottom-left");
		view.ui.add(ccWidget, "bottom-left");
		view.ui.add(layerList, "top-right");
		view.ui.add(homeWidget, "top-right");
		view.ui.add(locateWidget, "top-right");
		view.ui.add(bmToggleWidget, "bottom-right");
		view.ui.add(zoomWidget, "top-right"); // 加入自定義的zoom
		view.ui.remove("zoom"); // 地圖預設的zoom刪除
		// 圖層.add----------------------------
		map.add(countyLayer);
		map.add(townLayer);
		map.add(policeLayer);
		map.add(nuclearLayer);
		map.add(fireBrigadeLayer);
		map.add(hospitalLayer);
		map.add(tempGraphicsLayer);
		//-------------------------------------
		view.on("click", function (event) {
			const screenPoint = {
				x: event.x,
				y: event.y
			};
			console.log(screenPoint);
			view.hitTest(screenPoint).then(function (res) {
				const graphic = res.results[0];
				if (res.results.length && graphic.graphic) {
					console.log(graphic);
					let graphicId = graphic.graphic.uid;
					let graphicType = graphic.graphic.geometry.type;
					graphicChange(graphicId, graphicType);
				}
			})
		});
		const popupTemplate = {
			title: "Graphics information in {NAME}",
			content: graphicChange
		};
		function graphicChange (graphicId, graphicType) {
			console.log(graphicType);
			let graphicContent = document.createElement("div");
			graphicContent.innerHTML = `
				<p>GraphicID:${graphicId}</p>
				<p>GraphType:${graphicType}</p>
			`;
			console.log(graphicContent);
			view.popup.content = graphicContent;
			view.popup.open({
				title: `圖層${graphicId}`,
				content: graphicContent,
			})
		}
		tempGraphicsLayer.popupTemplate = popupTemplate;
		view.when(function () {
			var sketchViewModel = new SketchViewModel({
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
					// console.log(view.popup);
					// console.log(event);
					// view.popup.open({
					// 	title: "test123",
					// 	content: `<p>GraphicID: ${event.graphic.uid}</p>`,
					// 	location: [lat, lng]
					// })
					// console.log(event);
					// view.popup.features = [event.graphic]
					// view.popup.visible = true
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
		});
	});