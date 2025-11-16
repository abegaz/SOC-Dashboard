// src/lib/seedData.ts
import { createIncident, updateAnalystMetrics, createUser } from './db'

export function seedMockData() {
  console.log('🌱 Seeding mock data...')
  
  try {
    // Create some analyst users first
    const analysts = [
      { email: 'alice@soc.com', name: 'Alice Johnson', role: 'analyst' },
      { email: 'bob@soc.com', name: 'Bob Smith', role: 'analyst' },
      { email: 'charlie@soc.com', name: 'Charlie Davis', role: 'analyst' },
    ]
    
    const analystIds: number[] = []
    
    analysts.forEach(analyst => {
      try {
        const id = createUser(analyst.email, 'password123', analyst.name, analyst.role)
        analystIds.push(Number(id))
        console.log(`✅ Created analyst: ${analyst.name}`)
      } catch (error) {
        // User might already exist, skip
        console.log(`⚠️ Analyst ${analyst.email} already exists`)
      }
    })
    
    // Seed 15 incidents with realistic data
    const severities = ['critical', 'high', 'medium', 'low'] as const
    const statuses = ['open', 'investigating', 'resolved', 'closed'] as const
    const incidentTitles = [
      'Suspicious login from unknown IP',
      'Malware detected on endpoint',
      'Unauthorized access attempt',
      'Data exfiltration alert',
      'Phishing email detected',
      'DDoS attack in progress',
      'Privilege escalation attempt',
      'Brute force attack detected',
      'Ransomware signature found',
      'SQL injection attempt',
      'Cross-site scripting detected',
      'Certificate expiration warning',
      'Firewall rule violation',
      'Unusual network traffic',
      'Failed backup detected'
    ]
    
    for (let i = 0; i < 15; i++) {
      const detectedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      const detectionTime = Math.floor(Math.random() * 120) + 5
      const responseTime = Math.floor(Math.random() * 180) + 10
      const resolutionTime = Math.floor(Math.random() * 300) + 30
      
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const severity = severities[Math.floor(Math.random() * severities.length)]
      
      const respondedAt = new Date(detectedAt.getTime() + responseTime * 60000)
      const resolvedAt = (status === 'resolved' || status === 'closed') 
        ? new Date(respondedAt.getTime() + resolutionTime * 60000)
        : null
      
      createIncident({
        title: incidentTitles[i],
        severity,
        status,
        assigned_to: analystIds[i % analystIds.length] || 1,
        detected_at: detectedAt.toISOString(),
        responded_at: respondedAt.toISOString(),
        resolved_at: resolvedAt ? resolvedAt.toISOString() : undefined,
        detection_time: detectionTime,
        response_time: responseTime,
        resolution_time: (status === 'resolved' || status === 'closed') ? resolutionTime : undefined
      })
    }
    
    console.log('✅ Created 15 mock incidents')
    
    // Seed analyst metrics
    const metricsData = [
      { user_id: analystIds[0] || 2, incidents_handled: 45, avg_response_time: 22, success_rate: 92, skill_level: 4 },
      { user_id: analystIds[1] || 3, incidents_handled: 38, avg_response_time: 28, success_rate: 88, skill_level: 3 },
      { user_id: analystIds[2] || 4, incidents_handled: 52, avg_response_time: 18, success_rate: 95, skill_level: 5 },
    ]
    
    metricsData.forEach(metrics => {
      updateAnalystMetrics(metrics)
    })
    
    console.log('✅ Created analyst metrics')
    console.log('🎉 Mock data seeding complete!')
    
    return true
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    return false
  }
}