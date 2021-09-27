class ExternalDependencySample {
    hitCounter = 0;

    constructor(ContentStationSdk) {
        this.ContentStationSdk = ContentStationSdk;
    }

    create() {
        this.ContentStationSdk.registerCustomApp({
            name: 'external-dependency-sample',
            title: 'External dependency sample',
            content: `<div style="padding: 30px">
              <h3 id="external-dependency-sample-title">Change me</h3>
              <button id="external-dependency-sample-button" class="cs-btn">Change title</button>
            </div>`,
            onInit: () => {
                this.init();
            },
        });
    }

    async init() {
        await this.loadDependencies();
        this.addHandlers();
    }

    async addScript(src, integrity, crossOrigin) {
        return new Promise((resolve, reject) => {
            // Use pure JS as we cannot assume jQuery is available.
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = src;
            script.integrity = integrity;
            script.crossOrigin = crossOrigin;
            script.onload = (event) => {
                resolve(event);
            };
            script.onerror = (event) => {
                reject(event);
            };
            document.head.appendChild(script);
        });
    }

    async loadJQuery() {
        // Source: https://code.jquery.com/
        await this.addScript(
            'https://code.jquery.com/jquery-3.5.1.min.js',
            'sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=',
            'anonymous',
        );
        // Ensure that our jQuery dependency is not conflicting with jQuery in the main application.
        this.$ = jQuery.noConflict();
    }

    async loadLodash() {
        // Source: https://cdnjs.com/libraries/lodash.js/
        await this.addScript(
            'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.19/lodash.min.js',
            'sha512-/A6lxqQJVUIMnx8B/bx/ERfeuJnqoWPJdUxN8aBj+tZYL35O998ry7UUGoN65PSUNlJNrqKZrDENi4i1c3zy4Q==',
            'anonymous',
        );
        // Ensure that our lodash dependency is not conflicting with lodash in the main application.
        this._ = _.noConflict();
    }

    async loadDependencies() {
        // Debug logging.
        console.log(jQuery ? `Main app jQuery version: ${$.fn.jquery}` : 'No jQuery available in main app');
        console.log(_ && _.VERSION ? `Main app lodash version: ${_.VERSION}` : 'No lodash available in main app');

        // Load our own jQuery and lodash.
        await this.loadJQuery();
        await this.loadLodash();

        // Debug logging.
        console.log(`Locally loaded jQuery version: ${this.$.fn.jquery}`);
        console.log(`Locally loaded lodash version: ${this._.VERSION}`);
    }

    addHandlers() {
        // We can do our magic using our locally loaded jQuery "this.$" and lodash "this._".
        this.$('#external-dependency-sample-button').click(() => {
            this.hitCounter++;
            const title = this._.capitalize(`tiTle CHange ${this.hitCounter}`);
            this.$('#external-dependency-sample-title').text(title);

            this.$.ajax({
                url: 'https://es-cloud-dev.enterprise-dev.woodwing.net/enterprise/index.php?protocol=JSON',
                headers: {
                    'X-WW-Application': 'Content Station'
                },
                method: 'post',
                body: {"method":"NamedQuery","params":[{"Params":[],"Query":"Inbox","FirstEntry":1,"MaxEntries":0,"Hierarchical":false}],"id":1000,"jsonrpc":"2.0"}
            }).then((result) => console.debug(result))
        });
    }
}

((ContentStationSdk) => {
    new ExternalDependencySample(ContentStationSdk).create();
})(ContentStationSdk);