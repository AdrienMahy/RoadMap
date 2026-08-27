/**
 * Seed script - Load roadmap-data-it-2026-2027.json into database
 * Structure: Project → Module → Stage → Point (4 levels)
 * Usage: npm run seed
 */

import { db } from '../db/index'
import { projects, modules, stages, points } from '../db/schema'
import * as fs from 'fs'

interface RoadmapData {
  roadmap: {
    name: string
    season: string
  }
  projects: Array<{
    name: string
    description: string
    stages: Array<{
      name: string
      status: 'planned' | 'in-progress' | 'completed' | 'on-hold'
      target: string
      points: string[]
    }>
  }>
}

async function seed() {
  console.log('🌱 Starting seed...\n')

  try {
    const jsonPath = '/app/roadmap-data-it-2026-2027.json'
    console.log(`📂 Looking for: ${jsonPath}`)
    
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`JSON file not found: ${jsonPath}`)
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8')
    const data: RoadmapData = JSON.parse(rawData)

    console.log(`📦 Loaded: ${data.roadmap.name} (${data.roadmap.season})`)
    console.log(`📊 Found: ${data.projects.length} projects\n`)

    let projectCount = 0
    let moduleCount = 0
    let stageCount = 0
    let pointCount = 0

    for (const projectData of data.projects) {
      const [projectResult] = await db
        .insert(projects)
        .values({
          name: projectData.name,
          description: projectData.description,
          status: 'planned',
        })
        .returning()

      projectCount++
      console.log(`✅ Project: ${projectData.name}`)

      const [moduleResult] = await db
        .insert(modules)
        .values({
          projectId: projectResult.id,
          name: `${projectData.name} Module`,
          description: `Module for ${projectData.name}`,
          status: 'planned',
          orderIndex: 0,
        })
        .returning()

      moduleCount++
      console.log(`  ├─ Module: ${moduleResult.name}`)

      for (let stageIndex = 0; stageIndex < projectData.stages.length; stageIndex++) {
        const stageData = projectData.stages[stageIndex]

        let deliveryDate: Date | null = null
        if (stageData.target) {
          const years = stageData.target.match(/\d{4}/g)
          if (years) {
            const year = years[years.length - 1]
            deliveryDate = new Date(`${year}-12-31`)
          }
        }

        const [stageResult] = await db
          .insert(stages)
          .values({
            moduleId: moduleResult.id,
            name: stageData.name,
            description: `Target: ${stageData.target}`,
            deliveryDate: deliveryDate,
            status: stageData.status,
            orderIndex: stageIndex,
          })
          .returning()

        stageCount++
        console.log(`  │  ├─ Stage: ${stageData.name}`)

        for (let pointIndex = 0; pointIndex < stageData.points.length; pointIndex++) {
          const pointName = stageData.points[pointIndex]

          await db
            .insert(points)
            .values({
              stageId: stageResult.id,
              name: pointName,
              description: '',
              completed: false,
              orderIndex: pointIndex,
            })

          pointCount++
          console.log(`  │  │  └─ Point: ${pointName}`)
        }
      }

      console.log()
    }

    console.log('\n✨ Seed completed!')
    console.log(`📈 Stats:`)
    console.log(`   • Projects: ${projectCount}`)
    console.log(`   • Modules: ${moduleCount}`)
    console.log(`   • Stages: ${stageCount}`)
    console.log(`   • Points: ${pointCount}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seed()
