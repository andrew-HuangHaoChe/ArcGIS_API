axios.get("https://api.nlsc.gov.tw/other/ListCounty")
.then((res) => {
	console.log(res.data);
	let responseData = xmlConvertToJson(res.data);
	console.log(responseData);
})
.catch((err) => {
	alert("錯誤訊息:" + err);
})

function xmlConvertToJson (xmlData) {
	let x2js = new X2JS(); debugger;
	let json = x2js.xml_str2json(xmlData);
	return json;
}