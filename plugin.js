class AjaxCallFromExternalSource {

    constructor(ContentStationSdk) {
        this.ContentStationSdk = ContentStationSdk;
    }

    create() {
        this.ContentStationSdk.registerCustomApp({
            name: 'ajax-call-from-external-source',
            title: 'Ajax Call From External Source',
            content: `<div style="padding: 30px">
              <button id="call-inbox-button" class="cs-btn">Call Inbox</button>
              <div id="inbox-result"></div>
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

    async loadDependencies() {
        // Load our own jQuery .
        await this.loadJQuery();
    }

    addHandlers() {
        // We can do our magic using our locally loaded jQuery "this.$" and lodash "this._".
        this.$('#external-dependency-sample-button').click(() => {
            this.$('#inbox-result').text('Loading');

            this.$.ajax({
                url: 'https://es-cloud-dev.enterprise-dev.woodwing.net/enterprise/index.php?protocol=JSON',
                headers: {
                    'x-woodwing-application': 'Content Station'
                },
                method: 'POST',
                data: JSON.stringify({
                    "method":"NamedQuery",
                    "params":[
                        {
                            "Params":[],
                            "Query":"Inbox",
                            "FirstEntry":1,
                            "MaxEntries":0,
                            "Hierarchical":false
                        }
                    ],
                    "id":1000,
                    "jsonrpc":"2.0"
                })
            }).then((result) => {
                this.$('#inbox-result').text(syntaxHighlight(JSON.stringify(result)));
            })
        });
    }

    syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
}

((ContentStationSdk) => {
    new AjaxCallFromExternalSource(ContentStationSdk).create();
})(ContentStationSdk);