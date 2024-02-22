import sqlite3 from 'sqlite3'
import { Database } from 'sqlite'
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import * as path from 'path'
import { PlainLocationEvent, saveToDatabase } from './db/locationEvent'

// Wrong and ugly, but whatever
const fastify = Fastify({
  logger: true,
})

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'static'),
  prefix: '',
})

export class LocationServer {
  private db: Database<sqlite3.Database, sqlite3.Statement>
  constructor(db: Database<sqlite3.Database, sqlite3.Statement>) {
    this.db = db
  }

  public listen() {
    fastify.get('/events', async (_request, reply) => {
      reply.send(await this.getAllData())
    })

    fastify.post('/events', async (request, reply) => {
      const { body } = request

      await this.recordEvent(body)
      reply.send(200)
    })

    fastify.listen({ host: '0.0.0.0', port: 3000 }, async (err) => {
      if (err) {
        fastify.log.error(err)
        process.exit(1)
      }
    })
  }

  private async recordEvent(body: unknown) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const typedBody = body as any

    const event: PlainLocationEvent = {
      accuracy: typedBody.acc,
      altitude: typedBody.alt,
      battery_level: typedBody.batt,
      battery_status: typedBody.bs,
      course_over_ground: typedBody.cog,
      latitude: typedBody.lat,
      longitude: typedBody.lon,
      radius: typedBody.rad,
      trigger_type: typedBody.t,
      tracker_id: typedBody.tid,
      timestamp: typedBody.tst,
      vertical_accuracy: typedBody.vac,
      velocity: typedBody.vel,
      barometric_pressure: typedBody.p,
      point_of_interest: typedBody.poi,
      connectivity_status: typedBody.conn,
      tag_name: typedBody.tag,
      original_publish_topic: typedBody.topic,
      wifi_ssid: typedBody.SSID,
      wifi_bssid: typedBody.BSSID,
      message_creation_time: typedBody.created_at,
      monitoring_mode: typedBody.m,
    }
    await saveToDatabase(this.db, event)
  }

  private async getAllData() {
    const data = await this.db.all(
      `SELECT
        battery_level,
        battery_status,
        latitude,
        longitude,
        connectivity_status,
        wifi_ssid,
        message_creation_time
        FROM location_events`
    )

    return data
  }
}
