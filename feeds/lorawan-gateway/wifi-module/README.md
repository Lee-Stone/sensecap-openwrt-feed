# WiFi Configuration

This package enables automatic WiFi configuration of OpenWrt devices via USB flash drive:

## Configuration file format

Create a file named `WLAN.txt` in the root directory of the USB drive:

### AP Mode (Creating a Hotspot)

```
MODE=ap
AP_SSID=MyOpenWrt
AP_PASSWORD=12345678
```

### STA Mode (Connect to WiFi)

```
MODE=sta
STA_SSID=HomeWiFi
STA_PASSWORD=mywifipassword
```