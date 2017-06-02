chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        setFrame(msg.data);
    });
});

function setFrame(dataURL) {
    const canvas = document.createElement('canvas'); // Create the canvas
    canvas.width = 38;
    canvas.height = 38;
    const ctx = canvas.getContext('2d');

    const img = new Image;
    img.src = dataURL;
    img.onload = () => {
        ctx.drawImage(img, 0, 0);

        chrome.browserAction.setIcon({
            imageData: ctx.getImageData(0, 0, 38, 38)
        });
    };
}