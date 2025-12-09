include $(TOPDIR)/rules.mk

PKG_NAME:=rs485-mqtt-bridge
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

PKG_BUILD_DEPENDS:=rust/host

include $(INCLUDE_DIR)/package.mk
include $(TOPDIR)/feeds/packages/lang/rust/rust-package.mk

define Package/rs485-mqtt-bridge
	SECTION:=net
	CATEGORY:=Network
	TITLE:=RS485 to MQTT Bridge (Rust)
	URL:=https://github.com/seeed
	DEPENDS:=+libc +libstdcpp +lorawan-gateway +libuci +libopenssl
endef

define Package/rs485-mqtt-bridge/description
	Bidirectional bridge between RS485 serial port and MQTT broker.
	Written in Rust with rumqttc for async MQTT communication.
	Uplink: RS485 data wrapped in JSON {"data":"..."}.
	Downlink: MQTT JSON {"data":"..."} converted to raw bytes.
	Reads configuration from UCI (/etc/config/lorawan-gateway).
endef

define Build/Prepare
	$(call Build/Prepare/Default)
	$(CP) ./Cargo.toml $(PKG_BUILD_DIR)/
	mkdir -p $(PKG_BUILD_DIR)/src
	$(CP) ./src/main.rs $(PKG_BUILD_DIR)/src/
endef

define Package/rs485-mqtt-bridge/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/bin/rs485-mqtt-bridge $(1)/usr/bin/

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/rs485-mqtt-bridge.init $(1)/etc/init.d/rs485-mqtt-bridge
endef

define Package/rs485-mqtt-bridge/postinst
	#!/bin/sh
	[ -n "$$IPKG_INSTROOT" ] || {
	/etc/init.d/rs485-mqtt-bridge enable
	/etc/init.d/rs485-mqtt-bridge start
	}
	exit 0
endef

define Package/rs485-mqtt-bridge/prerm
	#!/bin/sh
	[ -n "$$IPKG_INSTROOT" ] || {
	/etc/init.d/rs485-mqtt-bridge stop
	/etc/init.d/rs485-mqtt-bridge disable
	}
	exit 0
endef

$(eval $(call RustBinPackage,rs485-mqtt-bridge))
$(eval $(call BuildPackage,rs485-mqtt-bridge))
