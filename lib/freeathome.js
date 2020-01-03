"use strict";
const { SystemAccessPoint } = require("freeathome-api");

module.exports = class FreeAtHomeApi {
    constructor() {
        this._connected = false
        const config = {
            hostname: "10.0.0.50",
            username: "Test",
            password: "password1234",
        };

        this.systemAccessPoint = new SystemAccessPoint(
            config,
            this,      // instance to report broadcastMessages
        );
    }

    async start() {
        console.log("Starting free@home API");

        try {
            await this.systemAccessPoint.connect();
            this._connected = true
        } catch (e) {
            console.error("Could not connect to SysAp: ", e);
            this._connected = false
        }
    }

    async stop() {
        if (this._connected) {
            console.log("Stopping free@home API")
            await this.systemAccessPoint.disconnect()
            this._connected = false
        }
    }

    /**
     * @param message
     */
    broadcastMessage(message) {
        // Do nothing when receiving a message from SysAccessPoint

    }

    async getAllDevices() {
        if (this._connected) {
            console.log("Getting device info");
            try {
                const response = await this.systemAccessPoint.getDeviceData();
                console.log(response);
                return response;
            } catch (e) {
                console.error("Error getting device data", e);
                return {};
            }
        }
    }

    /**
     *
     * @param deviceId
     * @param channel
     * @param dataPoint
     * @param value
     * @returns {Promise<void>}
     */
    async set(deviceId, channel, dataPoint, value) {
        console.log(
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
