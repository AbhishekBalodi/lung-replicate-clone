import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ambulance, Calendar, FileText, User, Wrench, Settings, ArrowLeft, Clock, MapPin, Fuel, Gauge } from 'lucide-react';

// Mock ambulance data
const mockAmbulanceData = {
  'AMB-001': {
    id: 'AMB-001',
    registration: 'XYZ-1234',
    model: 'Toyota HiAce',
    year: '2021',
    type: 'Basic Life Support',
    status: 'Available',
    driver: 'Michael Johnson',
    location: 'Main Hospital',
    purchaseDate: '2021-03-15',
    insuranceExpiry: '2024-03-15',
    fuelType: 'Diesel',
    mileage: '15,230 km',
    capacity: '2 stretchers, 4 seated',
    lastMaintenance: '2023-03-20',
    nextMaintenance: '2023-06-20',
    lastUpdated: 'Today, 9:30 AM',
    assignedSince: 'January 15, 2023',
    totalCalls: 56,
    callsThisMonth: 8,
    totalDistance: '15,230 km',
    avgResponseTime: '7.8 min',
    fuelEfficiency: '10.2 L/100km',
  },
  'AMB-002': {
    id: 'AMB-002',
    registration: 'ABC-5678',
    model: 'Mercedes Sprinter',
    year: '2022',
    type: 'Advanced Life Support',
    status: 'Available',
    driver: 'Sarah Wilson',
    location: 'East Wing',
    purchaseDate: '2022-01-15',
    insuranceExpiry: '2024-01-15',
    fuelType: 'Diesel',
    mileage: '12,450 km',
    capacity: '2 stretchers, 3 seated',
    lastMaintenance: '2023-04-02',
    nextMaintenance: '2023-07-02',
    lastUpdated: 'Today, 9:30 AM',
    assignedSince: 'April 1, 2023',
    totalCalls: 42,
    callsThisMonth: 4,
    totalDistance: '12,450 km',
    avgResponseTime: '8.2 min',
    fuelEfficiency: '9.8 L/100km',
  },
};

// Mock maintenance history
const mockMaintenanceHistory = [
  { id: 'M001', date: '2023-04-02', type: 'Regular Service', description: 'Oil change, filter replacement, brake inspection', technician: 'John Mechanic', cost: '$350', status: 'Completed' },
  { id: 'M002', date: '2023-01-10', type: 'Tire Replacement', description: 'Replaced all four tires with winter tires', technician: 'Mike Tire', cost: '$800', status: 'Completed' },
  { id: 'M003', date: '2022-10-15', type: 'Regular Service', description: 'Oil change, filter replacement, general check', technician: 'John Mechanic', cost: '$320', status: 'Completed' },
  { id: 'M004', date: '2022-07-20', type: 'AC Repair', description: 'Fixed air conditioning system, replaced compressor', technician: 'Tom HVAC', cost: '$450', status: 'Completed' },
];

// Mock equipment list
const mockEquipment = [
  { name: 'Defibrillator', quantity: 1, lastChecked: '2023-04-15', status: 'Working' },
  { name: 'Oxygen Cylinder', quantity: 2, lastChecked: '2023-04-15', status: 'Working' },
  { name: 'First Aid Kit', quantity: 2, lastChecked: '2023-04-15', status: 'Working' },
  { name: 'Stretcher', quantity: 2, lastChecked: '2023-04-15', status: 'Working' },
  { name: 'Suction Unit', quantity: 1, lastChecked: '2023-04-15', status: 'Working' },
  { name: 'IV Set', quantity: 5, lastChecked: '2023-04-15', status: 'Working' },
  { name: 'Spine Board', quantity: 1, lastChecked: '2023-04-15', status: 'Working' },
];

// Mock call assignments
const mockCallAssignments = [
  { id: 'AC045', date: '2023-04-22', time: '08:30 AM', patient: 'John Doe', location: '123 Main St', reason: 'Chest Pain', responseTime: '6 min', status: 'Completed' },
  { id: 'AC039', date: '2023-04-20', time: '02:15 PM', patient: 'Sarah Parker', location: '456 Oak Ave', reason: 'Accident', responseTime: '8 min', status: 'Completed' },
  { id: 'AC032', date: '2023-04-18', time: '11:00 AM', patient: 'Mike Brown', location: '789 Pine Rd', reason: 'Fall Injury', responseTime: '7 min', status: 'Completed' },
  { id: 'AC028', date: '2023-04-15', time: '09:45 AM', patient: 'Emily White', location: '321 Elm St', reason: 'Breathing Issues', responseTime: '9 min', status: 'Completed' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Available':
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Available</Badge>;
    case 'On Call':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">On Call</Badge>;
    case 'Maintenance':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Maintenance</Badge>;
    case 'Completed':
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
    case 'Working':
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Working</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function AmbulanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const ambulance = mockAmbulanceData[id as keyof typeof mockAmbulanceData] || mockAmbulanceData['AMB-002'];

  return (
    <ConsoleShell>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/ambulances/list')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Ambulances
            </Button>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-2xl font-semibold text-foreground">{ambulance.id}</h1>
            {getStatusBadge(ambulance.status)}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Schedule Maintenance
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Update Status
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-2xl font-bold text-foreground mt-1">{ambulance.status}</p>
                <p className="text-xs text-muted-foreground mt-1">Last updated: {ambulance.lastUpdated}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Ambulance className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Maintenance</p>
                <p className="text-2xl font-bold text-foreground mt-1">{ambulance.lastMaintenance}</p>
                <p className="text-xs text-muted-foreground mt-1">Next: {ambulance.nextMaintenance}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold text-foreground mt-1">{ambulance.totalCalls}</p>
                <p className="text-xs text-muted-foreground mt-1">{ambulance.callsThisMonth} calls this month</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Driver</p>
                <p className="text-2xl font-bold text-foreground mt-1">{ambulance.driver}</p>
                <p className="text-xs text-muted-foreground mt-1">Assigned since: {ambulance.assignedSince}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="call-assignments">Call Assignments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Ambulance Overview</h3>
              <p className="text-muted-foreground text-sm mb-6">General information and specifications</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Information */}
                <div>
                  <h4 className="font-medium text-foreground mb-4">General Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-medium">{ambulance.id}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Registration:</span>
                      <span className="font-medium">{ambulance.registration}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Model:</span>
                      <span className="font-medium">{ambulance.model}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Year:</span>
                      <span className="font-medium">{ambulance.year}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{ambulance.type}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Purchase Date:</span>
                      <span className="font-medium">{ambulance.purchaseDate}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Insurance Expiry:</span>
                      <span className="font-medium">{ambulance.insuranceExpiry}</span>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div>
                  <h4 className="font-medium text-foreground mb-4">Technical Specifications</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Fuel Type:</span>
                      <span className="font-medium">{ambulance.fuelType}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Mileage:</span>
                      <span className="font-medium">{ambulance.mileage}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="font-medium">{ambulance.capacity}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Current Location:</span>
                      <span className="font-medium">{ambulance.location}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Current Driver:</span>
                      <span className="font-medium">{ambulance.driver}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Last Maintenance:</span>
                      <span className="font-medium">{ambulance.lastMaintenance}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Next Maintenance:</span>
                      <span className="font-medium">{ambulance.nextMaintenance}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="mt-8">
                <h4 className="font-medium text-foreground mb-4">Usage Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-5 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Distance</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{ambulance.totalDistance}</p>
                        <p className="text-xs text-emerald-600 mt-1">+450 km this month</p>
                      </div>
                      <Gauge className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </Card>

                  <Card className="p-5 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Average Response Time</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{ambulance.avgResponseTime}</p>
                        <p className="text-xs text-emerald-600 mt-1">-0.5 min from last month</p>
                      </div>
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </Card>

                  <Card className="p-5 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Fuel Efficiency</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{ambulance.fuelEfficiency}</p>
                        <p className="text-xs text-muted-foreground mt-1">Within normal range</p>
                      </div>
                      <Fuel className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Maintenance History</h3>
              <p className="text-muted-foreground text-sm mb-6">Record of all maintenance activities</p>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMaintenanceHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.id}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.type}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{record.description}</TableCell>
                        <TableCell>{record.technician}</TableCell>
                        <TableCell>{record.cost}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Equipment List</h3>
              <p className="text-muted-foreground text-sm mb-6">All equipment in this ambulance</p>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipment Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Last Checked</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockEquipment.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.lastChecked}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Call Assignments Tab */}
          <TabsContent value="call-assignments" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Call Assignments</h3>
              <p className="text-muted-foreground text-sm mb-6">Recent calls assigned to this ambulance</p>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Call ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCallAssignments.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">{call.id}</TableCell>
                        <TableCell>
                          <div>{call.date}</div>
                          <div className="text-sm text-muted-foreground">{call.time}</div>
                        </TableCell>
                        <TableCell>{call.patient}</TableCell>
                        <TableCell>{call.location}</TableCell>
                        <TableCell>{call.reason}</TableCell>
                        <TableCell>{call.responseTime}</TableCell>
                        <TableCell>{getStatusBadge(call.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ConsoleShell>
  );
}
