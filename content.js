/*
 * nanoTube
 * Deliaz (c) 2017
 * https://github.com/Deliaz/nanotube
 *
 * Content-page script implementation
 */

class NanoTube {
	constructor() {
		this.settings = {
			UPDATE_FRAME_TIME: 40,
			CANVAS_WIDTH: 38,
			CANVAS_HEIGHT: 38,
			BUTTON_CLASS: '__nanotube-js-action',
			YT_VIDEO_SELECTOR: '#player-api video',

			ENABLE_ICON_DATA_SRC: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAAAflBMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9/f3////////////+/v7+/v7///////////////9t9QfYAAAAKXRSTlMA380C5QyDBcWzqmMU0sB/CNp8TPjsopySindzXVcpIxcSuqSiT0I6LsvG/sMAAACoSURBVDjL7dDJDoIwFIXhI7TUFimzzCDOvP8LihBDTEplITv+xc1dfKuDrTXKYzIUB3Y35CoQYTD7YIJ3Ywq0Mz9fKxcgUL4A4SQ0aFIXDZoSXaRBlTwLLvkzvWtQU5W+uIUUiQqxOpXXBkC7t4bhVIhmJOBRDRxGtFMiNwH88hc6Ao79D2QJwH8jI5tFXtiD4AHQPJxDhDEP8BjGo56gcIyvnAJbK/QCP/oMhgPo12sAAAAASUVORK5CYII=',
			DISABLE_ICON_DATA_SRC: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAAAb1BMVEUAAADjHiTjHiTkHiTrHiXkHiTjHiTkHiTlHiTmHiTnHiTkHiTkHiTkHiTjHiTlHiTjHiTkHiTjHiTkHiTkHiTlHiTlHiTkHiTmHiTqHiXjHiTjHiTkHiTkHiTkHiTjHiTjHiTmHiTrHyX0ICfkHiQtXq1HAAAAJHRSTlMA/viPEsDWoXY9K9y0ppxc5Mu8rYx7aiMcDvDv6c7Fk0kzCQTCYWc+AAAAlElEQVQ4y+3Oxw6DMBBF0WecUGxs00t68f9/YyBIoEgTwwJ23NVodKQZ7G0Rt94QL9g3TSA2TpINEcgbp3e6AKHNFiAcYutAk3KgqdyJqvMlSU6pUMaBmuhxVeL5gk+iusiCun/oyNFFnyuliW0zg0IN+GIOBR2K1kClAmSPbvf/yIRAIICWVxQidjTSlv1kc+xt0AcqqwWWGA4KOwAAAABJRU5ErkJggg=='
		};

		this.videoEl = document.querySelector(this.settings.YT_VIDEO_SELECTOR);
		if (!this.videoEl) {
			throw new Error('NanoTube: video element not found');
		}

		this.timer = null;
		this.enabled = false;
		this.connected = false;

		this.initCanvas();
		this.connect();
		this.insertControls();
		this.setHandlers();
	}

	/**
	 * Initiates convert-helper canvas
	 */
	initCanvas() {
		this.tempCanvas = document.createElement('canvas');
		this.tempCanvas.width = this.settings.CANVAS_WIDTH;
		this.tempCanvas.height = this.settings.CANVAS_HEIGHT;
		this.drawContext = this.tempCanvas.getContext('2d');
	}


	/**
	 * Connects to a opened port in the background page
	 */
	connect() {
		this.port = chrome.runtime.connect({name: 'frame'});
		this.port.onDisconnect.addListener(() => {
			this.connected = false;
			this.disable();
		});
		this.port.onMessage.addListener((msg) => {
			if (msg.action === 'reset') {
				this.disable();
			}
		});
		this.connected = true;
	}


	/**
	 * Inserts nanotube action button near youtube's controls
	 */
	insertControls() {
		const ICON = `<img style="width:36px; height: 36px;" src="${this.settings.ENABLE_ICON_DATA_SRC}">`;
		const RIGHT_BTN_CONTROLS_GROUP = '.ytp-right-controls';
		const group = document.querySelector(RIGHT_BTN_CONTROLS_GROUP);

		if (group) {
			this.button = document.createElement('button');
			this.button.innerHTML = ICON;
			this.button.classList.add(this.settings.BUTTON_CLASS, 'ytp-button');
			group.insertBefore(this.button, group.firstChild);
		} else {
			throw new Error('Btn group not found');
		}
	}


	/**
	 * Initiates nanotube button click handler
	 */
	setHandlers() {
		this.button.addEventListener('click', () => {
			if (!this.enabled) {
				this.enable();
			} else {
				this.disable();
			}
		});
	}


	/**
	 * Enables nanotube mode
	 */
	enable() {
		this.sendInit();
		this.timer = setInterval(() => {
			this.sendFrame();
		}, this.settings.UPDATE_FRAME_TIME);
		this.button.querySelector('img').src = this.settings.DISABLE_ICON_DATA_SRC;
		this.enabled = true;
	}


	/**
	 * Disables nanotube mode
	 */
	disable() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
		if (this.connected) {
			this.port.postMessage({
				action: 'reset'
			});
		}
		this.button.querySelector('img').src = this.settings.ENABLE_ICON_DATA_SRC;
		this.enabled = false;
	}


	/**
	 * Send init event
	 * It helps to reset other pages
	 */
	sendInit() {
		this.port.postMessage({
			action: 'init'
		});
	}


	/**
	 * Sends a frame from video to the background script
	 */
	sendFrame() {
		const screenDataURL = this.getVideoScreenShotAsDataURL(this.videoEl);
		this.port.postMessage({
			action: 'frame',
			data: screenDataURL
		});
	}


	/**
	 * Extracts a frame from video
	 * @param videoEl {Element}
	 * @returns {string}
	 */
	getVideoScreenShotAsDataURL(videoEl) {
		this.drawContext.drawImage(videoEl, 0, 0, this.tempCanvas.width, this.tempCanvas.height);
		return this.tempCanvas.toDataURL();
	}
}

// Run app
new NanoTube();