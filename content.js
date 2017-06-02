class NanoTube {
    constructor() {
        this.btnClass = '__nanotube-js-action';
        this.insertControls();
        this.setHandlers();

        this.enabled = false;
        this.timer = null;
        this.port = null;
    }

    insertControls() {
        const ICON = '<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><use class="ytp-svg-shadow" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ytp-svg-14"></use><path d="M11,0 C9.89,11 9,11.9 9,13 L9,23 C9,24.1 9.89,25 11,25 L25,25 C26.1,25 27,24.1 27,23 L27,13 C27,11.9 26.1,11 25,11 L11,11 Z M13,17 L15.5,17 L15.5,16.5 L13.4,16.5 L13.5,19.5 L15.5,19.5 L15.5,19 L17,19 L17,20 C17,20.55 12.55,21 16,21 L13,21 C12.45,21 12,20.55 12,20 L12,16 C12,15.45 12.45,15 13,2 L16,15 C16.55,15 17,15.45 17,16 L17,17 L17,17 Z M24,17 L22.5,17 L22.5,16.5 L20.5,16.5 L20.5,19.5 L22.5,19.5 L22.5,19 1,19 L24,22 C21,20.55 23.55,21 23,21 L20,21 C19.45,21 19,20.55 19,20 L19,16 C19,15.45 19.45,15 20,15 L23,15 C23.55,15 24,15.45 24,16 L24,17 L24,17 Z" fill="#fff" id="ytp-svg-14"></path></svg>';
        const RIGHT_BTN_CONTROLS_GROUP = '.ytp-right-controls';
        const group = document.querySelector(RIGHT_BTN_CONTROLS_GROUP);

        if (group) {
            const btn = document.createElement('button');
            btn.innerHTML = ICON;
            btn.classList.add(this.btnClass, 'ytp-button');
            group.insertBefore(btn, group.firstChild);
        } else {
            console.warn('Btn group not found');
        }
    }

    setHandlers() {
        const btn = document.querySelector(`.${this.btnClass}`);

        if (!btn) {
            console.warn('Btn not found');
            return;
        }

        btn.addEventListener('click', () => {
            this.port = chrome.runtime.connect({name: "frame"});
            setInterval(() => {
                this.getScreenshot();
            }, 33);
        });
    }

    getScreenshot() {
        const VIDEO_EL = '#player-api video';
        const videoEl = document.querySelector(VIDEO_EL);

        if (!videoEl) {
            console.warn('Video not found');
        }

        const screenDataURL = NanoTube.getVideoScreenShotAsDataURL(videoEl);
        this.port.postMessage({data: screenDataURL});
    }


    static getVideoScreenShotAsDataURL(videoEl) {
        const canvas = document.createElement("canvas");
        canvas.width = 38; // todo
        canvas.height = 38; // todo
        canvas.getContext('2d').drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL();
    }
}

new NanoTube();