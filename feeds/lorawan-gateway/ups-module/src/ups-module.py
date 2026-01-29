#!/usr/bin/env python3

import time
import subprocess
import shlex
import os
from datetime import datetime
import gpiod
from gpiod.line import Direction, Bias, Edge

class Logger:
    """Logger class for UPS module"""
    def __init__(self, log_file="/tmp/ups/log"):
        self.log_file = log_file
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        
    def log(self, message):
        """Log message to both stdout and file"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_line = f"[{timestamp}]: {message}\n"
        print(log_line, end='')
        
        try:
            with open(self.log_file, 'a') as f:
                f.write(log_line)
                f.flush()
        except Exception as e:
            print(f"Failed to write to log file: {e}")

def uci_get(config, section, option):
    """Get UCI configuration value"""
    try:
        result = subprocess.run(
            ['uci', 'get', f'{config}.{section}.{option}'],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        raise Exception(f"uci get failed: {config}.{section}.{option}")

def load_config():
    """Load UPS configuration from UCI"""
    commands = []
    try:
        # Use uci export to get proper list format
        result = subprocess.run(
            ['sh', '-c', "uci -q get ups-module.cmd.commands"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0 and result.stdout.strip():
            commands = shlex.split(result.stdout.strip())
    except Exception:
        pass
    
    return commands

def execute_commands(commands, logger):
    """Execute power outage commands"""
    for index, cmd in enumerate(commands, 1):
        try:
            result = subprocess.run(
                ['sh', '-c', cmd],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                if result.stdout.strip():
                    logger.log(f"{result.stdout.strip()}")
            else:
                if result.stderr.strip():
                    logger.log(f"{result.stderr.strip()}")
        except Exception as e:
            logger.log(f"Failed to execute command {index}: {e}")

def main():
    """Main entry point"""
    logger = Logger()
    
    try:
        # Load GPIO configuration from UCI
        ups_gpio_chip = uci_get('hardware', 'hardware', 'ups_gpio_chip')
        ups_gpio_line = int(uci_get('hardware', 'hardware', 'ups_gpio_line'))

        # Open GPIO chip and configure line
        with gpiod.request_lines(
            path = ups_gpio_chip,
            consumer = "ups-module",
            config={
                ups_gpio_line: gpiod.LineSettings(
                    direction=Direction.INPUT,
                    bias=Bias.PULL_UP,
                    edge_detection=Edge.FALLING
                )
            }
        )as line_request:
            logger.log("UPS monitoring started...")
            while True:
                if line_request.wait_edge_events(timeout=None):
                    logger.log("Power outage detected! Starting command execution...")
                    commands = load_config()
                    if commands:
                        execute_commands(commands, logger)                
                        time.sleep(60)
            
    except KeyboardInterrupt:
        logger.log("UPS monitoring stopped by user")
    except Exception as e:
        logger.log(f"Fatal error: {e}")
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())
