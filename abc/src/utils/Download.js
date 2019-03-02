export function downloadFile(fileName, dataType, content) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:'+ dataType + ';charset=utf-8,' + encodeURIComponent(content));
	element.setAttribute('download', fileName);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);

}