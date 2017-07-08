/*
 * nanoTube
 * Deliaz (c) 2017
 * https://github.com/Deliaz/nanotube
 *
 * Background script implementation
 */


// Listen for connections from content-scrips
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


// Create canvas for browser action icon
const canvas = document.createElement('canvas');
canvas.width = 38;
canvas.height = 38;
const ctx = canvas.getContext('2d');
const img = new Image;

// Set browser action icon when frame loaded from dataURL
img.onload = () => {
	ctx.drawImage(img, 0, 0);
	chrome.browserAction.setIcon({
		imageData: ctx.getImageData(0, 0, canvas.width, canvas.height)
	});
};


/**
 * Set frame
 * @param dataURL {string}
 */
function setFrame(dataURL) {
	img.src = dataURL;
}

/**
 * Reset icon to default
 */
function reset() {
	chrome.browserAction.setIcon({
		path: chrome.runtime.getURL('./default-icon.png')
	});
}

/**
 * Reset page by port
 * @param port {object}
 */
function resetPage(port) {
	port.postMessage({
		action: 'reset'
	});
}