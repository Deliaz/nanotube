chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        switch (msg.action) {
            case 'frame':
                setFrame(msg.data);
                break;
            case 'reset':
                reset();
        }
    });
    port.onDisconnect.addListener(reset);
});

// TODO reset in case of few ports
// TODO notify contens about other connections

const canvas = document.createElement('canvas'); // Create the canvas
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