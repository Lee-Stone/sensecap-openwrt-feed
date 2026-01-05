include $(TOPDIR)/rules.mk

PKG_NAME:=rs485-modbus
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

PKG_BUILD_DEPENDS:=rust/host

include $(INCLUDE_DIR)/package.mk
include $(TOPDIR)/feeds/packages/lang/rust/rust-package.mk

define Package/rs485-modbus
	SECTION:=gateway
	CATEGORY:=Gateway
	TITLE:=RS485 to MQTT Bridge (Rust)
	URL:=https://github.com/seeed
	DEPENDS:=+libc +libstdcpp +libuci +libopenssl
endef

define Package/rs485-modbus/description
	Bidirectional bridge between RS485 serial port and MQTT broker.
	Written in Rust with rumqttc for async MQTT communication.
	Uplink: RS485 data wrapped in JSON {"data":"..."}.
	Downlink: MQTT JSON {"data":"..."} converted to raw bytes.
	Reads configuration from UCI (/etc/config/rs485-module).
endef

define Build/Prepare
	$(call Build/Prepare/Default)
	$(CP) ./Cargo.toml $(PKG_BUILD_DIR)/
	mkdir -p $(PKG_BUILD_DIR)/src
	$(CP) ./src/main.rs $(PKG_BUILD_DIR)/src/
endef

define Package/rs485-modbus/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/bin/rs485-modbus $(1)/usr/bin/

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/rs485-modbus.init $(1)/etc/init.d/rs485-modbus
endef

define Package/rs485-modbus/postinst
	#!/bin/sh
	[ -n "$$IPKG_INSTROOT" ] || {
	/etc/init.d/rs485-modbus enable
	/etc/init.d/rs485-modbus start
	}
	exit 0
endef

define Package/rs485-modbus/prerm
	#!/bin/sh
	[ -n "$$IPKG_INSTROOT" ] || {
	/etc/init.d/rs485-modbus stop
	/etc/init.d/rs485-modbus disable
	}
	exit 0
endef

$(eval $(call RustBinPackage,rs485-modbus))
$(eval $(call BuildPackage,rs485-modbus))
