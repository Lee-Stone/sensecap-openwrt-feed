all: hardware_info

hardware_info: hardware_info.c
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

clean:
	rm -f hardware_info
