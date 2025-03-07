import fs from "fs"
import { isNil } from "lodash"
import { Knex } from "knex"
import Papa from "papaparse"

import { APP_ROOT } from "@/config"
import convertAmbiguousNullToActualNull from "@/utils/convert-ambiguous-null-to-actual-null"
import dbMigrationClient from "@/integrations/trav-com-integration/db/db-migration-client"
import { type SegmentNoHealthRaw } from "@/integrations/trav-com-integration/models"

export async function seed(_knex: Knex): Promise<void> {
  const fileName = `${APP_ROOT}/integrations/trav-com-integration/db/seeds/data/segments-no-health.csv`
  const fileContent = fs.readFileSync(fileName, "utf8")
  const { data: segmentsAttributes } = Papa.parse<SegmentNoHealthRaw>(fileContent, {
    header: true,
    skipEmptyLines: true,
  })

  for (const segmentAttributes of segmentsAttributes) {
    segmentAttributes.DepartureInfo = convertAmbiguousNullToActualNull(
      segmentAttributes.DepartureInfo
    )
    segmentAttributes.ArrivalInfo = convertAmbiguousNullToActualNull(segmentAttributes.ArrivalInfo)

    const existingSegment = await dbMigrationClient<SegmentNoHealthRaw>("segmentsNoHealth")
      .where({
        segmentID: segmentAttributes.segmentID,
      })
      .first()

    if (isNil(existingSegment)) {
      await dbMigrationClient<SegmentNoHealthRaw>("segmentsNoHealth").insert(segmentAttributes)
    } else {
      await dbMigrationClient<SegmentNoHealthRaw>("segmentsNoHealth")
        .where({
          segmentID: segmentAttributes.segmentID,
        })
        .update(segmentAttributes)
    }
  }
}
