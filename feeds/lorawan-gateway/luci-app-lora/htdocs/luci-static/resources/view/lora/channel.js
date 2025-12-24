'use strict';
'require view';
'require form';
'require uci';

const tx_gain_lut_915_low = [
    { rf_power: 1, pa_gain: 0, pwr_idx: 5 },
    { rf_power: 2, pa_gain: 0, pwr_idx: 6 },
    { rf_power: 3, pa_gain: 0, pwr_idx: 7 },
    { rf_power: 4, pa_gain: 0, pwr_idx: 8 },
    { rf_power: 5, pa_gain: 0, pwr_idx: 9 },
    { rf_power: 6, pa_gain: 0, pwr_idx: 10 },
    { rf_power: 7, pa_gain: 0, pwr_idx: 11 },
    { rf_power: 8, pa_gain: 0, pwr_idx: 12 },
    { rf_power: 9, pa_gain: 0, pwr_idx: 13 },
    { rf_power: 10, pa_gain: 0, pwr_idx: 14 },
    { rf_power: 11, pa_gain: 0, pwr_idx: 15 },
    { rf_power: 12, pa_gain: 0, pwr_idx: 16 },
    { rf_power: 13, pa_gain: 0, pwr_idx: 17 },
    { rf_power: 14, pa_gain: 0, pwr_idx: 18 },
    { rf_power: 15, pa_gain: 0, pwr_idx: 19 },
    { rf_power: 16, pa_gain: 1, pwr_idx: 3 },
    { rf_power: 17, pa_gain: 1, pwr_idx: 4 },
    { rf_power: 18, pa_gain: 1, pwr_idx: 5 },
    { rf_power: 19, pa_gain: 1, pwr_idx: 6 },
    { rf_power: 20, pa_gain: 1, pwr_idx: 7 },
    { rf_power: 21, pa_gain: 1, pwr_idx: 8 },
    { rf_power: 22, pa_gain: 1, pwr_idx: 9 },
    { rf_power: 23, pa_gain: 1, pwr_idx: 11 },
    { rf_power: 24, pa_gain: 1, pwr_idx: 12 },
    { rf_power: 25, pa_gain: 1, pwr_idx: 13 },
    { rf_power: 26, pa_gain: 1, pwr_idx: 14 },
    { rf_power: 27, pa_gain: 1, pwr_idx: 15 }
];
const tx_gain_lut_915_high = [
    { rf_power: 1, pa_gain: 0, pwr_idx: 5 },
    { rf_power: 2, pa_gain: 0, pwr_idx: 6 },
    { rf_power: 3, pa_gain: 0, pwr_idx: 7 },
    { rf_power: 4, pa_gain: 0, pwr_idx: 8 },
    { rf_power: 5, pa_gain: 0, pwr_idx: 9 },
    { rf_power: 6, pa_gain: 0, pwr_idx: 10 },
    { rf_power: 7, pa_gain: 0, pwr_idx: 11 },
    { rf_power: 8, pa_gain: 0, pwr_idx: 12 },
    { rf_power: 9, pa_gain: 0, pwr_idx: 13 },
    { rf_power: 10, pa_gain: 0, pwr_idx: 14 },
    { rf_power: 11, pa_gain: 0, pwr_idx: 15 },
    { rf_power: 12, pa_gain: 0, pwr_idx: 16 },
    { rf_power: 13, pa_gain: 0, pwr_idx: 17 },
    { rf_power: 14, pa_gain: 0, pwr_idx: 18 },
    { rf_power: 15, pa_gain: 0, pwr_idx: 19 },
    { rf_power: 16, pa_gain: 1, pwr_idx: 3 },
    { rf_power: 17, pa_gain: 1, pwr_idx: 4 },
    { rf_power: 18, pa_gain: 1, pwr_idx: 5 },
    { rf_power: 19, pa_gain: 1, pwr_idx: 6 },
    { rf_power: 20, pa_gain: 1, pwr_idx: 7 },
    { rf_power: 21, pa_gain: 1, pwr_idx: 8 },
    { rf_power: 22, pa_gain: 1, pwr_idx: 9 },
    { rf_power: 23, pa_gain: 1, pwr_idx: 11 },
    { rf_power: 24, pa_gain: 1, pwr_idx: 12 },
    { rf_power: 25, pa_gain: 1, pwr_idx: 13 },
    { rf_power: 26, pa_gain: 1, pwr_idx: 14 },
    { rf_power: 27, pa_gain: 1, pwr_idx: 15 }
];
const tx_gain_lut_868_low = [
    { rf_power: 1, pa_gain: 0, pwr_idx: 4 },
    { rf_power: 2, pa_gain: 0, pwr_idx: 5 },
    { rf_power: 3, pa_gain: 0, pwr_idx: 6 },
    { rf_power: 4, pa_gain: 0, pwr_idx: 7 },
    { rf_power: 5, pa_gain: 0, pwr_idx: 8 },
    { rf_power: 6, pa_gain: 0, pwr_idx: 9 },
    { rf_power: 7, pa_gain: 0, pwr_idx: 10 },
    { rf_power: 8, pa_gain: 0, pwr_idx: 11 },
    { rf_power: 9, pa_gain: 0, pwr_idx: 12 },
    { rf_power: 10, pa_gain: 0, pwr_idx: 13 },
    { rf_power: 11, pa_gain: 0, pwr_idx: 14 },
    { rf_power: 12, pa_gain: 0, pwr_idx: 15 },
    { rf_power: 13, pa_gain: 0, pwr_idx: 16 },
    { rf_power: 14, pa_gain: 0, pwr_idx: 17 },
    { rf_power: 15, pa_gain: 0, pwr_idx: 18 },
    { rf_power: 16, pa_gain: 0, pwr_idx: 19 },
    { rf_power: 17, pa_gain: 1, pwr_idx: 1 },
    { rf_power: 18, pa_gain: 1, pwr_idx: 2 },
    { rf_power: 19, pa_gain: 1, pwr_idx: 3 },
    { rf_power: 20, pa_gain: 1, pwr_idx: 4 },
    { rf_power: 21, pa_gain: 1, pwr_idx: 5 },
    { rf_power: 22, pa_gain: 1, pwr_idx: 6 },
    { rf_power: 23, pa_gain: 1, pwr_idx: 7 },
    { rf_power: 24, pa_gain: 1, pwr_idx: 8 },
    { rf_power: 25, pa_gain: 1, pwr_idx: 10 },
    { rf_power: 26, pa_gain: 1, pwr_idx: 13 },
    { rf_power: 27, pa_gain: 1, pwr_idx: 16 }
];
const tx_gain_lut_868_high = [
    { rf_power: 1, pa_gain: 0, pwr_idx: 4 },
    { rf_power: 2, pa_gain: 0, pwr_idx: 5 },
    { rf_power: 3, pa_gain: 0, pwr_idx: 6 },
    { rf_power: 4, pa_gain: 0, pwr_idx: 7 },
    { rf_power: 5, pa_gain: 0, pwr_idx: 8 },
    { rf_power: 6, pa_gain: 0, pwr_idx: 9 },
    { rf_power: 7, pa_gain: 0, pwr_idx: 10 },
    { rf_power: 8, pa_gain: 0, pwr_idx: 11 },
    { rf_power: 9, pa_gain: 0, pwr_idx: 12 },
    { rf_power: 10, pa_gain: 0, pwr_idx: 13 },
    { rf_power: 11, pa_gain: 0, pwr_idx: 14 },
    { rf_power: 12, pa_gain: 0, pwr_idx: 15 },
    { rf_power: 13, pa_gain: 0, pwr_idx: 16 },
    { rf_power: 14, pa_gain: 0, pwr_idx: 17 },
    { rf_power: 15, pa_gain: 0, pwr_idx: 18 },
    { rf_power: 16, pa_gain: 0, pwr_idx: 19 },
    { rf_power: 17, pa_gain: 1, pwr_idx: 1 },
    { rf_power: 18, pa_gain: 1, pwr_idx: 2 },
    { rf_power: 19, pa_gain: 1, pwr_idx: 3 },
    { rf_power: 20, pa_gain: 1, pwr_idx: 4 },
    { rf_power: 21, pa_gain: 1, pwr_idx: 5 },
    { rf_power: 22, pa_gain: 1, pwr_idx: 6 },
    { rf_power: 23, pa_gain: 1, pwr_idx: 7 },
    { rf_power: 24, pa_gain: 1, pwr_idx: 8 },
    { rf_power: 25, pa_gain: 1, pwr_idx: 10 },
    { rf_power: 26, pa_gain: 1, pwr_idx: 13 },
    { rf_power: 27, pa_gain: 1, pwr_idx: 16 }
];

const tx_gain_lut_470 = [
    { rf_power: -6, pa_gain: 1, pwr_idx: 0 },
    { rf_power: -3, pa_gain: 1, pwr_idx: 1 },
    { rf_power: 0, pa_gain: 1, pwr_idx: 2 },
    { rf_power: 3, pa_gain: 0, pwr_idx: 3 },
    { rf_power: 6, pa_gain: 0, pwr_idx: 4 },
    { rf_power: 10, pa_gain: 0, pwr_idx: 5 },
    { rf_power: 11, pa_gain: 0, pwr_idx: 6 },
    { rf_power: 12, pa_gain: 0, pwr_idx: 7 },
    { rf_power: 13, pa_gain: 0, pwr_idx: 8 },
    { rf_power: 14, pa_gain: 0, pwr_idx: 9 },
    { rf_power: 16, pa_gain: 0, pwr_idx: 10 },
    { rf_power: 20, pa_gain: 0, pwr_idx: 11 },
    { rf_power: 23, pa_gain: 0, pwr_idx: 12 },
    { rf_power: 25, pa_gain: 0, pwr_idx: 13 },
    { rf_power: 26, pa_gain: 0, pwr_idx: 14 },
    { rf_power: 27, pa_gain: 0, pwr_idx: 15 }
];

var freq_plan_table = {
    "US915": {
        "plans": [
            {
                "file": "US_902_928_FSB_1",
                "title": "FSB1, channel 0 ~ channel 7, channel 64",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "US_902_928_FSB_2",
                "title": "FSB2, channel 8 ~ channel 15, channel 65",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "US_902_928_FSB_3",
                "title": "FSB3, channel 16 ~ channel 23, channel 66",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "US_902_928_FSB_4",
                "title": "FSB4, channel 24 ~ channel 31, channel 67",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "US_902_928_FSB_5",
                "title": "FSB5, channel 32 ~ channel 39, channel 68",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "US_902_928_FSB_6",
                "title": "FSB6, channel 40 ~ channel 47, channel 69",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "US_902_928_FSB_7",
                "title": "FSB7, channel 48 ~ channel 55, channel 70",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "US_902_928_FSB_8",
                "title": "FSB8, channel 56 ~ channel 63, channel 71",
                "mode": ["packet_forwarder"]
            }
        ],
        "device": "US915",
        "radio0": {
            "rssi_offset": -213.0,
            "tx_gain_lut": tx_gain_lut_915_high,
        },
        "radio1": {
            "rssi_offset": -213.0,
        }
    },
    "AU915": {
        "plans": [
            {
                "file": "AU_915_928_FSB_1",
                "title": "FSB1, channel 0 ~ channel 7, channel 64",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "AU_915_928_FSB_2",
                "title": "FSB2, channel 8 ~ channel 15, channel 65",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "AU_915_928_FSB_3",
                "title": "FSB3, channel 16 ~ channel 23, channel 66",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "AU_915_928_FSB_4",
                "title": "FSB4, channel 24 ~ channel 31, channel 67",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "AU_915_928_FSB_5",
                "title": "FSB5, channel 32 ~ channel 39, channel 68",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "AU_915_928_FSB_6",
                "title": "FSB6, channel 40 ~ channel 47, channel 69",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "AU_915_928_FSB_7",
                "title": "FSB7, channel 48 ~ channel 55, channel 70",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "AU_915_928_FSB_8",
                "title": "FSB8, channel 56 ~ channel 63, channel 71",
                "mode": ["packet_forwarder"]
            }
        ],
        "device": "US915",
        "radio0": {
            "rssi_offset": -213.0,
            "tx_gain_lut": tx_gain_lut_915_low,
        },
        "radio1": {
            "rssi_offset": -213.0,
        }
    },
    "AS923": {
        "plans": [
            {
                "file": "AS_920_923",
                "title": "Asia 920-923 MHz",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "AS_923_925_TTN",
                "title": "Asia 923-925 MHz",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "AS_920_923_LBT",
                "title": "Asia 920-923 MHz with LBT",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "AS_920_923_TTN_JP_1",
                "title": "Japan 920-923 MHz with LBT (channels 31-38)",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "AS_920_923_TTN_JP_2",
                "title": "Japan 920-923 MHz with LBT (channels 24-27 and 35-38)",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "AS_920_923_TTN_JP_3",
                "title": "Japan 920-923 MHz with LBT (channels 24-31)",
                "mode": ["packet_forwarder"]
            }
        ],
        "device": "US915",
        "radio0": {
            "rssi_offset": -213.0,
            "tx_gain_lut": tx_gain_lut_915_high,
        },
        "radio1": {
            "rssi_offset": -213.0,
        }
    },
    "KR920": {
        "plans": [
            {
                "file": "KR_920_923_TTN",
                "title": "South Korea 920-923 MHz",
                "mode": ["packet_forwarder"]
            }
        ],
        "device": "US915",
        "radio0": {
            "rssi_offset": -213.0,
            "tx_gain_lut": tx_gain_lut_915_high,
        },
        "radio1": {
            "rssi_offset": -213.0,
        }
    },
    "EU868": {
        "plans": [
            {
                "file": "EU_863_870_TTN",
                "title": "Europe 863-870 MHz",
                "mode": ["packet_forwarder"]
            }
        ],
        "device": "EU868",
        "radio0": {
            "rssi_offset": -215.0,
            "tx_gain_lut": tx_gain_lut_868_low,
        },
        "radio1": {
            "rssi_offset": -215.0,
        }
    },
    "IN865": {
        "plans": [
            {
                "file": "IN_865_867",
                "title": "India 865-867 MHz",
                "mode": ["packet_forwarder"]
            }
        ],
        "device": "EU868",
        "radio0": {
            "rssi_offset": -215.0,
            "tx_gain_lut": tx_gain_lut_868_high,
        },
        "radio1": {
            "rssi_offset": -215.0,
        }
    },
    "RU864": {
        "plans": [
            {
                "file": "RU_864_870_TTN",
                "title": "Russia 864-870 MHz",
                "mode": ["packet_forwarder"]
            }
        ],
        "device": "EU868",
        "radio0": {
            "rssi_offset": -215.0,
            "tx_gain_lut": tx_gain_lut_868_high,
        },
        "radio1": {
            "rssi_offset": -215.0,
        }
    },
    "CN470": {
        "plans": [
            {
                "file": "CN_470_510_FSB_1",
                "title": "FSB1, channel 0 ~ channel 7",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "CN_470_510_FSB_2",
                "title": "FSB2, channel 8 ~ channel 15",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "CN_470_510_FSB_3",
                "title": "FSB3, channel 16 ~ channel 23",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "CN_470_510_FSB_4",
                "title": "FSB4, channel 24 ~ channel 31",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "CN_470_510_FSB_5",
                "title": "FSB5, channel 32 ~ channel 39",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "CN_470_510_FSB_6",
                "title": "FSB6, channel 40 ~ channel 47",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "CN_470_510_FSB_7",
                "title": "FSB7, channel 48 ~ channel 55",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "CN_470_510_FSB_8",
                "title": "FSB8, channel 56 ~ channel 63",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "CN_470_510_FSB_9",
                "title": "FSB9, channel 64 ~ channel 71",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "CN_470_510_FSB_10",
                "title": "FSB10, channel 71 ~ channel 79",
                "mode": ["packet_forwarder"]
            },
            {
                "file": "CN_470_510_FSB_11",
                "title": "FSB11, channel 80 ~ channel 87",
                "mode": ["sensecap_ttn", "packet_forwarder"]
            },
            {
                "file": "CN_470_510_FSB_12",
                "title": "FSB12, channel 88 ~ channel 95",
                "mode": ["packet_forwarder"]
            }
        ],
        "device": "CN470",
        "radio0": {
            "rssi_offset": -207.0,
            "tx_gain_lut": tx_gain_lut_470,
        },
        "radio1": {
            "rssi_offset": -207.0,
        }
    }
}

return view.extend({
    setBasicStationRegion: function (region) {
        var rfconfSections = uci.sections("basicstation", "rfconf");
        var rfconf0 = rfconfSections.find(s => s['.name'] === 'rfconf0');
        if (rfconf0) {
            uci.set("basicstation", rfconf0['.name'], "rssiOffset", String(region.radio0.rssi_offset));
        }
        var rfconf1 = rfconfSections.find(s => s['.name'] === 'rfconf1');
        if (rfconf1) {
            uci.set("basicstation", rfconf1['.name'], "rssiOffset", String(region.radio1.rssi_offset));
        }
        // set txlut
        var txlutSections = uci.sections("basicstation", "txlut");
        var newLuts = region.radio0.tx_gain_lut;
        for (var j = 0; j < newLuts.length; j++) {
            var lut = newLuts[j];
            var sectionName;

            if (j < txlutSections.length) {
                sectionName = txlutSections[j]['.name'];
            } else {
                sectionName = uci.add("basicstation", "txlut");
            }

            uci.set("basicstation", sectionName, "rfPower", lut.rf_power);
            uci.set("basicstation", sectionName, "paGain", lut.pa_gain);
            uci.set("basicstation", sectionName, "pwrIdx", lut.pwr_idx);
            uci.set("basicstation", sectionName, "usedBy", "rfconf0");
        }

        // Avoid deleting sections while editing: it may trigger ubus "not found"
        // when users change channel-plan multiple times before Save & Apply.
        for (var k = newLuts.length; k < txlutSections.length; k++) {
            var sid = txlutSections[k]['.name'];
            uci.unset("basicstation", sid, "usedBy");
            uci.unset("basicstation", sid, "rfPower");
            uci.unset("basicstation", sid, "paGain");
            uci.unset("basicstation", sid, "pwrIdx");
        }
    },

    setLoRaRegion: function (region) {
        uci.set("packetforwarder", "sx130x", "region", region);
        this.setBasicStationRegion(freq_plan_table[region]);
    },

    setLoRaChannelPlan: function (channelPlan) {
        uci.set("packetforwarder", "@sx130x[0]", "channel_plan", channelPlan);
        // this.setBasicStationRegion(region);
    },

    load: function () {
        var platform = uci.get('lora', 'radio', 'platform') || 'chirpstack';
        var region = uci.get('lora', 'radio', 'region') || 'EU868';
        uci.load('basicstation');
        uci.load('packetforwarder');
        return uci.load('lora');
    },

    render: function () {
        var view = this;
        var m = new form.Map('lora', _('Channel Plan'), _('Configure LoRaWAN channel plan.'));
        var s = m.section(form.NamedSection, 'radio', 'radio', _('Channel Plan Settings'));
        s.anonymous = true;
        s.addremove = false;

        var device = uci.get('lora', 'radio', 'device') || 'US915';
        var region = s.option(form.ListValue, 'region', _('Region'));
        var valid_regions = [];

        region.write = function (section_id, value) {
            uci.set('lora', section_id, 'region', value);
            view.setLoRaRegion(value);
        };

        for (var r in freq_plan_table) {
            if (freq_plan_table[r].device == device) {
                valid_regions.push(r);
                region.value(r, r);
            }
        }

        var platform = uci.get('lora', 'radio', 'platform') || 'chirpstack';
        console.log("platform:", platform);
        if (platform === 'basic_station') {
            return m.render();
        }
        valid_regions.forEach(function (r) {
            var plans = freq_plan_table[r].plans;
            var o = s.option(form.ListValue, 'channel_plan_' + r, _('Channel-plan'), _('Select the channel-plan to use. This must be supported by the selected shield.'));
            o.depends('region', r);


            o.cfgvalue = function (section_id) {
                return uci.get('lora', section_id, 'channel_plan');
            };

            o.write = function (section_id, value) {
                uci.set('lora', section_id, 'channel_plan', value);
                view.setLoRaChannelPlan(value);
            };

            plans.forEach(function (p) {
                o.value(p.file, p.title);
            });
        });
        return m.render();
    }
});
