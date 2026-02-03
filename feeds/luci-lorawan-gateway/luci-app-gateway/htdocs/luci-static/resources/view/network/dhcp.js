'use strict';
'require view';
'require dom';
'require poll';
'require rpc';
'require uci';
'require form';
'require network';
'require validation';
'require tools.widgets as widgets';
'require tools.dnsrecordhandlers as drh';

var callHostHints, callDUIDHints, callDHCPLeases, CBILeaseStatus, CBILease6Status;

callHostHints = rpc.declare({
	object: 'luci-rpc',
	method: 'getHostHints',
	expect: { '': {} }
});

callDUIDHints = rpc.declare({
	object: 'luci-rpc',
	method: 'getDUIDHints',
	expect: { '': {} }
});

callDHCPLeases = rpc.declare({
	object: 'luci-rpc',
	method: 'getDHCPLeases',
	expect: { '': {} }
});

CBILeaseStatus = form.DummyValue.extend({
	renderWidget: function(section_id, option_id, cfgvalue) {
		return E([
			E('h4', _('Active DHCP Leases')),
			E('table', { 'id': 'lease_status_table', 'class': 'table' }, [
				E('tr', { 'class': 'tr table-titles' }, [
					E('th', { 'class': 'th' }, _('Hostname')),
					E('th', { 'class': 'th' }, _('IPv4 address')),
					E('th', { 'class': 'th' }, _('MAC address')),
					E('th', { 'class': 'th' }, _('Lease time remaining'))
				]),
				E('tr', { 'class': 'tr placeholder' }, [
					E('td', { 'class': 'td' }, E('em', _('Collecting data...')))
				])
			])
		]);
	}
});

CBILease6Status = form.DummyValue.extend({
	renderWidget: function(section_id, option_id, cfgvalue) {
		return E([
			E('h4', _('Active DHCPv6 Leases')),
			E('table', { 'id': 'lease6_status_table', 'class': 'table' }, [
				E('tr', { 'class': 'tr table-titles' }, [
					E('th', { 'class': 'th' }, _('Host')),
					E('th', { 'class': 'th' }, _('IPv6 address')),
					E('th', { 'class': 'th' }, _('DUID')),
					E('th', { 'class': 'th' }, _('Lease time remaining'))
				]),
				E('tr', { 'class': 'tr placeholder' }, [
					E('td', { 'class': 'td' }, E('em', _('Collecting data...')))
				])
			])
		]);
	}
});

function calculateNetwork(addr, mask) {
	addr = validation.parseIPv4(String(addr));

	if (!isNaN(mask))
		mask = validation.parseIPv4(network.prefixToMask(+mask));
	else
		mask = validation.parseIPv4(String(mask));

	if (addr == null || mask == null)
		return null;

	return [
		[
			addr[0] & (mask[0] >>> 0 & 255),
			addr[1] & (mask[1] >>> 0 & 255),
			addr[2] & (mask[2] >>> 0 & 255),
			addr[3] & (mask[3] >>> 0 & 255)
		].join('.'),
		mask.join('.')
	];
}

function generateDnsmasqInstanceEntry(data) {
	const nameValueMap = new Map(Object.entries(data));
	let formatString = nameValueMap.get('.index') + ' (' +  _('Name') + (nameValueMap.get('.anonymous') ? ': dnsmasq[' + nameValueMap.get('.index') + ']': ': ' + nameValueMap.get('.name'));

	if (data.domain) {
		formatString += ', ' +  _('Domain')  + ': ' + data.domain;
	}
	if (data.local) {
		formatString += ', ' +  _('Local')  + ': ' + data.local;
	}
	formatString += ')';

	return [nameValueMap.get('.name'), formatString];
}

function getDHCPPools() {
	return uci.load('dhcp').then(function() {
		let sections = uci.sections('dhcp', 'dhcp'),
		    tasks = [], pools = [];

		for (var i = 0; i < sections.length; i++) {
			if (sections[i].ignore == '1' || !sections[i].interface)
				continue;

			tasks.push(network.getNetwork(sections[i].interface).then(L.bind(function(section_id, net) {
				var cidr = net ? (net.getIPAddrs()[0] || '').split('/') : null;

				if (cidr && cidr.length == 2) {
					var net_mask = calculateNetwork(cidr[0], cidr[1]);

					pools.push({
						section_id: section_id,
						network: net_mask[0],
						netmask: net_mask[1]
					});
				}
			}, null, sections[i]['.name'])));
		}

		return Promise.all(tasks).then(function() {
			return pools;
		});
	});
}

function validateHostname(sid, s) {
	if (s == null || s == '')
		return true;

	if (s.length > 256)
		return _('Expecting: %s').format(_('valid hostname'));

	var labels = s.replace(/^\*?\.?|\.$/g, '').split(/\./);

	for (var i = 0; i < labels.length; i++)
		if (!labels[i].match(/^[a-z0-9_](?:[a-z0-9-]{0,61}[a-z0-9])?$/i))
			return _('Expecting: %s').format(_('valid hostname'));

	return true;
}

function validateAddressList(sid, s) {
	if (s == null || s == '')
		return true;

	var m = s.match(/^\/(.+)\/$/),
	    names = m ? m[1].split(/\//) : [ s ];

	for (var i = 0; i < names.length; i++) {
		var res = validateHostname(sid, names[i]);

		if (res !== true)
			return res;
	}

	return true;
}

function validateServerSpec(sid, s) {
	if (s == null || s == '')
		return true;

	var m = s.match(/^(\/.*\/)?(.*)$/);
	if (!m)
		return _('Expecting: %s').format(_('valid hostname'));

	if (m[1] != '//' && m[1] != '/#/') {
		var res = validateAddressList(sid, m[1]);
		if (res !== true)
			return res;
	}

	if (m[2] == '' || m[2] == '#')
		return true;

	// ipaddr%scopeid#srvport@source@interface#srcport

	m = m[2].match(/^([0-9a-f:.]+)(?:%[^#@]+)?(?:#(\d+))?(?:@([0-9a-f:.]+)(?:@[^#]+)?(?:#(\d+))?)?$/);

	if (!m)
		return _('Expecting: %s').format(_('valid IP address'));

	if (validation.parseIPv4(m[1])) {
		if (m[3] != null && !validation.parseIPv4(m[3]))
			return _('Expecting: %s').format(_('valid IPv4 address'));
	}
	else if (validation.parseIPv6(m[1])) {
		if (m[3] != null && !validation.parseIPv6(m[3]))
			return _('Expecting: %s').format(_('valid IPv6 address'));
	}
	else {
		return _('Expecting: %s').format(_('valid IP address'));
	}

	if ((m[2] != null && +m[2] > 65535) || (m[4] != null && +m[4] > 65535))
		return _('Expecting: %s').format(_('valid port value'));

	return true;
}

function expandAndFormatMAC(macs) {
	let result = [];

	macs.forEach(mac => {
		if (isValidMAC(mac)) {
			const expandedMac = mac.split(':').map(part => {
				return (part.length === 1 && part !== '*') ? '0' + part : part;
			}).join(':').toUpperCase();
			result.push(expandedMac);
		}
	});

	return result.length ? result : null;
}

function isValidMAC(sid, s) {
	if (!s)
		return true;

	let macaddrs = L.toArray(s);

	for (var i = 0; i < macaddrs.length; i++)
		if (!macaddrs[i].match(/^(([0-9a-f]{1,2}|\*)[:-]){5}([0-9a-f]{1,2}|\*)$/i))
			return _('Expecting a valid MAC address, optionally including wildcards') + _('; invalid MAC: ') + macaddrs[i];

	return true;
}

function validateMACAddr(pools, sid, s) {
	if (s == null || s == '')
		return true;

	var leases = uci.sections('dhcp', 'host'),
	    this_macs = L.toArray(s).map(function(m) { return m.toUpperCase() });

	for (var i = 0; i < pools.length; i++) {
		var this_net_mask = calculateNetwork(this.section.formvalue(sid, 'ip'), pools[i].netmask);

		if (!this_net_mask)
			continue;

		for (var j = 0; j < leases.length; j++) {
			if (leases[j]['.name'] == sid || !leases[j].ip)
				continue;

			var lease_net_mask = calculateNetwork(leases[j].ip, pools[i].netmask);

			if (!lease_net_mask || this_net_mask[0] != lease_net_mask[0])
				continue;

			var lease_macs = L.toArray(leases[j].mac).map(function(m) { return m.toUpperCase() });

			for (var k = 0; k < lease_macs.length; k++)
				for (var l = 0; l < this_macs.length; l++)
					if (lease_macs[k] == this_macs[l])
						return _('The MAC address %h is already used by another static lease in the same DHCP pool').format(this_macs[l]);
		}
	}

	return isValidMAC(sid, s);
}

return view.extend({
	load: function() {
		return Promise.all([
			callHostHints(),
			callDUIDHints(),
			getDHCPPools(),
			network.getNetworks(),
			uci.load('firewall')
		]);
	},

	render: function(hosts_duids_pools) {
		var has_dhcpv6 = L.hasSystemFeature('dnsmasq', 'dhcpv6') || L.hasSystemFeature('odhcpd'),
		    hosts = hosts_duids_pools[0],
		    duids = hosts_duids_pools[1],
		    pools = hosts_duids_pools[2],
		    networks = hosts_duids_pools[3],
		    m, s, o, ss, so, dnss;

		let noi18nstrings = {
			etc_hosts: '<code>/etc/hosts</code>',
			etc_ethers: '<code>/etc/ethers</code>',
			localhost_v6: '<code>::1</code>',
			loopback_slash_8_v4: '<code>127.0.0.0/8</code>',
			not_found: '<code>Not found</code>',
			nxdomain: '<code>NXDOMAIN</code>',
			rfc_1918_link: '<a href="https://www.rfc-editor.org/rfc/rfc1918">RFC1918</a>',
			rfc_4193_link: '<a href="https://www.rfc-editor.org/rfc/rfc4193">RFC4193</a>',
			rfc_4291_link: '<a href="https://www.rfc-editor.org/rfc/rfc4291">RFC4291</a>',
			rfc_6303_link: '<a href="https://www.rfc-editor.org/rfc/rfc6303">RFC6303</a>',
			reverse_arpa: '<code>*.IN-ADDR.ARPA,*.IP6.ARPA</code>',
			servers_file_entry01: '<code>server=1.2.3.4</code>',
			servers_file_entry02: '<code>server=/domain/1.2.3.4</code>',

		};

		const recordtypes = [
			'ANY',
			'A',
			'AAAA',
			'ALIAS',
			'CAA',
			'CERT',
			'CNAME',
			'DS',
			'HINFO',
			'HIP',
			'HTTPS',
			'KEY',
			'LOC',
			'MX',
			'NAPTR',
			'NS',
			'OPENPGPKEY',
			'PTR',
			'RP',
			'SIG',
			'SOA',
			'SRV',
			'SSHFP',
			'SVCB',
			'TLSA',
			'TXT',
			'URI',
		]

		function customi18n(template, values) {
			if (!values)
				values = noi18nstrings;
			return template.replace(/\{(\w+)\}/g, (match, key) => values[key] || match);
		};

		m = new form.Map('dhcp', _('DHCP and DNS'),
			_('Dnsmasq is a lightweight <abbr title="Dynamic Host Configuration Protocol">DHCP</abbr> server and <abbr title="Domain Name System">DNS</abbr> forwarder.'));

		s = m.section(form.TypedSection, 'dnsmasq');
		s.anonymous = false;
		s.addremove = true;
		s.addbtntitle = _('Add server instance', 'Dnsmasq instance');

		s.renderContents = function(/* ... */) {
			var renderTask = form.TypedSection.prototype.renderContents.apply(this, arguments),
			    sections = this.cfgsections();

			return Promise.resolve(renderTask).then(function(nodes) {
				if (sections.length < 2) {
					nodes.querySelector('#cbi-dhcp-dnsmasq > h3').remove();
					nodes.querySelector('#cbi-dhcp-dnsmasq > .cbi-section-remove').remove();
				}
				else {
					nodes.querySelectorAll('#cbi-dhcp-dnsmasq > .cbi-section-remove').forEach(function(div, i) {
						var section = uci.get('dhcp', sections[i]),
						    hline = div.nextElementSibling,
						    btn = div.firstElementChild;

						if (!section || section['.anonymous']) {
							hline.innerText = i ? _('Unnamed instance #%d', 'Dnsmasq instance').format(i+1) : _('Default instance', 'Dnsmasq instance');
							btn.innerText = i ? _('Remove instance #%d', 'Dnsmasq instance').format(i+1) : _('Remove default instance', 'Dnsmasq instance');
						}
						else {
							hline.innerText = _('Instance "%q"', 'Dnsmasq instance').format(section['.name']);
							btn.innerText = _('Remove instance "%q"', 'Dnsmasq instance').format(section['.name']);
						}
					});
				}

				nodes.querySelector('#cbi-dhcp-dnsmasq > .cbi-section-create input').placeholder = _('New instance name…', 'Dnsmasq instance');

				return nodes;
			});
		};


		s.tab('general', _('General'));
		s.tab('forward', _('Forwards'));
		s.tab('logging', _('Log'));
		s.tab('pxe_tftp', _('PXE/TFTP'));

		s.taboption('general', form.Flag, 'authoritative',
			_('Authoritative'),
			_('This is the only DHCP server in the local network.'));

		o = s.taboption('general', form.Value, 'local',
			_('Resolve these locally'),
			_('Never forward these matching domains or subdomains; resolve from DHCP or hosts files only.'));
		o.placeholder = '/internal.example.com/private.example.com/example.org';

		s.taboption('general', form.Value, 'domain',
			_('Local domain'),
			_('Local domain suffix appended to DHCP names and hosts file entries.'));

		s.taboption('general', form.Flag, 'expandhosts',
			_('Expand hosts'),
			_('Add local domain suffix to names served from hosts files.'));

		o = s.taboption('logging', form.Flag, 'logqueries',
			_('Log queries'),
			_('Write received DNS queries to syslog.') + ' ' + _('Dump cache on SIGUSR1, include requesting IP.'));
		o.optional = true;

		o = s.taboption('logging', form.Flag, 'logdhcp',
			_('Extra DHCP logging'),
			_('Log all options sent to DHCP clients and the tags used to determine them.'));
		o.optional = true;

		o = s.taboption('logging', form.Value, 'logfacility',
			_('Log facility'),
			_('Set log class/facility for syslog entries.'));
		o.optional = true;
		o.value('KERN');
		o.value('USER');
		o.value('MAIL');
		o.value('DAEMON');
		o.value('AUTH');
		o.value('LPR');
		o.value('NEWS');
		o.value('UUCP');
		o.value('CRON');
		o.value('LOCAL0');
		o.value('LOCAL1');
		o.value('LOCAL2');
		o.value('LOCAL3');
		o.value('LOCAL4');
		o.value('LOCAL5');
		o.value('LOCAL6');
		o.value('LOCAL7');
		o.value('-', _('stderr'));

		o = s.taboption('forward', form.DynamicList, 'server',
			_('DNS Forwards'),
			_('Forward specific domain queries to specific upstream servers.'));
		o.optional = true;
		o.placeholder = '/*.example.org/10.1.2.3';
		o.validate = validateServerSpec;

		o = s.taboption('general', form.DynamicList, 'address',
			_('Addresses'),
			_('Resolve specified FQDNs to an IP.') + '<br />' +
			customi18n(_('Syntax: {code_syntax}.'),
				{code_syntax: '<code>/fqdn[/fqdn…]/[ipaddr]</code>'}) + '<br />' +
			customi18n(_('{example_nx} returns {nxdomain}.',
				'hint: <code>/example.com/</code> returns <code>NXDOMAIN</code>.'),
				{example_nx: '<code>/example.com/</code>', nxdomain: '<code>NXDOMAIN</code>'}) + '<br />' +
			customi18n(_('{any_domain} matches any domain (and returns {nxdomain}).',
				'hint: <code>/#/</code> matches any domain (and returns NXDOMAIN).'),
				{any_domain:'<code>/#/</code>', nxdomain: '<code>NXDOMAIN</code>'}) + '<br />' +
			customi18n(
				_('{example_null} returns {null_addr} addresses ({null_ipv4}, {null_ipv6}) for {example_com} and its subdomains.',
					'hint: <code>/example.com/#</code> returns NULL addresses (<code>0.0.0.0</code>, <code>::</code>) for example.com and its subdomains.'),
				{	example_null: '<code>/example.com/#</code>',
					null_addr: '<code>NULL</code>', 
					null_ipv4: '<code>0.0.0.0</code>',
					null_ipv6: '<code>::</code>',
					example_com: '<code>example.com</code>',
				}
			)
		);
		o.optional = true;
		o.placeholder = '/router.local/router.lan/192.168.0.1';

		o = s.taboption('general', form.DynamicList, 'ipset',
			_('IP sets'),
			_('List of IP sets to populate with the IPs of DNS lookup results of the FQDNs also specified here.'));
		o.optional = true;
		o.placeholder = '/example.org/ipset,ipset6';


		o = s.taboption('logging', form.Flag, 'quietdhcp',
			_('Suppress logging'),
			_('Suppress logging of the routine operation for the DHCP protocol.'));
		o.optional = true;
		o.depends('logdhcp', '0');

		o = s.taboption('general', form.Flag, 'sequential_ip',
			_('Allocate IPs sequentially'),
			_('Allocate IP addresses sequentially, starting from the lowest available address.'));
		o.optional = true;

		o = s.taboption('forward', form.Flag, 'allservers',
			_('All Servers'),
			_('Query all available upstream resolvers.') + ' ' + _('First answer wins.'));
		o.optional = true;

		o = s.taboption('pxe_tftp', form.Flag, 'enable_tftp',
			_('Enable TFTP server'),
			_('Enable the built-in single-instance TFTP server.'));
		o.optional = true;

		o = s.taboption('pxe_tftp', form.Value, 'tftp_root',
			_('TFTP server root'),
			_('Root directory for files served via TFTP. <em>Enable TFTP server</em> and <em>TFTP server root</em> turn on the TFTP server and serve files from <em>TFTP server root</em>.'));
		o.depends('enable_tftp', '1');
		o.optional = true;
		o.placeholder = '/';

		o = s.taboption('pxe_tftp', form.Value, 'dhcp_boot',
			_('Network boot image'),
			_('Filename of the boot image advertised to clients.'));
		o.depends('enable_tftp', '1');
		o.optional = true;

		return m.render();
	}
});
