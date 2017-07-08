class NanoTube {
	constructor() {
		this.settings = {
			UPDATE_FRAME_TIME: 40,
			CANVAS_WIDTH: 38,
			CANVAS_HEIGHT: 38,
			BUTTON_CLASS: '__nanotube-js-action',
			YT_VIDEO_SELECTOR: '#player-api video',

			ENABLE_ICON_DATA_SRC: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QYLER0bIWB8kQAAASZJREFUWMPtlj1Ow0AQRt/Hj0QHVVrqGMQVcgNo6LgBoeQAOUTCQTgASs6A5EOko0GRkPhoFrSFLa/Ba1Lsa0a2x/Jb73g8UCgUCv+LUhNtT4Eb4KTh8lbSU8ibAI/Ae0PeWtL6z9a2p+5mGeXPW3IWXc86SnS6/V4hsGnJObZdSaolrWwDLPsuPlXoMMSNpEXiPS+A+5QFwEGOwrR9CdR9ZbIIBZnX6NQF8DD0lv1W5kpSDdShps5HE2qR+TkOhT4ZZcu6ZGxXQWqbXahLJnAX96lsQrZPE2QAPoC57fusQpLeoi+oTSYmfw1JWgFnCTLj9aHwptgboSHZO6HUxvgZ4ixlhGhgFuJuqC6cMg+lUA05MVbAdcvE2MUOeA7/tUKhUCj04QsNWupkqvRBowAAAABJRU5ErkJggg==',
			DISABLE_ICON_DATA_SRC: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QYLESI429kn3wAAASZJREFUWMPtljFOAzEQAGcDSHRJRUudA+UL+UHS0PEDoOQBPCLHQ3gASt4Q6R6RLk0UCYmluEVyEct75BxSeCTLkr3Sje29taFQKBT+F/EGKoyBOXB9YHoj8G5xN8ArsDsQtxRYHm2tMFbQRFsE8c+RmLfUty6dTg+/KwRWkZgrhUqgEai1HVt0XbxX6ML6lThWaXy2m+VPC4BBjsRUuAearjJZhExmHQzdAS99H9lfZSbS7lRjOXV7MqGIzDqoL7WVhPxHlpJRqExqk10oJWM8qrMEDI6UGTpkAL5oi+VTViGBbfAHxWRC8ueQQA2MHDKnq0O2U5yNUJ+cnZC3MH5bP1X/5RoytX7fVxX2vIc8rerzxVgBs8iLMcUe+LB7rVAoFApd+AEUO36sM2LNygAAAABJRU5ErkJggg=='
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

	initCanvas() {
		this.tempCanvas = document.createElement('canvas');
		this.tempCanvas.width = this.settings.CANVAS_WIDTH;
		this.tempCanvas.height = this.settings.CANVAS_HEIGHT;
		this.drawContext = this.tempCanvas.getContext('2d');
	}

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

	setHandlers() {
		this.button.addEventListener('click', () => {
			if (!this.enabled) {
				this.enable();
			} else {
				this.disable();
			}
		});
	}

	enable() {
		this.sendInit();
		this.timer = setInterval(() => {
			this.sendFrame();
		}, this.settings.UPDATE_FRAME_TIME);
		this.button.querySelector('img').src = this.settings.DISABLE_ICON_DATA_SRC;
		this.enabled = true;
	}

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

	sendInit() {
		this.port.postMessage({
			action: 'init'
		});
	}

	sendFrame() {
		const screenDataURL = this.getVideoScreenShotAsDataURL(this.videoEl);
		this.port.postMessage({
			action: 'frame',
			data: screenDataURL
		});
	}


	getVideoScreenShotAsDataURL(videoEl) {
		this.drawContext.drawImage(videoEl, 0, 0, this.tempCanvas.width, this.tempCanvas.height);
		return this.tempCanvas.toDataURL();
	}
}

new NanoTube();