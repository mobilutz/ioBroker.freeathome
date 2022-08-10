'use strict';

const {
    SystemAccessPoint
} = require('freeathome-api');
const WebSocket = require('ws');
const axios = require('axios').default;

module.exports = class FreeAtHomeApi {
    constructor(adapter) {
        this._connected = false;
        this.adapter = adapter;
        const options = this.adapter.config;
        this.config = {
            hostname: options.hostname,
            username: options.username,
            password: options.password,
            httpApi: {
                enabled: options.httpEnabled,
                address: options.httpIp,
                port: options.httpPort
            },
            wsApi: {
                enabled: options.wsEnabled,
                address: options.wsIp,
                port: options.wsPort
            },
            fhapi: options.fhapi,
            debug: true
        };
        this.ws = null;
        this.sysAP_ident = null;

        this.systemAccessPoint = new SystemAccessPoint(
            this.config,
            this,
        );
    }

    async start() {
        this.adapter.log.info('Starting free@home API');

        try {
            if (this.config.fhapi) {
                this.connectWS();
            } else {
                await this.systemAccessPoint.connect();
            }
            this._connected = true;
            this.adapter.log.debug('connected to systemAccessPoint');
        } catch (e) {
            this._connected = false;
            this.adapter.log.debug('Could not connect to SysAp! - ' + JSON.stringify(e));
        }

        this.adapter.setState('info.connection', this._connected, true);
    }

    async stop() {
        if (this._connected) {
            this.adapter.log.info('Stopping free@home API');
            if (this.config.fhapi) {
                this.ws.disconnect();
            } else {
                await this.systemAccessPoint.disconnect();
            }
            this._connected = false;
        }
        this.adapter.setState('info.connection', this._connected, true);
    }

    async connectWS() {
        this.log.debug('Connect to WebSocket');
        try {
            this.ws = new WebSocket(
                `ws://${this.config.username}:${this.config.password}@${this.config.hostname}/fhapi/v1/api/ws`,
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

    broadcastMessage(message) {
        this.adapter.log.debug('broadcastMessage: ' + JSON.stringify(message));
        const result = message.result;
        if (Object.keys(result.length > 0)) {
            for (const serial in result) {
                const actuator = result[serial];
                this.addDeviceToioBroker(actuator);
            }
        }
    }

    addDeviceToioBroker(device) {
        const serialNumber = device.serialNumber;
        this.adapter.setObjectNotExists(serialNumber, {
            type: 'device',
            common: {
                name: device.typeName
            },
            native: {},
        });

        this.adapter.setObjectNotExists(serialNumber + '.deviceId', {
            type: 'state',
            common: {},
            native: {}
        });
        this.adapter.setState(serialNumber + '.deviceId', device.deviceId, 1);

        if (device.channels) {
            const channels = device.channels;
            for (const channel in channels) {
                const channelData = channels[channel];

                this.adapter.setObjectNotExists(serialNumber + '.' + channel, {
                    type: 'channel',
                    common: {},
                    native: {}
                });

                const that = this;
                ['displayName', 'room', 'iconId', 'floor', 'functionId'].forEach(function(key) {
                    const value = channelData[key];
                    if (value != undefined) {
                        that.adapter.setObjectNotExists(serialNumber + '.' + channel + '.' + key, {
                            type: 'state',
                            common: {},
                            native: {}
                        });
                        that.adapter.setState(
                            serialNumber + '.' + channel + '.' + key,
                            value,
                            1
                        );
                    }
                });

                for (const datapoint in channelData.datapoints) {
                    const datapointData = channelData.datapoints[datapoint];
                    const ioObject = serialNumber + '.' + channel + '.' + datapoint;
                    this.adapter.setObjectNotExists(ioObject, {
                        type: 'state',
                        common: {},
                        native: {}
                    });
                    this.adapter.setState(ioObject, datapointData, 1);
                }
            }
        }
    }

    async getAllDevices() {
        if (this._connected) {
            this.adapter.log.debug('Getting device info');
            try {
                let response = null;
                if (this.config.fhapi) {
                    response = await this.fhLoadDevises();
                } else {
                    response = await this.systemAccessPoint.getDeviceData();
                }
                return response;
            } catch (e) {
                this.adapter.log.debug('Error getting device data. Message: ' + e.message);
                return {};
            }
        }
    }

    async fhLoadDevises() {
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
                this.sysAP_ident = this.removeQuotes(key);
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

                                                    this.Dataset(varname, this.removeQuotes(obj_sub6.value));
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

    async set(deviceId, channel, dataPoint, value) {
        this.adapter.log.debug(
            `Setting (device, channel, datapoint, value): ${deviceId}, ${channel}, ${dataPoint}, ${value}`
        );

        if (this._connected) {
            return await this.systemAccessPoint.setDatapoint(
                deviceId.toString(),
                channel.toString(),
                dataPoint.toString(),
                value.toString()
            );
        }
    }
};
