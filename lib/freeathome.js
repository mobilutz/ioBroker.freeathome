'use strict';

const {
    SystemAccessPoint
} = require('freeathome-api');

module.exports = class FreeAtHomeApi {
    constructor(adap) {
        this._connected = false;
        this.adapter = adap;
        const options = this.adapter.config;
        const config = {
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
            debug: true
        };

        this.systemAccessPoint = new SystemAccessPoint(
            config,
            this,
        );
    }

    async start() {
        this.adapter.log.info('Starting free@home API');

        try {
            await this.systemAccessPoint.connect();
            this._connected = true;
            this.adapter.log.debug('connected to systemAccessPoint');
        } catch (e) {
            this._connected = false;
            this.adapter.log.debug('Could not connect to SysAp! - ' + JSON.stringify(e));
        }

        this.adapter.setState('info.connection', this._connected, 1);
    }

    async stop() {
        if (this._connected) {
            this.adapter.log.info('Stopping free@home API');
            await this.systemAccessPoint.disconnect();
            this._connected = false;
        }
        this.adapter.setState('info.connection', this._connected, 1);
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
                name: device.typeName,
                read: true,
                write: false,
            },
            native: {},
        });

        this.adapter.setObjectNotExists(serialNumber + '.deviceId', {
            type: 'state',
            common: {
                name: 'Device Identifer',
                desc: 'free@home internal identifier which type the device is.',
                read: true,
                write: false,
                role: 'text'
            },
            native: {}
        });
        this.adapter.setState(serialNumber + '.deviceId', device.deviceId, 1);

        if (device.channels) {
            const channels = device.channels;
            for (const channel in channels) {
                const channelData = channels[channel];

                this.adapter.setObjectNotExists(serialNumber + '.' + channel, {
                    type: 'channel',
                    common: {
                        name: 'Channel of the device',
                        role: 'meta',
                        read: true,
                        write: false
                    },
                    native: {}
                });

                const that = this;
                ['displayName', 'room', 'iconId', 'floor', 'functionId'].forEach(function(key) {
                    const value = channelData[key];
                    if (value != undefined) {
                        that.adapter.setObjectNotExists(serialNumber + '.' + channel + '.' + key, {
                            type: 'state',
                            common: {
                                name: key . ' value',
                                read: true,
                                write: false
                            },
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
                        common: {
                            name: 'RAW value',
                            read: true,
                            write: true
                        },
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
                const response = await this.systemAccessPoint.getDeviceData();
                return response;
            } catch (e) {
                this.adapter.log.debug('Error getting device data. Message: ' + e.message);
                return {};
            }
        }
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
