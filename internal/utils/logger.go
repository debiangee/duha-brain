package utils

import (
	"fmt"
	"log"
	"os"
	"time"
)

// LogLevel defines log level
type LogLevel string

const (
	DEBUG LogLevel = "debug"
	INFO  LogLevel = "info"
	WARN  LogLevel = "warn"
	ERROR LogLevel = "error"
)

// Logger wraps standard library logger
type Logger struct {
	level  LogLevel
	format string
}

// New creates a new logger
func NewLogger(level string, format string) *Logger {
	logLevel := INFO
	if level == "debug" {
		logLevel = DEBUG
	} else if level == "warn" {
		logLevel = WARN
	} else if level == "error" {
		logLevel = ERROR
	}

	return &Logger{
		level:  logLevel,
		format: format,
	}
}

// Debug logs a debug message
func (l *Logger) Debug(msg string, fields ...interface{}) {
	if l.level == DEBUG {
		l.log("DEBUG", msg, fields...)
	}
}

// Info logs an info message
func (l *Logger) Info(msg string, fields ...interface{}) {
	if l.level == DEBUG || l.level == INFO {
		l.log("INFO", msg, fields...)
	}
}

// Warn logs a warning message
func (l *Logger) Warn(msg string, fields ...interface{}) {
	if l.level != ERROR {
		l.log("WARN", msg, fields...)
	}
}

// Error logs an error message
func (l *Logger) Error(msg string, fields ...interface{}) {
	l.log("ERROR", msg, fields...)
}

// log is the internal logging function
func (l *Logger) log(level string, msg string, fields ...interface{}) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")

	if l.format == "json" {
		// Simple JSON format
		fmt.Fprintf(os.Stdout, `{"timestamp":"%s","level":"%s","message":"%s"}`+"\n",
			timestamp, level, msg)
	} else {
		// Text format
		log.Printf("[%s] %s: %s", timestamp, level, msg)
	}
}
