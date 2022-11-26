'use strict';

const utils = require('@iobroker/adapter-core');
const { throws } = require('assert');
const FreeAtHomeApi = require('./lib/freeathome');

class Freeathome extends utils.Adapter {
    constructor(options) {
        super({
            ...options,
            name: 'freeathome',
        });
        this._registered = false;
        this.cron = null;
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        this._api = new FreeAtHomeApi(this);
        await this._api.start();

        this.subscribeStates('*');
    }

    onUnload(callback) {
        try {
            if (this.cron) clearInterval(this.cron);
            this._api.stop();
            callback();
        } catch (e) {
            callback();
        }
    }

    async registerAllDevices() {
        if (!this._registered) {
            this.cron = setInterval(function (self) {
                self.updateAllDevices();
            }, 60000, this);

            const devices = await this._api.getAllDevices();

            if (Object.keys(devices).length > 0) {
                this._registered = true;
                for (const identifier in devices) {
                    const device = devices[identifier];
                    this.log.debug('Adding device to ioBroker: ' + JSON.stringify(device));
                    this._api.addDeviceToioBroker(device);
                }
            }
        }
    }

    async updateAllDevices() {
        const devices = await this._api.getAllDevices();
        if (Object.keys(devices).length > 0) {
            for (const identifier in devices) {
                const device = devices[identifier];
                this.log.debug('Updating device on ioBroker: ' + JSON.stringify(device));
                this._api.addDeviceToioBroker(device);
            }
        }
    }

    async onStateChange(id, state) {
        this.log.info('Doing something on state change. ID: ' + id + ' STATE: ' + state);
        if (state) {
            this.registerAllDevices();
            if (!state.ack) {
                const actuator = id.split('.');
                // TODO: I need to add logic here, to see what should really happen?
                // complete up, complete down or something in between
                this._api.set(actuator[2], actuator[3], actuator[4], state.val);
            }
            this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            this.log.debug(`state ${id} deleted`);
        }
    }
}

if (module.parent) {
    module.exports = (options) => new Freeathome(options);
} else {
    new Freeathome();
}
