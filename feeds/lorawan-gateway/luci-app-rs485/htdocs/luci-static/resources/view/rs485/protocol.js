'use strict';
'require view';
'require form';
'require uci';
'require fs';

return view.extend({
    load: function() {
        return uci.load('rs485-module');
    },

    render: function() {
        var m = new form.Map('rs485-module', _('RS485 Protocol Settings'), 
            _('Configure RS485 protocol parameters'));
        
        var s = m.section(form.NamedSection, 'protocol', 'protocol');
        s.addremove = false;

        var o = s.option(form.DummyValue, "_header");
        o.rawhtml = true;
        o.cfgvalue = function() {
            return '<h3 style="margin-top:0;padding-top:10px;">Protocol Configuration</h3>';
        };

        o = s.option(form.Flag, 'enabled', _('Enable Protocol Processing'));
        o.default = '0';
        o.rmempty = false;

        o = s.option(form.ListValue, 'type', _('Protocol Type'));
        o.value('modbus-rtu', 'Modbus RTU');
        o.value('bacnet-mstp', 'BACnet MS/TP');
        o.value('custom', _('Custom Protocol'));
        o.default = 'modbus-rtu';

        // Modbus RTU Settings Header
        o = s.option(form.DummyValue, "_modbus_header");
        o.rawhtml = true;
        o.cfgvalue = function() {
            return '<h3 style="margin-top:20px;padding-top:10px;">Modbus RTU Settings</h3>';
        };
        o.depends('type', 'modbus-rtu');

        o = s.option(form.Value, 'device_address', _('Device Address'));
        o.datatype = 'range(1,247)';
        o.placeholder = '1';
        o.default = '1';
        o.depends('type', 'modbus-rtu');

        o = s.option(form.ListValue, 'function_code', _('Function Code'));
        o.value('01', '01 - Read Coils');
        o.value('02', '02 - Read Discrete Inputs');
        o.value('03', '03 - Read Holding Registers');
        o.value('04', '04 - Read Input Registers');
        o.value('05', '05 - Write Single Coil');
        o.value('06', '06 - Write Single Register');
        o.value('15', '15 - Write Multiple Coils');
        o.value('16', '16 - Write Multiple Registers');
        o.default = '03';
        o.depends('type', 'modbus-rtu');

        o = s.option(form.Value, 'register_address', _('Register Address'));
        o.datatype = 'uinteger';
        o.placeholder = '40001';
        o.default = '40001';
        o.depends('type', 'modbus-rtu');

        o = s.option(form.Value, 'data_length', _('Data Length'));
        o.datatype = 'range(1,125)';
        o.placeholder = '10';
        o.default = '10';
        o.depends('type', 'modbus-rtu');

        // Advanced Settings Header
        o = s.option(form.DummyValue, "_advanced_header");
        o.rawhtml = true;
        o.cfgvalue = function() {
            return '<h3 style="margin-top:20px;padding-top:10px;">Advanced</h3>';
        };

        o = s.option(form.Value, 'poll_interval', _('Polling Interval (ms)'));
        o.datatype = 'range(100,60000)';
        o.placeholder = '1000';
        o.default = '1000';

        o = s.option(form.Flag, 'enable_crc', _('Enable CRC Check'));
        o.default = '1';

        o = s.option(form.Button, '_show_frame_btn', _('Show Frame Data'));
        o.inputtitle = _('Read Data');
        o.inputstyle = 'apply';
        o.onclick = L.bind(function(ev) {
            var btn = ev.target;
            btn.disabled = true;
            btn.innerText = _('Reading...');
            
            return L.resolveDefault(fs.exec('/bin/ubus', ['call', 'sensecap', 'rs485_read_modbus']))
                .then(function(res) {
                    if (res && res.code === 0) {
                        try {
                            var result = JSON.parse(res.stdout);
                            var resultArea = document.getElementById('modbus_result');
                            if (result.success) {
                                if (resultArea) {
                                    resultArea.value = result.data;
                                    resultArea.style.color = '#000';
                                }
                            } else {
                                if (resultArea) {
                                    resultArea.value = 'Error: ' + (result.error || 'Unknown error');
                                    resultArea.style.color = '#d00';
                                }
                            }
                        } catch(e) {
                            var resultArea = document.getElementById('modbus_result');
                            if (resultArea) {
                                resultArea.value = 'Failed to parse response: ' + e.message;
                                resultArea.style.color = '#d00';
                            }
                        }
                    } else {
                        var resultArea = document.getElementById('modbus_result');
                        if (resultArea) {
                            resultArea.value = 'Failed to execute command';
                            resultArea.style.color = '#d00';
                        }
                    }
                })
                .catch(function(err) {
                    var resultArea = document.getElementById('modbus_result');
                    if (resultArea) {
                        resultArea.value = 'Error: ' + err.message;
                        resultArea.style.color = '#d00';
                    }
                })
                .finally(function() {
                    btn.disabled = false;
                    btn.innerText = _('Read Data');
                });
        }, this);

        // Result display area
        o = s.option(form.DummyValue, '_result_display', _('Frame Data Result'));
        o.rawhtml = true;
        o.cfgvalue = function() {
            return '<div style="margin-top:10px;">' +
                   '<textarea id="modbus_result" readonly style="width:100%;min-height:100px;font-family:monospace;padding:8px;background:#f5f5f5;border:1px solid #ddd;border-radius:4px;" placeholder="Click Read Data button to fetch Modbus data..."></textarea>' +
                   '</div>';
        };

        return m.render();
    }
});
