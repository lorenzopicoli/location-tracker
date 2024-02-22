import sqlite3 from 'sqlite3'
import { Database } from 'sqlite'

export interface LocationEvent extends PlainLocationEvent {
  rowid: number
}

export interface PlainLocationEvent {
  accuracy: number
  altitude: number
  battery_level: number
  battery_status: number
  course_over_ground: number
  latitude: number
  longitude: number
  radius: number
  trigger_type: string
  tracker_id: string
  timestamp: number
  vertical_accuracy: number
  velocity: number
  barometric_pressure: number
  point_of_interest: string
  connectivity_status: string
  tag_name: string
  original_publish_topic: string
  wifi_ssid: string
  wifi_bssid: string
  message_creation_time: string
  monitoring_mode: number
}

export const saveToDatabase = async (
  db: Database<sqlite3.Database, sqlite3.Statement>,
  event: PlainLocationEvent
) => {
  const insertQuery = `
    INSERT INTO "location_events" (
        accuracy,
        altitude,
        battery_level,
        battery_status,
        course_over_ground,
        latitude,
        longitude,
        radius,
        trigger_type,
        tracker_id,
        timestamp,
        vertical_accuracy,
        velocity,
        barometric_pressure,
        point_of_interest,
        connectivity_status,
        tag_name,
        original_publish_topic,
        wifi_ssid,
        wifi_bssid,
        message_creation_time,
        monitoring_mode
    ) VALUES (
        $accuracy,
        $altitude,
        $battery_level,
        $battery_status,
        $course_over_ground,
        $latitude,
        $longitude,
        $radius,
        $trigger_type,
        $tracker_id,
        $timestamp,
        $vertical_accuracy,
        $velocity,
        $barometric_pressure,
        $point_of_interest,
        $connectivity_status,
        $tag_name,
        $original_publish_topic,
        $wifi_ssid,
        $wifi_bssid,
        $message_creation_time,
        $monitoring_mode
    );
  `
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const parameterizedData: any = {}
  for (const key in event) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    parameterizedData[`$${key}`] = (event as any)[key]
  }
  await db.run(insertQuery, parameterizedData)
}
