const activePorts = new Set();

chrome.runtime.onConnect.addListener(function (port) {
	port.onMessage.addListener(function (msg) {
		switch (msg.action) {
			case 'init':
				activePorts.forEach(resetPage);
				activePorts.add(port);
				break;
			case 'frame':
				setFrame(msg.data);
				break;
			case 'reset':
				activePorts.delete(port);
				reset();
		}
	});
	port.onDisconnect.addListener(() => {
		activePorts.delete(port);
		reset();
	});
});

const canvas = document.createElement('canvas');
canvas.width = 38;
canvas.height = 38;
const ctx = canvas.getContext('2d');
const img = new Image;

img.onload = () => {
	ctx.drawImage(img, 0, 0);
	chrome.browserAction.setIcon({
		imageData: ctx.getImageData(0, 0, canvas.width, canvas.height)
	});
};

function setFrame(dataURL) {
	img.src = dataURL;
}

function reset() {
	chrome.browserAction.setIcon({
		path: chrome.runtime.getURL('./default-icon.png')
	});
}

function resetPage(port) {
	port.postMessage({
		action: 'reset'
	});
}