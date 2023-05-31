'use strict';

const {
    SystemAccessPoint
} = require('freeathome-api');

// Reference: https://developer.eu.mybuildings.abb.com/fah_cloud/reference/functionids/
const functionIds = {
    '0': 'FID_SWITCH_SENSOR',
    '1': 'FID_DIMMING_SENSOR',
    '3': 'FID_BLIND_SENSOR',
    '4': 'FID_STAIRCASE_LIGHT_SENSOR',
    '5': 'FID_FORCE_ON_OFF_SENSOR',
    '6': 'FID_SCENE_SENSOR',
    '7': 'FID_SWITCH_ACTUATOR',
    '9': 'FID_SHUTTER_ACTUATOR',
    'A': 'FID_ROOM_TEMPERATURE_CONTROLLER_MASTER_WITH_FAN',
    'B': 'FID_ROOM_TEMPERATURE_CONTROLLER_SLAVE',
    'C': 'FID_WIND_ALARM_SENSOR',
    'D': 'FID_FROST_ALARM_SENSOR',
    'E': 'FID_RAIN_ALARM_SENSOR',
    'F': 'FID_WINDOW_DOOR_SENSOR',
    '11': 'FID_MOVEMENT_DETECTOR',
    '12': 'FID_DIMMING_ACTUATOR',
    '14': 'FID_RADIATOR_ACTUATOR',
    '15': 'FID_UNDERFLOOR_HEATING',
    '16': 'FID_FAN_COIL',
    '17': 'FID_TWO_LEVEL_CONTROLLER',
    '1A': 'FID_DES_DOOR_OPENER_ACTUATOR',
    '1B': 'FID_PROXY',
    '1D': 'FID_DES_LEVEL_CALL_ACTUATOR',
    '1E': 'FID_DES_LEVEL_CALL_SENSOR',
    '1F': 'FID_DES_DOOR_RINGING_SENSOR',
    '20': 'FID_DES_AUTOMATIC_DOOR_OPENER_ACTUATOR',
    '21': 'FID_DES_LIGHT_SWITCH_ACTUATOR',
    '23': 'FID_ROOM_TEMPERATURE_CONTROLLER_MASTER_WITHOUT_FAN',
    '24': 'FID_COOLING_ACTUATOR',
    '27': 'FID_HEATING_ACTUATOR',
    '28': 'FID_FORCE_UP_DOWN_SENSOR',
    '29': 'FID_HEATING_COOLING_ACTUATOR',
    '2A': 'FID_HEATING_COOLING_SENSOR',
    '2B': 'FID_DES_DEVICE_SETTINGS',
    '2E': 'FID_RGB_W_ACTUATOR',
    '2F': 'FID_RGB_ACTUATOR',
    '30': 'FID_PANEL_SWITCH_SENSOR',
    '31': 'FID_PANEL_DIMMING_SENSOR',
    '33': 'FID_PANEL_BLIND_SENSOR',
    '34': 'FID_PANEL_STAIRCASE_LIGHT_SENSOR',
    '35': 'FID_PANEL_FORCE_ON_OFF_SENSOR',
    '36': 'FID_PANEL_FORCE_UP_DOWN_SENSOR',
    '37': 'FID_PANEL_SCENE_SENSOR',
    '38': 'FID_PANEL_ROOM_TEMPERATURE_CONTROLLER_SLAVE',
    '39': 'FID_PANEL_FAN_COIL_SENSOR',
    '3A': 'FID_PANEL_RGB_CT_SENSOR',
    '3B': 'FID_PANEL_RGB_SENSOR',
    '3C': 'FID_PANEL_CT_SENSOR',
    '3D': 'FID_ADDITIONAL_HEATING_ACTUATOR',
    '3E': 'FID_RADIATOR_ACTUATOR_MASTER',
    '3F': 'FID_RADIATOR_ACTUATOR_SLAVE',
    '41': 'FID_BRIGHTNESS_SENSOR',
    '42': 'FID_RAIN_SENSOR',
    '43': 'FID_TEMPERATURE_SENSOR',
    '44': 'FID_WIND_SENSOR',
    '45': 'FID_TRIGGER',
    '47': 'FID_FCA_2_PIPE_HEATING',
    '48': 'FID_FCA_2_PIPE_COOLING',
    '49': 'FID_FCA_2_PIPE_HEATING_COOLING',
    '4A': 'FID_FCA_4_PIPE_HEATING_AND_COOLING',
    '4B': 'FID_WINDOW_DOOR_ACTUATOR',
    '4E': 'FID_INVERTER_INFO',
    '4F': 'FID_METER_INFO',
    '50': 'FID_BATTERY_INFO',
    '51': 'FID_PANEL_TIMER_PROGRAM_SWITCH_SENSOR',
    '55': 'FID_DOMUSTECH_ZONE',
    '56': 'FID_CENTRAL_HEATING_ACTUATOR',
    '57': 'FID_CENTRAL_COOLING_ACTUATOR',
    '59': 'FID_HOUSE_KEEPING',
    '5A': 'FID_MEDIA_PLAYER',
    '5B': 'FID_PANEL_ROOM_TEMPERATURE_CONTROLLER_SLAVE_FOR_BATTERY_DEVICE',
    '60': 'FID_PANEL_MEDIA_PLAYER_SENSOR',
    '61': 'FID_BLIND_ACTUATOR',
    '62': 'FID_ATTIC_WINDOW_ACTUATOR',
    '63': 'FID_AWNING_ACTUATOR',
    '64': 'FID_WINDOW_DOOR_POSITION_SENSOR',
    '65': 'FID_WINDOW_DOOR_POSITION_ACTUATOR',
    '66': 'FID_MEDIA_PLAYBACK_CONTROL_SENSOR',
    '67': 'FID_MEDIA_VOLUME_SENSOR',
    '68': 'FID_DISHWASHER',
    '69': 'FID_LAUNDRY',
    '6A': 'FID_DRYER',
    '6B': 'FID_OVEN',
    '6C': 'FID_FRIDGE',
    '6D': 'FID_FREEZER',
    '6E': 'FID_HOOD',
    '6F': 'FID_COFFEE_MACHINE',
    '70': 'FID_FRIDGE_FREEZER',
    '71': 'FID_TIMER_PROGRAM_OR_ALERT_SWITCH_SENSOR',
    '73': 'FID_CEILING_FAN_ACTUATOR',
    '74': 'FID_CEILING_FAN_SENSOR',
    '75': 'FID_SPLIT_UNIT_GATEWAY',
    '76': 'FID_ZONE',
    '77': 'FID_24H_ZONE',
    '78': 'FID_EXTERNAL_IR_SENSOR_BX80',
    '79': 'FID_EXTERNAL_IR_SENSOR_VXI',
    '7A': 'FID_EXTERNAL_IR_SENSOR_MINI',
    '7B': 'FID_EXTERNAL_IR_SENSOR_HIGH_ALTITUDE',
    '7C': 'FID_EXTERNAL_IR_SENSOR_CURTAIN',
    '7D': 'FID_SMOKE_DETECTOR',
    '7E': 'FID_CARBON_MONOXIDE_SENSOR',
    '7F': 'FID_METHANE_DETECTOR',
    '80': 'FID_GAS_SENSOR_LPG',
    '81': 'FID_FLOOD_DETECTION',
    '82': 'FID_DOMUS_CENTRAL_UNIT_NEXTGEN',
    '83': 'FID_THERMOSTAT',
    '84': 'FID_PANEL_DOMUS_ZONE_SENSOR',
    '85': 'FID_THERMOSTAT_SLAVE',
    '86': 'FID_DOMUS_SECURE_INTEGRATION',
    '87': 'FID_ADDITIONAL_COOLING_ACTUATOR',
    '88': 'FID_TWO_LEVEL_HEATING_ACTUATOR',
    '89': 'FID_TWO_LEVEL_COOLING_ACTUATOR',
    '8E': 'FID_GLOBAL_ZONE',
    '8F': 'FID_VOLUME_UP_SENSOR',
    '90': 'FID_VOLUME_DOWN_SENSOR',
    '91': 'FID_PLAY_PAUSE_SENSOR',
    '92': 'FID_NEXT_FAVORITE_SENSOR',
    '93': 'FID_NEXT_SONG_SENSOR',
    '94': 'FID_PREVIOUS_SONG_SENSOR',
    '95': 'FID_HOME_APPLIANCE_SENSOR',
    '96': 'FID_HEAT_SENSOR',
    '97': 'FID_ZONE_SWITCHING',
    '98': 'FID_SECURE_AT_HOME_FUNCTION',
    '99': 'FID_COMPLEX_CONFIGURATION',
    '9A': 'FID_DOMUS_CENTRAL_UNIT_BASIC',
    '9B': 'FID_DOMUS_REPEATER',
    '9C': 'FID_DOMUS_SCENE_TRIGGER',
    '9D': 'FID_DOMUSWINDOWCONTACT',
    '9E': 'FID_DOMUSMOVEMENTDETECTOR',
    '9F': 'FID_DOMUSCURTAINDETECTOR',
    'A0': 'FID_DOMUSSMOKEDETECTOR',
    'A1': 'FID_DOMUSFLOODDETECTOR',
    'A3': 'FID_PANEL_SUG_SENSOR',
    'A4': 'FID_TWO_LEVEL_HEATING_COOLING_ACTUATOR',
    'A5': 'FID_PANEL_THERMOSTAT_CONTROLLER_SLAVE',
    'A6': 'FID_WALLBOX',
    'A7': 'FID_PANEL_WALLBOX',
    'A8': 'FID_DOOR_LOCK_CONTROL',
    'AA': 'FID_VRV_GATEWAY'
};

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

        this.adapter.setState('info.connection', this._connected, true);
    }

    async stop() {
        if (this._connected) {
            this.adapter.log.info('Stopping free@home API');
            await this.systemAccessPoint.disconnect();
            this._connected = false;
        }
        this.adapter.setState('info.connection', this._connected, true);
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

    async addDeviceToioBroker(device) {
        const serialNumber = device.serialNumber;
        if (serialNumber == 'freeathome.0.ABB700000000') return; // We do not need SystemAccessPoint as device (for now)

        await this.adapter.setObjectNotExistsAsync(
            serialNumber,
            {
                type: 'device',
                common: {
                    type: 'string',
                    read: true,
                    write: false,
                    role: '',
                },
                native: {},
            }
        );

        await this.adapter.setObjectNotExistsAsync(
            serialNumber + '.deviceId',
            {
                type: 'state',
                common: {
                    type: 'string',
                    read: true,
                    write: false,
                    role: '',
                },
                native: {}
            }
        );
        await this.adapter.setStateAsync(serialNumber + '.deviceId', device.deviceId, true);

        if (device.channels) {
            const channels = device.channels;
            for (const channel in channels) {
                const channelData = channels[channel];

                await this.adapter.setObjectNotExistsAsync(
                    serialNumber + '.' + channel,
                    {
                        type: 'channel',
                        common: {
                            type: 'string',
                            read: true,
                            write: false,
                            role: '',
                        },
                        native: {}
                    }
                );

                const that = this;
                ['displayName', 'room', 'iconId', 'floor', 'functionId'].forEach(async function(key) {
                    const value = channelData[key];
                    if (value != undefined) {
                        if (key == 'displayName') {
                            // set displayName as command.name of the channel
                            await that.adapter.setObjectAsync(
                                serialNumber,
                                { type: 'device', common: { name: value, role: '' }, native: {}}
                            );
                        }

                        if (key == 'functionId') {
                            const mappedValue = functionIds[value];
                            await that.adapter.setStateAsync(
                                serialNumber + '.' + channel,
                                { type: 'channel', common: { name: mappedValue, role: '' }, native: {}}
                            );
                        }

                        await that.adapter.setObjectNotExistsAsync(
                            serialNumber + '.' + channel + '.' + key,
                            {
                                type: 'state',
                                common: {
                                    type: 'string',
                                    read: true,
                                    write: true,
                                    role: '',
                                },
                                native: {}
                            }
                        );
                        await that.adapter.setStateAsync(
                            serialNumber + '.' + channel + '.' + key,
                            value,
                            1
                        );
                    }
                });

                for (const datapoint in channelData.datapoints) {
                    const datapointData = channelData.datapoints[datapoint];
                    const ioObject = serialNumber + '.' + channel + '.' + datapoint;
                    await this.adapter.setObjectNotExistsAsync(
                        ioObject,
                        {
                            type: 'state',
                            common: {
                                type: 'string',
                                read: true,
                                write: true,
                                role: '',
                            },
                            native: {},
                        }
                    );
                    await this.adapter.setStateAsync(ioObject, datapointData, true);
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
