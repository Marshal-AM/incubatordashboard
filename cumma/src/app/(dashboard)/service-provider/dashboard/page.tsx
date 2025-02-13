'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { getServiceProviderProfile } from '@/lib/actions/service-provider'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface DashboardData {
  kpis: {
    totalFacilities: number
    thisMonth: number
    totalBookings: number
    monthlyBookings: number
    totalEarnings: number
    monthlyComparison: number
  }
  monthlyPayouts: Array<{
    month: string
    amount: number
  }>
  startupsByType: Array<{
    month: string
    'individual-cabin'?: number
    'coworking-spaces'?: number
    'meeting-rooms'?: number
    'bio-allied-labs'?: number
    'manufacturing-labs'?: number
    'prototyping-labs'?: number
    'software'?: number
    'saas-allied'?: number
    'raw-space-office'?: number
    'raw-space-lab'?: number
  }>
}

const facilityTypeColors = {
  'individual-cabin': '#FCD34D',
  'coworking-spaces': '#22C55E',
  'meeting-rooms': '#60A5FA',
  'bio-allied-labs': '#EC4899',
  'manufacturing-labs': '#8B5CF6',
  'prototyping-labs': '#F97316',
  'software': '#06B6D4',
  'saas-allied': '#14B8A6',
  'raw-space-office': '#6366F1',
  'raw-space-lab': '#D946EF'
}

const facilityTypeNames = {
  'individual-cabin': 'Individual Cabin',
  'coworking-spaces': 'Coworking Spaces',
  'meeting-rooms': 'Meeting Rooms',
  'bio-allied-labs': 'Bio Allied Labs',
  'manufacturing-labs': 'Manufacturing Labs',
  'prototyping-labs': 'Prototyping Labs',
  'software': 'Software',
  'saas-allied': 'SAAS Allied',
  'raw-space-office': 'Raw Space (Office)',
  'raw-space-lab': 'Raw Space (Lab)'
}

export default function ServiceProviderDashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('monthly-payouts')
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.userType === 'Service Provider') {
        const result = await getServiceProviderProfile()
        if (result.success) {
          setProfile(result.data)
        }
      }
    }

    fetchProfile()
  }, [session])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch dashboard data')
        }
        
        setData(result)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `${(value / 100000).toFixed(1)}L`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`
    }
    return value.toString()
  }

  // Get all facility types that have data
  const activeTypes = Object.keys(facilityTypeNames).filter(type => 
    data.startupsByType.some(month => {
      const value = month[type as keyof typeof month]
      return typeof value === 'number' && value > 0
    })
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Hello, {profile?.serviceName || 'Service Provider'}!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We are glad to see you again
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Total Facilities</p>
          <p className="text-2xl font-semibold">{data.kpis.totalFacilities}</p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="text-2xl font-semibold">{data.kpis.thisMonth}</p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Total Bookings</p>
          <p className="text-2xl font-semibold">{data.kpis.totalBookings}</p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="text-2xl font-semibold">{formatCurrency(data.kpis.monthlyBookings)}</p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Total Earnings</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold">{formatCurrency(data.kpis.totalEarnings)}</p>
            <div className={`flex items-center gap-1 text-sm ${data.kpis.monthlyComparison >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.kpis.monthlyComparison >= 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              <span>{Math.abs(data.kpis.monthlyComparison)}%</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground bg-black text-white px-2 py-1 rounded w-fit">
            {new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}
          </div>
        </Card>
      </div>

      {/* Graphs Section */}
      <div className="bg-white rounded-lg p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="monthly-payouts">Monthly Payouts</TabsTrigger>
            <TabsTrigger value="startups">No. Of Bookings</TabsTrigger>
            <TabsTrigger value="comparison">Facility Type Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly-payouts" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyPayouts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Bar dataKey="amount" fill="#22C55E" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="startups" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.startupsByType}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {activeTypes.map(type => (
                  <Bar 
                    key={type}
                    dataKey={type}
                    name={facilityTypeNames[type as keyof typeof facilityTypeNames]}
                    fill={facilityTypeColors[type as keyof typeof facilityTypeColors]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="comparison" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={[data.startupsByType[data.startupsByType.length - 1]]} 
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="month" hide />
                <Tooltip />
                <Legend />
                {activeTypes.map(type => (
                  <Bar 
                    key={type}
                    dataKey={type}
                    name={facilityTypeNames[type as keyof typeof facilityTypeNames]}
                    fill={facilityTypeColors[type as keyof typeof facilityTypeColors]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 