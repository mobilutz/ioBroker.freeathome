'use strict';

const utils = require('@iobroker/adapter-core');
const { json } = require('stream/consumers');
const axios = require('axios').default;
const WebSocket = require('ws');
var sysAP_ident;

class Bjfreeathome extends utils.Adapter {
    constructor(options) {
        super({
            ...options,
            name: 'bjfreeathome'
        })
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
        this.ws = null;
    }

    async onRead() {
        this.setState('info.connection', false, true);

        if (!this.config.serverip) {
            this.log.error('No host is configured, will not start anything!');
            return;
        }

        this.connectWS();
    }

    isaInteger(str) {
        if (typeof str != 'string') {
            return false;
        }

        const num = Number(str);

        if (Number.isInteger(num)) {
            return true;
        }

        return false;
    }

    async Dateset(datapoint, content) {
        let statetype;
        if (this.isaInteger(content)) {
            statetype = 'number';
            content = parseInt(content);
        } else {
            statetype = 'string';
        }

        await this.setObjectNotExistsAsync(
            datapoint,
            {
                type: 'state',
                common: {
                    name: datapoint,
                    type: statetype,
                    role: 'indicator',
                    read: true,
                    write: true
                },
                native: {}
            }
        );

        await this.setStateAsync(datapoint, { val: content, ack: true });
    }

    onUnload(callback) {
        try {
            this.setState('info.connection', false, true);
            callback();
        } catch (e) {
            callback();
        }
    }

    onStateChange(id, state) {
        if (state) {
            if (state.ack == false) {
                this.sendDevicestate(id, state);
                this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
            }
        } else {
            this.log.info(`state ${id} deleted`);
        }
    }

    async connectWS() {
        this.log.debug('Connect to WebSocket');
        try {
            this.ws = new WebSocket(
                `ws://${this.config.username}:${this.config.password}@${this.config.serverip}/fhapi/v1/api/ws`,
                { headers: '' }
            );
        } catch (error) {
            this.log.error(error);
            this.log.error('No WebSocketConnection possible');
        }

        this.ws.on('open', () => {
            this.log.info('WebSocket connected');
            this.setState('info.connection', true, false);
            this.loadDevises();
        });
        this.ws.on('error', (data) => {
            this.log.error(`WS error: ${data}`);
            this.setState('info.connection', false, true);
        });
        this.ws.on('close', (data) => {
            this.log.debug(data);
            this.setState('info.connection', false, true);
            this.log.info('WebSocket closed');
        });
        this.ws.on('message', async (data) => {
            for (const [key_1, obj_1] of Object.entries(JSON.parse(data))) {
                for (const [key_2, obj_2] of Object.entries(obj_1)) {
                    if (JSON.stringify(key_2).includes('datapoints')) {
                        for (const [key_3, obj_3] of Object.entries(obj_2)) {
                            const varname = this.removeQuotes(key_3).replace(/[/]/g, '.');
                            this.log.info(`Status empfangen: ${varname} => ${JSON.stringify(obj_3)}`);
                            let content = this.removeQuotes(obj_3);
                            if (this.isaInteger(content)) content = parseInt(content);
                            await this.setStateAsync(varname, { val: content, ack: true});
                        }
                    }
                }
            }
        });
    }

    sendDevicestate(deviceId, devicestate) {
        var new_deviceId;
        var count;
        const str_length = deviceId.length;

        count = 0;

        for (var i = 1; i < str_length; ++i) {
            if (devideId[i] == '.') count++;

            if (count == 1) new_deviceId =  deviceId.substring(i+2);
        }

        url = `http://${this.config.serverip}/fhapi/v1/api/rest/datapoint/${sysAP_ident}/${new_deviceId}`
        this.log.info(url);

        axios({
            method: 'put',
            url: url,
            data: this.removeQuotes(devicestate.val),
            auth: {
                username: this.config.username,
                password: this.config.password
            }
        }).then(
            (response) => { this.log.info(JSON.stringify(response.data)); },
            (error) => { this.log.info(error) ;}
        );
    }

    removeQuotes(string) {
        return JSON.stringify(string).replace(/["]/g, '');
    }

    loadDevises() {
        axios({
            method: 'get',
            url: `http://${this.config.serverip}/fhapi/v1/api/rest/configuration`,
            rejectUnauthorized: false,
            auth: {
                username: this.config.username,
                password: this.config.password
            }
        }).then((response) => {
            const fh_devised_data = response.data;
            for (const [key, obj] of Object.entries(fh_devised_data)) {
                sysAP_ident = this.removeQuotes(key);
                for (const [key_sub1, obj_sub1] of Object.entries(obj)) {
                    if (JSON.stringify(key_sub1).includes('devises')) {
                        for (const [key_sub2, obj_sub2] of Object.entries(obj_sub1)) {
                            for (const [key_sub3, obj_sub3] of Object.entries(obj_sub2)) {
                                if (JSON.stringify(key_sub3).includes('channels')) {
                                    for (const [key_sub4, obj_sub4] of Object.entries(obj_sub3)) {
                                        for (const [key_sub5, obj_sub5] of Object.entries(obj_sub4)) {
                                            if (JSON.stringify(key_sub5).includes('inputs') || JSON.stringify(key_sub5).includes('outputs')) {
                                                for (const [key_sub6, obj_sub6] of Object.entries(obj_sub5)) {
                                                    let varname = JSON.stringify(key_sub2) + '.' + JSON.stringify(key_sub4) + '.' + JSON.stringify(key_sub6);
                                                    varname = this.removeQuotes(varname);

                                                    this.Dataset(varname, this.removeQuotes(obj_sub6.value);
                                                }
                                            } else {
                                                let otherstates = JSON.stringify(key_sub2) + '.' + JSON.stringify(key_sub4) + '.' + JSON.stringify(key_sub5);
                                                otherstates = this.removeQuotes(otherstates);

                                                this.Dataset(otherstates, this.removeQuotes(obj_sub5.value));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
}

if (module.parent) {
    module.exports = (options) => new Bjfreeathome(options);
} else {
    new Bjfreeathome();
}
